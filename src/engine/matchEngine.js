// Match Engine — 6-dimension weighted scoring model
import { caregivers } from '../data/caregivers';
import { getDistance, getTravelTime, findLocation } from '../data/locations';
import { generateExplanation, generateComparisonText } from './xaiEngine';
import { analyzeRisks } from './riskAnalyzer';

const WEIGHTS = {
  proximity: 0.15,
  availability: 0.20,
  experience: 0.25,
  verification: 0.15,
  reliability: 0.15,
  budgetFit: 0.10,
};

// Urgency multipliers for proximity weight
const URGENCY_MULTIPLIER = {
  emergency: 2.0,
  sameday: 1.5,
  scheduled: 1.0,
};

function scoreProximity(caregiver, query) {
  const userLoc = findLocation(query.location || '');
  if (!userLoc) return { score: 50, distance: null, travelMin: null }; // default mid-score if no location

  const dist = getDistance(userLoc.lat, userLoc.lng, caregiver.location.lat, caregiver.location.lng);
  const travelMin = getTravelTime(dist);

  // Score: 100 for <2km, decreasing to 0 for >20km
  let score = Math.max(0, Math.min(100, 100 - (dist / 20) * 100));

  // Urgency boost — proximity matters more for emergencies
  const urgencyMult = URGENCY_MULTIPLIER[query.urgency] || 1.0;
  score = Math.min(100, score * urgencyMult);

  return { score: Math.round(score), distance: Math.round(dist * 10) / 10, travelMin };
}

function scoreAvailability(caregiver, query) {
  if (!query.timeSlot) return { score: 70 }; // neutral if no slot specified

  const slotMap = {
    morning: caregiver.availability.morning,
    afternoon: caregiver.availability.afternoon,
    evening: caregiver.availability.evening,
    night: caregiver.availability.night,
  };

  const available = slotMap[query.timeSlot];
  if (!available) return { score: 10 };

  // Bonus for weekend availability if needed
  let score = 80;
  if (caregiver.availability.weekends) score += 10;

  // Historical reliability bonus
  if (caregiver.stats.onTimeRate > 0.95) score += 10;

  return { score: Math.min(100, score) };
}

function scoreExperience(caregiver, query) {
  // Domain match
  if (query.domain && caregiver.domain !== query.domain) return { score: 0 };

  let score = 40; // base domain match

  // Specialization matching
  if (query.specializations.length > 0) {
    const matched = query.specializations.filter((s) =>
      caregiver.specializations.some((cs) => cs.toLowerCase().includes(s.toLowerCase()))
    );
    const matchRatio = matched.length / query.specializations.length;
    score += matchRatio * 40;
  } else {
    score += 20; // no specific requirements = generic boost
  }

  // Session volume bonus
  if (caregiver.stats.totalSessions > 300) score += 15;
  else if (caregiver.stats.totalSessions > 100) score += 10;
  else score += 5;

  // Rating bonus
  if (caregiver.stats.avgRating >= 4.8) score += 5;

  return { score: Math.min(100, Math.round(score)) };
}

function scoreVerification(caregiver) {
  const checks = caregiver.verification;
  
  // Core verifications (weighted)
  let score = 0;
  if (checks.faceLiveness) score += 10;
  if (checks.documentOCR) score += 10;
  if (checks.policeClearance) score += 15;
  if (checks.referenceCheck) score += 10;
  
  // New Gov verification (higher weight)
  if (checks.govId) score += 20;
  if (checks.liveSelfie) score += 10;
  if (checks.digilocker) score += 15;
  if (checks.medicalScreening) score += 10;

  // Gov Verified bonus
  if (caregiver.govVerified) score = Math.min(100, score + 5);

  const total = [checks.faceLiveness, checks.documentOCR, checks.policeClearance, checks.referenceCheck, checks.govId, checks.liveSelfie, checks.digilocker, checks.medicalScreening];
  const passed = total.filter(Boolean).length;

  return { score: Math.min(100, score), passed, total: 8 };
}

function scoreReliability(caregiver) {
  const { onTimeRate, cancellationRate, completionRate } = caregiver.stats;
  const score = (onTimeRate * 40 + (1 - cancellationRate) * 30 + completionRate * 30);
  return { score: Math.round(score) };
}

function scoreBudgetFit(caregiver, query) {
  if (!query.budget) return { score: 70 }; // neutral if no budget

  const ratio = caregiver.pricing / query.budget;

  if (ratio <= 0.8) return { score: 100 }; // well under budget
  if (ratio <= 1.0) return { score: 90 };   // within budget
  if (ratio <= 1.1) return { score: 70 };   // slightly over
  if (ratio <= 1.3) return { score: 40 };   // moderately over
  return { score: 10 };                      // way over budget
}

export function matchCaregivers(query) {
  const domainFiltered = caregivers.filter((cg) => !query.domain || cg.domain === query.domain);

  // Smart Fallback — if no domain matches, show all caregivers with explanation
  const pool = domainFiltered.length > 0 ? domainFiltered : caregivers;
  const isFallback = domainFiltered.length === 0;

  const results = pool
    .map((caregiver) => {
      const proxResult = scoreProximity(caregiver, query);
      const availResult = scoreAvailability(caregiver, query);
      const expResult = scoreExperience(caregiver, query);
      const verResult = scoreVerification(caregiver);
      const relResult = scoreReliability(caregiver);
      const budResult = scoreBudgetFit(caregiver, query);

      const scores = {
        proximity: proxResult.score,
        availability: availResult.score,
        experience: expResult.score,
        verification: verResult.score,
        reliability: relResult.score,
        budgetFit: budResult.score,
      };

      const matchScore = Math.round(
        scores.proximity * WEIGHTS.proximity +
        scores.availability * WEIGHTS.availability +
        scores.experience * WEIGHTS.experience +
        scores.verification * WEIGHTS.verification +
        scores.reliability * WEIGHTS.reliability +
        scores.budgetFit * WEIGHTS.budgetFit
      );

      // Confidence Indicator — how certain we are about this match
      const scoreDimensions = Object.values(scores);
      const avgScore = scoreDimensions.reduce((a, b) => a + b, 0) / scoreDimensions.length;
      const variance = scoreDimensions.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scoreDimensions.length;
      const queryCompleteness = [query.domain, query.location, query.budget, query.timeSlot, query.specializations?.length > 0].filter(Boolean).length / 5;
      const confidence = Math.min(99, Math.round(avgScore * 0.5 + (100 - Math.sqrt(variance)) * 0.3 + queryCompleteness * 100 * 0.2));

      // Availability Prediction
      let availabilityPrediction = null;
      if (caregiver.activeJobUntil) {
        const freeAt = new Date(caregiver.activeJobUntil);
        if (freeAt > new Date()) {
          availabilityPrediction = `Likely free after ${freeAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
      }

      return {
        caregiver,
        matchScore,
        trustScore: caregiver.trustScore,
        scores,
        distance: proxResult.distance,
        travelMin: proxResult.travelMin,
        reasons: generateExplanation(caregiver, query, scores),
        riskFlags: analyzeRisks(caregiver, query),
        confidence,
        availabilityPrediction,
        isFallback,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  if (results.length === 0) return { primary: null, alternative: null, all: [], budgetTip: null, surgeWarning: null };

  const primary = results[0];
  const alternative = results.length > 1 ? results[1] : null;

  if (primary && alternative) {
    alternative.comparisonText = generateComparisonText(primary.caregiver, alternative.caregiver);
  }

  // Budget Optimisation — tell user what a higher budget unlocks
  let budgetTip = null;
  if (query.budget) {
    const betterMatches = caregivers.filter(cg =>
      (!query.domain || cg.domain === query.domain) &&
      cg.pricing > query.budget &&
      cg.pricing <= query.budget * 1.5 &&
      cg.trustScore > (primary?.trustScore || 0)
    );
    if (betterMatches.length > 0) {
      const minExtra = Math.min(...betterMatches.map(c => c.pricing)) - query.budget;
      budgetTip = `₹${minExtra} more unlocks ${betterMatches.length} higher-rated caregiver${betterMatches.length > 1 ? 's' : ''} with better Trust Scores`;
    }
  }

  // Surge Awareness — check how many caregivers are currently on active jobs
  const busyCount = pool.filter(cg => cg.activeJobUntil && new Date(cg.activeJobUntil) > new Date()).length;
  const surgeWarning = busyCount >= Math.ceil(pool.length * 0.5)
    ? `High demand: ${busyCount}/${pool.length} caregivers currently on active jobs. Consider booking in advance.`
    : null;

  return { primary, alternative, all: results, budgetTip, surgeWarning };
}

