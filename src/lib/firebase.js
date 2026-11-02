'use client';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Web config for project sura-8a91f. These values are public by design;
// access is controlled by firestore.rules.
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAPq7fkZ5Q7kSjCjgKLosThazkzgtj-zYY',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'sura-8a91f.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sura-8a91f',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '249504773871',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:249504773871:web:c4e9927d2300090bbc8d1a',
};

export const firebaseReady = Boolean(config.apiKey && config.projectId);

let app = null;
if (firebaseReady && typeof window !== 'undefined') {
  app = getApps()[0] || initializeApp(config);
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
