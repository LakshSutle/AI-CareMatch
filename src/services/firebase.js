// Firebase service — Firestore with localStorage fallback
import { db, isConfigured } from './firebaseConfig';
import {
  collection, addDoc, getDocs, query, where, orderBy, serverTimestamp
} from 'firebase/firestore';

const DB_KEY = 'ai_carematch_db';

// ─── localStorage helpers (fallback) ───
function getDB() {
  try { return JSON.parse(localStorage.getItem(DB_KEY) || '{}'); }
  catch { return {}; }
}
function saveDB(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }

// ─── Bookings ───
export async function saveBooking(booking) {
  if (isConfigured) {
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...booking,
      status: 'confirmed',
      createdAt: serverTimestamp(),
    });
    return { ...booking, id: docRef.id, status: 'confirmed' };
  }
  // localStorage fallback
  const local = getDB();
  if (!local.bookings) local.bookings = [];
  booking.id = Date.now().toString();
  booking.createdAt = new Date().toISOString();
  booking.status = 'confirmed';
  local.bookings.push(booking);
  saveDB(local);
  return booking;
}

export async function getBookings() {
  if (isConfigured) {
    const snap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  return getDB().bookings || [];
}

// ─── Feedback ───
export async function saveFeedback(feedback) {
  if (isConfigured) {
    const docRef = await addDoc(collection(db, 'feedback'), {
      ...feedback,
      createdAt: serverTimestamp(),
    });
    return { ...feedback, id: docRef.id };
  }
  const local = getDB();
  if (!local.feedback) local.feedback = [];
  feedback.id = Date.now().toString();
  feedback.createdAt = new Date().toISOString();
  local.feedback.push(feedback);
  saveDB(local);
  return feedback;
}

export async function getFeedback(caregiverId) {
  if (isConfigured) {
    const snap = await getDocs(query(collection(db, 'feedback'), where('caregiverId', '==', caregiverId)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  return (getDB().feedback || []).filter((f) => f.caregiverId === caregiverId);
}

// ─── Session state ───
export function saveSession(key, value) {
  const local = getDB();
  if (!local.sessions) local.sessions = {};
  local.sessions[key] = value;
  saveDB(local);
}

export function getSession(key) {
  return (getDB().sessions || {})[key] || null;
}

// ─── Notifications ───
export async function sendNotification(notification) {
  if (isConfigured) {
    await addDoc(collection(db, 'notifications'), {
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
    });
  } else {
    const local = getDB();
    if (!local.notifications) local.notifications = [];
    local.notifications.push({
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString(),
    });
    saveDB(local);
  }

  // Browser push notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, { body: notification.body, icon: '/favicon.svg' });
  }
}

export async function getNotifications() {
  if (isConfigured) {
    const snap = await getDocs(query(collection(db, 'notifications'), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  return (getDB().notifications || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ─── Caregiver Job Assignment (Firestore-backed blocking) ───
export async function assignCaregiverJob(caregiverId) {
  if (isConfigured) {
    const blockUntil = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    await addDoc(collection(db, 'assignments'), {
      caregiverId,
      assignedAt: serverTimestamp(),
      blockUntil,
      status: 'active',
    });
    return blockUntil;
  }
  return null;
}
