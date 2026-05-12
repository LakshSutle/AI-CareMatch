// Firebase Seed Script — Push all demo data to Firestore
// Run with: node src/scripts/seedFirebase.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAPjQEcl9PLQJ5PmEUBK2BQGP7CKJ4rl-8',
  authDomain: 'ai-carematch.firebaseapp.com',
  projectId: 'ai-carematch',
  storageBucket: 'ai-carematch.firebasestorage.app',
  messagingSenderId: '536498953498',
  appId: '1:536498953498:web:eb95c6e0177a4f2e2e1ca0',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── 12 Caregivers ───
const caregivers = [
  { uniqueId: 'CG-10001', displayName: 'Priya Sharma', role: 'caregiver', category: 'child', location: 'Banjara Hills', specializations: ['ADHD', 'autism', 'special-needs'], trustScore: 88, pricing: 450 },
  { uniqueId: 'CG-10002', displayName: 'Meena Devi', role: 'caregiver', category: 'child', location: 'Jubilee Hills', specializations: ['ADHD', 'night-shift', 'infant care'], trustScore: 94, pricing: 500 },
  { uniqueId: 'CG-10003', displayName: 'Srilatha Venkat', role: 'caregiver', category: 'child', location: 'Kukatpally', specializations: ['autism', 'speech therapy', 'sensory activities'], trustScore: 89, pricing: 550 },
  { uniqueId: 'CG-10004', displayName: 'Fatima Begum', role: 'caregiver', category: 'child', location: 'Tolichowki', specializations: ['newborn care', 'post-natal', 'twins'], trustScore: 90, pricing: 500 },
  { uniqueId: 'CG-10005', displayName: 'Suresh Babu', role: 'caregiver', category: 'human', location: 'Madhapur', specializations: ['post-surgery', 'physiotherapy', 'medication management'], trustScore: 95, pricing: 600 },
  { uniqueId: 'CG-10006', displayName: 'Lakshmi Naidu', role: 'caregiver', category: 'human', location: 'Kondapur', specializations: ['dementia', 'alzheimers', 'cognitive exercises'], trustScore: 91, pricing: 700 },
  { uniqueId: 'CG-10007', displayName: 'Mohammed Irfan', role: 'caregiver', category: 'human', location: 'Secunderabad', specializations: ['24-hour care', 'bedridden', 'wheelchair assistance'], trustScore: 93, pricing: 800 },
  { uniqueId: 'CG-10008', displayName: 'Venkat Rao', role: 'caregiver', category: 'human', location: 'Begumpet', specializations: ['dementia', 'night-shift', 'companionship'], trustScore: 92, pricing: 650 },
  { uniqueId: 'CG-10009', displayName: 'Kavitha Reddy', role: 'caregiver', category: 'pet', location: 'Gachibowli', specializations: ['large breeds', 'anxiety', 'behavioral training'], trustScore: 86, pricing: 350 },
  { uniqueId: 'CG-10010', displayName: 'Ravi Teja', role: 'caregiver', category: 'pet', location: 'Hitech City', specializations: ['cats', 'Persian', 'dietary management'], trustScore: 78, pricing: 300 },
  { uniqueId: 'CG-10011', displayName: 'Divya Prakash', role: 'caregiver', category: 'pet', location: 'Manikonda', specializations: ['small breeds', 'grooming', 'puppy training'], trustScore: 72, pricing: 280 },
  { uniqueId: 'CG-10012', displayName: 'Ramesh Goud', role: 'caregiver', category: 'pet', location: 'Miyapur', specializations: ['large breeds', 'guard dogs', 'exercise routines'], trustScore: 85, pricing: 400 },
];

// ─── 6 Patients ───
const patients = [
  { uniqueId: 'PT-20001', displayName: 'Ananya Reddy', role: 'patient', category: 'child', location: 'Banjara Hills', careNeeds: 'ADHD support for 7yo daughter' },
  { uniqueId: 'PT-20002', displayName: 'Deepak Menon', role: 'patient', category: 'child', location: 'Ameerpet', careNeeds: 'Newborn night care' },
  { uniqueId: 'PT-20003', displayName: 'Rajesh Kumar', role: 'patient', category: 'human', location: 'Madhapur', careNeeds: 'Post-surgery recovery for father' },
  { uniqueId: 'PT-20004', displayName: 'Padma Srinivas', role: 'patient', category: 'human', location: 'Begumpet', careNeeds: 'Dementia care for mother' },
  { uniqueId: 'PT-20005', displayName: 'Meera Sharma', role: 'patient', category: 'pet', location: 'Gachibowli', careNeeds: 'GSD with separation anxiety' },
  { uniqueId: 'PT-20006', displayName: 'Arjun Malhotra', role: 'patient', category: 'pet', location: 'Hitech City', careNeeds: 'Persian cat dietary care' },
];

// ─── Demo Bookings ───
const demoBookings = [
  { caregiverId: 1, caregiverName: 'Priya Sharma', caregiverUniqueId: 'CG-10001', patientUniqueId: 'PT-20001', patientName: 'Ananya Reddy', domain: 'child', urgency: 'scheduled', scheduledDate: '2026-05-12', scheduledTime: '15:00', status: 'confirmed', createdAt: new Date().toISOString() },
  { caregiverId: 5, caregiverName: 'Suresh Babu', caregiverUniqueId: 'CG-10005', patientUniqueId: 'PT-20003', patientName: 'Rajesh Kumar', domain: 'human', urgency: 'sameday', scheduledDate: null, scheduledTime: null, status: 'confirmed', createdAt: new Date().toISOString() },
  { caregiverId: 9, caregiverName: 'Kavitha Reddy', caregiverUniqueId: 'CG-10009', patientUniqueId: 'PT-20005', patientName: 'Meera Sharma', domain: 'pet', urgency: 'scheduled', scheduledDate: '2026-05-13', scheduledTime: '10:00', status: 'confirmed', createdAt: new Date().toISOString() },
  { caregiverId: 2, caregiverName: 'Meena Devi', caregiverUniqueId: 'CG-10002', patientUniqueId: 'PT-20002', patientName: 'Deepak Menon', domain: 'child', urgency: 'emergency', scheduledDate: null, scheduledTime: null, status: 'completed', createdAt: '2026-05-08T14:00:00Z' },
  { caregiverId: 8, caregiverName: 'Venkat Rao', caregiverUniqueId: 'CG-10008', patientUniqueId: 'PT-20004', patientName: 'Padma Srinivas', domain: 'human', urgency: 'scheduled', scheduledDate: '2026-05-09', scheduledTime: '09:00', status: 'completed', createdAt: '2026-05-07T10:00:00Z' },
];

// ─── Demo Notifications ───
const demoNotifications = [
  { type: 'booking', targetRole: 'caregiver', targetId: 'CG-10001', title: '📅 Scheduled Booking from Ananya Reddy', body: 'You\'ve been booked for 12 May 2026 at 03:00 pm. Child care session.', read: false, createdAt: new Date().toISOString() },
  { type: 'booking', targetRole: 'caregiver', targetId: 'CG-10005', title: '📋 New Booking from Rajesh Kumar', body: 'You\'ve been booked for a same-day session. Check your dashboard.', read: false, createdAt: new Date().toISOString() },
  { type: 'booking', targetRole: 'caregiver', targetId: 'CG-10009', title: '📅 Scheduled Booking from Meera Sharma', body: 'You\'ve been booked for 13 May 2026 at 10:00 am. Pet care session.', read: false, createdAt: new Date().toISOString() },
];

async function seed() {
  console.log('🌱 Seeding Firebase...\n');

  // Seed users (caregivers + patients)
  console.log('── Users (18 total) ──');
  for (const cg of caregivers) {
    await setDoc(doc(db, 'users', cg.uniqueId), { ...cg, seededAt: new Date().toISOString() });
    console.log(`  ✅ ${cg.role.toUpperCase()} ${cg.uniqueId} — ${cg.displayName} (${cg.category})`);
  }
  for (const pt of patients) {
    await setDoc(doc(db, 'users', pt.uniqueId), { ...pt, seededAt: new Date().toISOString() });
    console.log(`  ✅ ${pt.role.toUpperCase()} ${pt.uniqueId} — ${pt.displayName} (${pt.category})`);
  }

  // Seed bookings
  console.log('\n── Bookings ──');
  for (const b of demoBookings) {
    const ref = await addDoc(collection(db, 'bookings'), b);
    console.log(`  ✅ Booking: ${b.patientName} → ${b.caregiverName} (${b.status}) [${ref.id}]`);
  }

  // Seed notifications
  console.log('\n── Notifications ──');
  for (const n of demoNotifications) {
    const ref = await addDoc(collection(db, 'notifications'), n);
    console.log(`  ✅ Notif: ${n.targetId} — ${n.title} [${ref.id}]`);
  }

  console.log('\n🎉 Seeding complete! 12 caregivers + 6 patients + 5 bookings + 3 notifications.');
  process.exit(0);
}

seed().catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); });
