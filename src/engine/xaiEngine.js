// XAI Engine — generates human-readable explanations for match results

export function generateExplanation(caregiver, query, scores) {
  const reasons = [];
  const { specializations, budget, location } = query;

  // Domain experience reason
  const matchedSpecs = specializations.filter((s) =>
    caregiver.specializations.some((cs) => cs.toLowerCase().includes(s.toLowerCase()))
  );
  if (matchedSpecs.length > 0) {
    const years = Math.floor(caregiver.stats.totalSessions / 60);
    reasons.push(
      `${years}+ years experience with specific expertise in ${matchedSpecs.join(', ').toUpperCase()}`
    );
  } else {
    reasons.push(`${caregiver.domain} specialist with ${caregiver.stats.totalSessions} completed sessions`);
  }

  // Availability reason
  if (scores.availability > 80) {
    reasons.push('Available for your requested time slot with strong scheduling reliability');
  } else if (scores.availability > 50) {
    reasons.push('Partially available — may need schedule adjustment');
  }

  // Verification reason
  const verChecks = Object.values(caregiver.verification).filter(Boolean).length;
  if (caregiver.govVerified) {
    reasons.push(`Verified — ${verChecks}/8 checks passed including Gov ID, identity upload, and medical screening`);
  } else if (verChecks >= 6) {
    reasons.push(`${verChecks}/8 verification checks passed — Gov ID verification pending`);
  } else {
    reasons.push(`${verChecks}/8 verification checks passed`);
  }

  // Reliability reason
  const onTime = Math.round(caregiver.stats.onTimeRate * 100);
  const cancel = caregiver.stats.cancellationRate;
  if (onTime >= 95) {
    reasons.push(`${onTime}% on-time rate, ${cancel === 0 ? 'zero' : Math.round(cancel * 100) + '%'} cancellations in recent history`);
  }

  // Budget reason
  if (budget) {
    if (caregiver.pricing <= budget) {
      reasons.push(`₹${caregiver.pricing}/${caregiver.pricingUnit} (₹${caregiver.dailyCost}/day) — within your ₹${budget} budget`);
    } else {
      reasons.push(`₹${caregiver.pricing}/${caregiver.pricingUnit} (₹${caregiver.dailyCost}/day) — ₹${caregiver.pricing - budget} above your budget`);
    }
  }

  // Proximity reason
  if (scores.proximity > 80) {
    reasons.push(`Located close to ${location || 'your area'} with quick travel time`);
  }

  return reasons.slice(0, 5);
}

export function generateComparisonText(primary, alternative) {
  const diffs = [];

  if (alternative.trustScore > primary.trustScore) {
    diffs.push(`higher Trust Score (${alternative.trustScore} vs ${primary.trustScore})`);
  }
  if (alternative.pricing < primary.pricing) {
    diffs.push(`more affordable (₹${alternative.pricing} vs ₹${primary.pricing})`);
  }
  if (alternative.stats.totalSessions > primary.stats.totalSessions) {
    diffs.push('more experience');
  }

  const nightPrimary = primary.availability.night;
  const nightAlt = alternative.availability.night;
  if (!nightPrimary && nightAlt) {
    diffs.push('confirmed night-shift availability');
  }

  if (diffs.length === 0) {
    diffs.push('a different specialization profile worth considering');
  }

  return `${alternative.name} — ${diffs.join(', ')}`;
}
