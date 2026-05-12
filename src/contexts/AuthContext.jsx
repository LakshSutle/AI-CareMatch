import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { auth, db, isConfigured } from '../services/firebaseConfig';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(isConfigured && auth));

  // Fetch Firestore profile for a given uid
  async function fetchProfile(uid) {
    if (!isConfigured || !db) return null;
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) return { uid, ...snap.data() };
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
    return null;
  }

  // Listen to auth state
  useEffect(() => {
    if (!isConfigured || !auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profile = await fetchProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Generate a unique ID like CG-10013 or PT-20007
  async function generateUniqueId(role) {
    const prefix = role === 'caregiver' ? 'CG' : 'PT';
    const counterRef = doc(db, 'counters', `${role}_counter`);
    try {
      const newId = await runTransaction(db, async (transaction) => {
        const counterSnap = await transaction.get(counterRef);
        let nextNum;
        if (!counterSnap.exists()) {
          // Start caregivers at 10013 (after our 12 seeded), patients at 20007 (after our 6 seeded)
          nextNum = role === 'caregiver' ? 10013 : 20007;
        } else {
          nextNum = counterSnap.data().current + 1;
        }
        transaction.set(counterRef, { current: nextNum });
        return `${prefix}-${nextNum}`;
      });
      return newId;
    } catch (err) {
      // Fallback: timestamp-based ID if transaction fails
      console.warn('Counter transaction failed, using fallback ID:', err);
      const fallback = Date.now().toString().slice(-5);
      return `${prefix}-${fallback}`;
    }
  }

  // Sign up — create auth user + Firestore profile with unique ID
  async function signup(email, password, role, displayName) {
    if (!auth || !db) throw new Error('Firebase not configured');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    // Generate unique ID
    const uniqueId = await generateUniqueId(role);
    // Write role + profile to Firestore
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      displayName,
      role,
      uniqueId,
      createdAt: serverTimestamp(),
    });
    const profile = await fetchProfile(cred.user.uid);
    setUserProfile(profile);
    return cred.user;
  }

  // Log in
  async function login(email, password) {
    if (!auth) throw new Error('Firebase not configured');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await fetchProfile(cred.user.uid);
    setUserProfile(profile);
    return cred.user;
  }

  // Log out
  async function logout() {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  }

  const role = userProfile?.role || null;

  const value = {
    user,
    userProfile,
    role,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
