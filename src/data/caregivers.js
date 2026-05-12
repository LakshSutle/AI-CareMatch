// Generate unique caregiver photo URL
const cgPhoto = (name, gender) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=${gender === 'Female' ? 'c084fc' : '60a5fa'}&color=fff&bold=true&format=svg`;

export const caregivers = [
  // ───────────── 👶 CHILD CARE (4) ─────────────
  {
    id: 1, uniqueId: 'CG-10001', name: 'Priya Sharma', age: 28, gender: 'Female',
    domain: 'child', category: 'child', photo: cgPhoto('Priya Sharma', 'Female'),
    specializations: ['ADHD', 'autism', 'special-needs', 'behavioral therapy'],
    bio: '5 years in childcare with 3 years ADHD-specific work. Certified in behavioral support for neurodiverse children.',
    location: { name: 'Banjara Hills', lat: 17.4156, lng: 78.4347 },
    pricing: 450, pricingUnit: 'session', dailyCost: 1800,
    availability: { morning: true, afternoon: true, evening: true, night: false, weekends: true },
    verification: { faceLiveness: true, documentOCR: true, policeClearance: true, referenceCheck: true, govId: true, liveSelfie: true, digilocker: true, medicalScreening: true },
    govVerified: true,
    screeningStatus: 'approved', screeningRating: 5,
    activeJobUntil: null,
    stats: { totalSessions: 312, onTimeRate: 0.97, cancellationRate: 0.01, completionRate: 0.99, avgRating: 4.8 },
    trustScore: 88, verified: true,
    workHistory: [
      { location: 'Banjara Hills', date: '2026-05-08', duration: '4 hrs', status: 'completed' },
      { location: 'Jubilee Hills', date: '2026-05-06', duration: '3 hrs', status: 'completed' },
    ],
    reviews: [
      { family: 'Ananya R.', rating: 5, text: 'Priya understood my daughter\'s ADHD triggers immediately. Exceptional care.' },
      { family: 'Deepak M.', rating: 5, text: 'Very patient and structured. My son looks forward to her visits.' }
    ]
  },
  {
    id: 2, uniqueId: 'CG-10002', name: 'Meena Devi', age: 35, gender: 'Female',
    domain: 'child', category: 'child', photo: cgPhoto('Meena Devi', 'Female'),
    specializations: ['ADHD', 'night-shift', 'infant care', 'first-aid certified'],
    bio: '8 years experience including night shifts. Trained in infant CPR and first aid. Confirmed night-shift availability.',
    location: { name: 'Jubilee Hills', lat: 17.4325, lng: 78.4073 },
    pricing: 500, pricingUnit: 'session', dailyCost: 2000,
    availability: { morning: true, afternoon: true, evening: true, night: true, weekends: true },
    verification: { faceLiveness: true, documentOCR: true, policeClearance: true, referenceCheck: true, govId: true, liveSelfie: true, digilocker: true, medicalScreening: true },
    govVerified: true,
    screeningStatus: 'approved', screeningRating: 5,
    activeJobUntil: null,
    stats: { totalSessions: 487, onTimeRate: 0.98, cancellationRate: 0.005, completionRate: 0.995, avgRating: 4.9 },
    trustScore: 94, verified: true,
    workHistory: [
      { location: 'Jubilee Hills', date: '2026-05-09', duration: '4 hrs', status: 'completed' },
      { location: 'Banjara Hills', date: '2026-05-07', duration: '6 hrs', status: 'completed' },
    ],
    reviews: [
      { family: 'Priya K.', rating: 5, text: 'Meena is incredibly reliable for overnight stays. Lifesaver!' },
      { family: 'Sanjay T.', rating: 5, text: 'Best night-shift caregiver we\'ve ever had.' }
    ]
  },
  // ───────────── 🧑 HUMAN / ELDER CARE (4) ─────────────
  {
    id: 5, uniqueId: 'CG-10005', name: 'Suresh Babu', age: 42, gender: 'Male',
    domain: 'human', category: 'human', photo: cgPhoto('Suresh Babu', 'Male'),
    specializations: ['post-surgery recovery', 'physiotherapy assist', 'night-shift', 'medication management'],
    bio: '10 years elder care experience. Former hospital orderly with post-surgical rehabilitation training.',
    location: { name: 'Madhapur', lat: 17.4486, lng: 78.3908 },
    pricing: 600, pricingUnit: 'session', dailyCost: 2400,
    availability: { morning: true, afternoon: true, evening: true, night: true, weekends: true },
    verification: { faceLiveness: true, documentOCR: true, policeClearance: true, referenceCheck: true, govId: true, liveSelfie: true, digilocker: true, medicalScreening: true },
    govVerified: true,
    screeningStatus: 'approved', screeningRating: 5,
    activeJobUntil: null,
    stats: { totalSessions: 523, onTimeRate: 0.99, cancellationRate: 0.008, completionRate: 0.99, avgRating: 4.9 },
    trustScore: 95, verified: true,
    workHistory: [
      { location: 'Madhapur', date: '2026-05-09', duration: '4 hrs', status: 'in-progress' },
      { location: 'Gachibowli', date: '2026-05-07', duration: '8 hrs', status: 'completed' },
    ],
    reviews: [
      { family: 'Rajesh K.', rating: 5, text: 'Suresh managed my father\'s post-hip-surgery recovery perfectly.' },
      { family: 'Lakshmi N.', rating: 5, text: 'Professional, gentle, and extremely dependable.' }
    ]
  },
  {
    id: 6, uniqueId: 'CG-10006', name: 'Lakshmi Naidu', age: 38, gender: 'Female',
    domain: 'human', category: 'human', photo: cgPhoto('Lakshmi Naidu', 'Female'),
    specializations: ['dementia', 'alzheimers', 'cognitive exercises', '24-hour care'],
    bio: '7 years specializing in dementia and Alzheimer\'s care. Certified in cognitive stimulation therapy.',
    location: { name: 'Kondapur', lat: 17.4589, lng: 78.3631 },
    pricing: 700, pricingUnit: 'session', dailyCost: 2800,
    availability: { morning: true, afternoon: true, evening: true, night: true, weekends: true },
    verification: { faceLiveness: true, documentOCR: true, policeClearance: true, referenceCheck: true, govId: true, liveSelfie: true, digilocker: true, medicalScreening: true },
    govVerified: true,
    screeningStatus: 'approved', screeningRating: 4,
    activeJobUntil: null,
    stats: { totalSessions: 298, onTimeRate: 0.96, cancellationRate: 0.02, completionRate: 0.98, avgRating: 4.7 },
    trustScore: 91, verified: true,
    workHistory: [
      { location: 'Kondapur', date: '2026-05-08', duration: '4 hrs', status: 'completed' },
    ],
    reviews: [
      { family: 'Sunitha R.', rating: 5, text: 'Lakshmi\'s dementia care training is evident in every interaction.' }
    ]
  },
  // ───────────── 🐾 PET CARE (4) ─────────────
  {
    id: 9, uniqueId: 'CG-10009', name: 'Kavitha Reddy', age: 30, gender: 'Female',
    domain: 'pet', category: 'pet', photo: cgPhoto('Kavitha Reddy', 'Female'),
    specializations: ['large breeds', 'anxiety disorders', 'German Shepherd', 'Labrador', 'behavioral training'],
    bio: '6 years handling large breeds with anxiety. Certified in canine behavioral therapy.',
    location: { name: 'Gachibowli', lat: 17.4401, lng: 78.3489 },
    pricing: 350, pricingUnit: 'session', dailyCost: 1400,
    availability: { morning: true, afternoon: true, evening: true, night: false, weekends: true },
    verification: { faceLiveness: true, documentOCR: true, policeClearance: true, referenceCheck: true, govId: true, liveSelfie: true, digilocker: true, medicalScreening: false },
    govVerified: true,
    screeningStatus: 'approved', screeningRating: 4,
    activeJobUntil: null,
    stats: { totalSessions: 215, onTimeRate: 0.95, cancellationRate: 0.02, completionRate: 0.97, avgRating: 4.7 },
    trustScore: 86, verified: true,
    workHistory: [
      { location: 'Gachibowli', date: '2026-05-08', duration: '3 hrs', status: 'completed' },
    ],
    reviews: [
      { family: 'Meera S.', rating: 5, text: 'Kavitha completely transformed our GSD\'s anxiety. Amazing handler.' }
    ]
  },
  {
    id: 10, uniqueId: 'CG-10010', name: 'Ravi Teja', age: 26, gender: 'Male',
    domain: 'pet', category: 'pet', photo: cgPhoto('Ravi Teja', 'Male'),
    specializations: ['cats', 'Persian', 'Siamese', 'dietary management', 'feline care'],
    bio: '4 years in feline care. Specialized in breed-specific nutrition and health monitoring.',
    location: { name: 'Hitech City', lat: 17.4435, lng: 78.3772 },
    pricing: 300, pricingUnit: 'session', dailyCost: 1200,
    availability: { morning: true, afternoon: true, evening: true, night: false, weekends: false },
    verification: { faceLiveness: true, documentOCR: true, policeClearance: false, referenceCheck: true, govId: false, liveSelfie: true, digilocker: false, medicalScreening: false },
    govVerified: false,
    screeningStatus: 'pending', screeningRating: 3,
    activeJobUntil: null,
    stats: { totalSessions: 142, onTimeRate: 0.92, cancellationRate: 0.04, completionRate: 0.95, avgRating: 4.5 },
    trustScore: 78, verified: false,
    workHistory: [],
    reviews: [
      { family: 'Arjun M.', rating: 4, text: 'Good with cats, understands feline nutrition well.' }
    ]
  },
  {
    id: 7, uniqueId: 'CG-10007', name: 'Mohammed Irfan', age: 45, gender: 'Male',
    domain: 'human', category: 'human', photo: cgPhoto('Mohammed Irfan', 'Male'),
    specializations: ['24-hour care', 'bedridden patients', 'catheter management', 'wheelchair assistance'],
    bio: '12 years in elder home care. Experienced with bedridden patients and complex medical equipment.',
    location: { name: 'Secunderabad', lat: 17.4399, lng: 78.4983 },
    pricing: 800, pricingUnit: 'session', dailyCost: 3200,
    availability: { morning: true, afternoon: true, evening: true, night: true, weekends: true },
    verification: { faceLiveness: true, documentOCR: true, policeClearance: true, referenceCheck: true, govId: true, liveSelfie: true, digilocker: true, medicalScreening: true },
    govVerified: true,
    screeningStatus: 'approved', screeningRating: 5,
    activeJobUntil: null,
    stats: { totalSessions: 612, onTimeRate: 0.98, cancellationRate: 0.01, completionRate: 0.99, avgRating: 4.8 },
    trustScore: 93, verified: true,
    workHistory: [
      { location: 'Secunderabad', date: '2026-05-08', duration: '8 hrs', status: 'completed' },
      { location: 'Begumpet', date: '2026-05-06', duration: '4 hrs', status: 'completed' },
    ],
    reviews: [
      { family: 'Srinivas R.', rating: 5, text: 'Irfan is exceptional with bedridden patients. Highly recommend.' }
    ]
  },
  {
    id: 3, uniqueId: 'CG-10003', name: 'Srilatha Venkat', age: 32, gender: 'Female',
    domain: 'child', category: 'child', photo: cgPhoto('Srilatha Venkat', 'Female'),
    specializations: ['autism', 'speech therapy assist', 'sensory activities', 'special-needs'],
    bio: '6 years with autistic children. Trained in sensory integration and assistive communication.',
    location: { name: 'Kukatpally', lat: 17.4947, lng: 78.3996 },
    pricing: 550, pricingUnit: 'session', dailyCost: 2200,
    availability: { morning: true, afternoon: true, evening: true, night: false, weekends: true },
    verification: { faceLiveness: true, documentOCR: true, policeClearance: true, referenceCheck: true, govId: true, liveSelfie: true, digilocker: true, medicalScreening: true },
    govVerified: true,
    screeningStatus: 'approved', screeningRating: 4,
    activeJobUntil: null,
    stats: { totalSessions: 256, onTimeRate: 0.96, cancellationRate: 0.015, completionRate: 0.98, avgRating: 4.7 },
    trustScore: 89, verified: true,
    workHistory: [
      { location: 'Kukatpally', date: '2026-05-07', duration: '4 hrs', status: 'completed' },
    ],
    reviews: [
      { family: 'Radha K.', rating: 5, text: 'Srilatha\'s autism expertise is genuine and deeply effective.' }
    ]
  },
  {
    id: 8, uniqueId: 'CG-10008', name: 'Venkat Rao', age: 50, gender: 'Male',
    domain: 'human', category: 'human', photo: cgPhoto('Venkat Rao', 'Male'),
    specializations: ['dementia', 'night-shift', 'companionship', 'mobility assistance'],
    bio: '15 years in elder care. Specializes in dementia companionship and night monitoring.',
    location: { name: 'Begumpet', lat: 17.4445, lng: 78.4676 },
    pricing: 650, pricingUnit: 'session', dailyCost: 2600,
    availability: { morning: false, afternoon: true, evening: true, night: true, weekends: true },
    verification: { faceLiveness: true, documentOCR: true, policeClearance: true, referenceCheck: true, govId: true, liveSelfie: true, digilocker: true, medicalScreening: true },
    govVerified: true,
    screeningStatus: 'approved', screeningRating: 5,
    activeJobUntil: null,
    stats: { totalSessions: 734, onTimeRate: 0.97, cancellationRate: 0.01, completionRate: 0.99, avgRating: 4.8 },
    trustScore: 92, verified: true,
    workHistory: [
      { location: 'Begumpet', date: '2026-05-09', duration: '4 hrs', status: 'in-progress' },
    ],
    reviews: [
      { family: 'Padma S.', rating: 5, text: 'Venkat is like family now. His dementia care is outstanding.' }
    ]
  },
  {
    id: 11, uniqueId: 'CG-10011', name: 'Divya Prakash', age: 27, gender: 'Female',
    domain: 'pet', category: 'pet', photo: cgPhoto('Divya Prakash', 'Female'),
    specializations: ['small breeds', 'Pomeranian', 'Shih Tzu', 'grooming', 'puppy training'],
    bio: '4 years with small breed dogs. Expert in grooming and puppy socialization.',
    location: { name: 'Manikonda', lat: 17.4052, lng: 78.3863 },
    pricing: 280, pricingUnit: 'session', dailyCost: 1120,
    availability: { morning: true, afternoon: true, evening: false, night: false, weekends: true },
    verification: { faceLiveness: true, documentOCR: true, policeClearance: false, referenceCheck: true, govId: false, liveSelfie: true, digilocker: false, medicalScreening: false },
    govVerified: false,
    screeningStatus: 'pending', screeningRating: 3,
    activeJobUntil: null,
    stats: { totalSessions: 167, onTimeRate: 0.91, cancellationRate: 0.05, completionRate: 0.94, avgRating: 4.3 },
    trustScore: 72, verified: false,
    workHistory: [],
    reviews: [
      { family: 'Sneha L.', rating: 4, text: 'Divya is great with our Pomeranian. Good grooming skills.' }
    ]
  },
  {
    id: 4, uniqueId: 'CG-10004', name: 'Fatima Begum', age: 36, gender: 'Female',
    domain: 'child', category: 'child', photo: cgPhoto('Fatima Begum', 'Female'),
    specializations: ['newborn care', 'breastfeeding support', 'post-natal', 'twins'],
    bio: '8 years neonatal and newborn care. Trained lactation support counselor.',
    location: { name: 'Tolichowki', lat: 17.3953, lng: 78.4141 },
    pricing: 500, pricingUnit: 'session', dailyCost: 2000,
    availability: { morning: true, afternoon: true, evening: true, night: true, weekends: true },
    verification: { faceLiveness: true, documentOCR: true, policeClearance: true, referenceCheck: true, govId: true, liveSelfie: true, digilocker: true, medicalScreening: true },
    govVerified: true,
    screeningStatus: 'approved', screeningRating: 5,
    activeJobUntil: null,
    stats: { totalSessions: 389, onTimeRate: 0.97, cancellationRate: 0.01, completionRate: 0.99, avgRating: 4.8 },
    trustScore: 90, verified: true,
    workHistory: [
      { location: 'Tolichowki', date: '2026-05-08', duration: '6 hrs', status: 'completed' },
    ],
    reviews: [
      { family: 'Amina K.', rating: 5, text: 'Fatima was a blessing during our first month with twins.' }
    ]
  },
  {
    id: 12, uniqueId: 'CG-10012', name: 'Ramesh Goud', age: 40, gender: 'Male',
    domain: 'pet', category: 'pet', photo: cgPhoto('Ramesh Goud', 'Male'),
    specializations: ['large breeds', 'guard dogs', 'Rottweiler', 'Doberman', 'exercise routines'],
    bio: '9 years handling large and guard dog breeds. Experienced with high-energy breeds.',
    location: { name: 'Miyapur', lat: 17.4969, lng: 78.3548 },
    pricing: 400, pricingUnit: 'session', dailyCost: 1600,
    availability: { morning: true, afternoon: true, evening: true, night: false, weekends: true },
    verification: { faceLiveness: true, documentOCR: true, policeClearance: true, referenceCheck: true, govId: true, liveSelfie: true, digilocker: true, medicalScreening: false },
    govVerified: true,
    screeningStatus: 'approved', screeningRating: 4,
    activeJobUntil: null,
    stats: { totalSessions: 345, onTimeRate: 0.94, cancellationRate: 0.025, completionRate: 0.97, avgRating: 4.6 },
    trustScore: 85, verified: true,
    workHistory: [
      { location: 'Miyapur', date: '2026-05-08', duration: '3 hrs', status: 'completed' },
    ],
    reviews: [
      { family: 'Kiran V.', rating: 5, text: 'Ramesh handles our Rottweiler with perfect confidence.' }
    ]
  },
];

// Job blocking: 4-hour lockout after assignment
export function isAvailableForJob(caregiver) {
  if (!caregiver.activeJobUntil) return true;
  return new Date() > new Date(caregiver.activeJobUntil);
}

export function assignJob(caregiver) {
  const blockUntil = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours
  caregiver.activeJobUntil = blockUntil.toISOString();
  return blockUntil;
}

export function getRemainingBlockTime(caregiver) {
  if (!caregiver.activeJobUntil) return null;
  const remaining = new Date(caregiver.activeJobUntil) - new Date();
  if (remaining <= 0) return null;
  const hrs = Math.floor(remaining / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
}
