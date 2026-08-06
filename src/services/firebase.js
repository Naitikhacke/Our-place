// Firebase Cloud Firestore & Authentication Service for Between Us
// Real-Time Sync Blueprint for Naitik & Raj

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';

// Replace with your Firebase Project Configuration from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "between-us-sanctuary.firebaseapp.com",
  projectId: "between-us-sanctuary",
  storageBucket: "between-us-sanctuary.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const SANCTUARY_SPACE_ID = 'naitik-raj-space';

// 1. REAL-TIME HEART NOTES LISTENER (Syncs between Naitik & Raj instantly)
export function subscribeToHeartNotes(callback) {
  const notesRef = collection(db, 'spaces', SANCTUARY_SPACE_ID, 'notes');
  const q = query(notesRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(notes);
  });
}

// 2. POST NEW HEART NOTE TO FIRESTORE
export async function sendHeartNoteToFirestore(noteData) {
  const notesRef = collection(db, 'spaces', SANCTUARY_SPACE_ID, 'notes');
  return await addDoc(notesRef, {
    ...noteData,
    createdAt: serverTimestamp(),
    status: 'unread'
  });
}

// 3. REAL-TIME GARDEN FLOWERS LISTENER
export function subscribeToGarden(callback) {
  const gardenRef = collection(db, 'spaces', SANCTUARY_SPACE_ID, 'garden');
  return onSnapshot(gardenRef, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  });
}

// 4. REAL-TIME LETTERS LISTENER
export function subscribeToLetters(callback) {
  const lettersRef = collection(db, 'spaces', SANCTUARY_SPACE_ID, 'letters');
  return onSnapshot(lettersRef, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  });
}
