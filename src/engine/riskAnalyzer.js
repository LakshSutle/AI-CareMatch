// Risk Analyzer — detects and flags potential concerns in matches

export function analyzeRisks(caregiver, query) {
  const flags = [];

  // Low trust score
  if (caregiver.trustScore < 70) {
    flags.push({
      level: 'high',
      message: `Low confidence match — Trust Score is ${caregiver.trustScore}/100. We recommend waiting for a higher-trust option or proceeding with full awareness.`,
    });
  }

  // Missing verifications
  const missing = [];
  if (!caregiver.verification.faceLiveness) missing.push('live selfie');
  if (!caregiver.verification.govId) missing.push('Government ID');
  if (!caregiver.verification.digilocker) missing.push('ID upload match');
  if (!caregiver.verification.documentOCR) missing.push('document OCR');
  if (!caregiver.verification.policeClearance) missing.push('police clearance');
  if (!caregiver.verification.referenceCheck) missing.push('reference check');
  if (!caregiver.verification.medicalScreening) missing.push('medical screening');
  if (missing.length > 0) {
    const isHighRisk = missing.includes('Government ID') || missing.includes('police clearance');
    flags.push({
      level: isHighRisk ? 'high' : 'medium',
      message: `Missing verification: ${missing.join(', ')} not yet completed`,
    });
  }
  
  // Not Gov Verified
  if (!caregiver.govVerified) {
    flags.push({
      level: 'medium',
      message: 'Profile is not Verified — Government ID verification pending',
    });
  }

  // Night shift first-timer
  if (query.timeSlot === 'night' && !caregiver.availability.night) {
    flags.push({
      level: 'medium',
      message: 'Not available for night shifts — this caregiver has no night-shift availability',
    });
  } else if (query.timeSlot === 'night' && caregiver.availability.night) {
    // Check if they have limited night experience
    const nightKeywords = ['night', 'overnight', 'night-shift'];
    const hasNightExp = caregiver.specializations.some((s) =>
      nightKeywords.some((k) => s.toLowerCase().includes(k))
    );
    if (!hasNightExp) {
      flags.push({
        level: 'low',
        message: 'No prior night-shift bookings documented — this would be a first night session',
      });
    }
  }

  // High cancellation rate
  if (caregiver.stats.cancellationRate > 0.05) {
    flags.push({
      level: 'medium',
      message: `Higher than average cancellation rate (${Math.round(caregiver.stats.cancellationRate * 100)}%)`,
    });
  }

  // Low on-time rate
  if (caregiver.stats.onTimeRate < 0.9) {
    flags.push({
      level: 'medium',
      message: `On-time rate is ${Math.round(caregiver.stats.onTimeRate * 100)}% — below our 90% threshold`,
    });
  }

  // Budget exceeded
  if (query.budget && caregiver.pricing > query.budget * 1.2) {
    flags.push({
      level: 'medium',
      message: `Price (₹${caregiver.pricing}) exceeds your budget (₹${query.budget}) by more than 20%`,
    });
  }

  // Emergency without full verification
  if (query.urgency === 'emergency' && !caregiver.verified) {
    flags.push({
      level: 'high',
      message: 'Emergency request matched with partially verified caregiver — proceed with caution',
    });
  }

  return flags.length > 0
    ? flags
    : [{ level: 'none', message: 'No significant points to look after.' }];
}

export function isEmergency(text) {
  const emergencyKeywords = ['emergency', 'SOS', 'help', 'urgent', 'critical', 'ambulance', 'hospital', 'fell down', 'not breathing', 'unconscious'];
  return emergencyKeywords.some((k) => text.toLowerCase().includes(k.toLowerCase()));
}
