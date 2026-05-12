// NLP Parser — extracts structured intent from natural language input

const DOMAIN_KEYWORDS = {
  child: ['baby', 'babysitter', 'nanny', 'child', 'kid', 'toddler', 'infant', 'newborn', 'son', 'daughter', 'twins', 'ADHD', 'autism', 'special needs', 'special-needs'],
  human: ['elder', 'elderly', 'old', 'senior', 'grandma', 'grandpa', 'grandmother', 'grandfather', 'father', 'mother', 'dementia', 'alzheimer', 'post-surgery', 'recovery', 'stroke', 'bedridden', 'diabetes', 'human', 'adult'],
  pet: ['pet', 'dog', 'cat', 'puppy', 'kitten', 'breed', 'German Shepherd', 'Labrador', 'Pomeranian', 'Rottweiler', 'Persian', 'Siamese', 'Shih Tzu', 'Doberman', 'anxiety', 'grooming'],
};

const URGENCY_KEYWORDS = {
  emergency: ['emergency', 'urgent', 'immediately', 'right now', 'asap', 'critical', 'SOS'],
  sameday: ['today', 'tonight', 'this evening', 'this morning', 'this afternoon', 'now', 'soon', 'within an hour'],
  scheduled: ['tomorrow', 'next week', 'schedule', 'plan', 'upcoming', 'weekend'],
};

const SPECIALIZATION_KEYWORDS = [
  'ADHD', 'autism', 'special needs', 'special-needs', 'behavioral',
  'dementia', 'alzheimer', 'post-surgery', 'stroke', 'bedridden', 'physiotherapy', 'diabetes',
  'night-shift', 'night shift', 'overnight', 'night', '24-hour', '24 hour',
  'newborn', 'infant', 'toddler', 'twins',
  'German Shepherd', 'Labrador', 'Pomeranian', 'Rottweiler', 'Persian', 'Siamese', 'Shih Tzu', 'Doberman',
  'anxiety', 'grooming', 'large breed', 'small breed',
  'first-aid', 'CPR', 'medication',
];

const TIME_PATTERNS = {
  morning: ['morning', 'am', 'before noon'],
  afternoon: ['afternoon', 'lunch', 'midday'],
  evening: ['evening', 'tonight', 'pm'],
  night: ['night', 'overnight', 'night-shift', 'night shift', 'late night'],
};

const LOCATION_NAMES = [
  'Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Madhapur', 'Kondapur',
  'Hitech City', 'Kukatpally', 'Ameerpet', 'Secunderabad', 'Begumpet',
  'Miyapur', 'Manikonda', 'Tolichowki', 'Sainikpuri', 'Dilsukhnagar',
];

export function parseInput(text) {
  const input = text.toLowerCase();
  const result = {
    domain: null,
    urgency: 'scheduled',
    specializations: [],
    timeSlot: null,
    budget: null,
    location: null,
    raw: text,
    missing: [],
  };

  // Domain detection
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (keywords.some((k) => input.includes(k.toLowerCase()))) {
      result.domain = domain;
      break;
    }
  }

  // Urgency detection
  for (const [level, keywords] of Object.entries(URGENCY_KEYWORDS)) {
    if (keywords.some((k) => input.includes(k.toLowerCase()))) {
      result.urgency = level;
      break;
    }
  }

  // Specialization extraction
  for (const spec of SPECIALIZATION_KEYWORDS) {
    if (input.includes(spec.toLowerCase())) {
      result.specializations.push(spec.toLowerCase());
    }
  }

  // Time slot detection
  for (const [slot, keywords] of Object.entries(TIME_PATTERNS)) {
    if (keywords.some((k) => input.includes(k.toLowerCase()))) {
      result.timeSlot = slot;
      break;
    }
  }

  // Budget extraction (Rs., ₹, or plain number with budget context)
  const budgetMatch = text.match(/(?:rs\.?\s*|₹\s*|budget\s*(?:is\s*)?(?:rs\.?\s*|₹\s*)?)(\d[\d,]*)/i);
  if (budgetMatch) {
    result.budget = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
  }

  // Location extraction
  for (const loc of LOCATION_NAMES) {
    if (input.includes(loc.toLowerCase())) {
      result.location = loc;
      break;
    }
  }

  // Identify missing fields
  if (!result.domain) result.missing.push('domain');
  if (!result.location) result.missing.push('location');
  if (!result.budget) result.missing.push('budget');

  return result;
}

export function getClarifyingQuestion(missing) {
  const questions = {
    domain: 'Which category are you applying for — Child, Human, or Pet? (One person can only apply for one category)',
    location: 'Which area or neighborhood are you located in?',
    budget: 'What is your budget for this session?',
    timeSlot: 'What time would you need the caregiver?',
  };
  return missing.length > 0 ? questions[missing[0]] : null;
}
