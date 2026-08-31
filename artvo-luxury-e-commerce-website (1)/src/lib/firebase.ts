/**
 * ARTÉVO Firebase client SDK — project artevo-1188a
 *
 * Services enabled:
 *   ✅ Firebase Auth        — admin login (email/password + Google)
 *   ✅ Firebase Storage     — CDN-backed artwork image hosting
 *   ✅ Firebase Analytics   — GA4-grade visitor analytics
 *   ✅ Realtime Database    — live cross-browser sync backbone
 *   ✅ Cloud Messaging      — push notifications to admin devices
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA0Ho-ObbE0Uc9VIqDxvwnWeuwE6SGbcoY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "artevo-1188a.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "artevo-1188a",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "artevo-1188a.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "346561178602",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:346561178602:web:544b32a9f20ebb7dd6e093",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-WJ8H77YGCQ",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://artevo-1188a-default-rtdb.firebaseio.com",
};

/** True when the core Firebase config keys are present. */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let rtdb: Database | null = null;

function getApp(): FirebaseApp {
  if (!app) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null;
  if (!auth) auth = getAuth(getApp());
  return auth;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  if (!isFirebaseConfigured()) return null;
  if (!storage) storage = getStorage(getApp());
  return storage;
}

export function getFirebaseDatabase(): Database | null {
  if (!isFirebaseConfigured()) return null;
  if (!rtdb) rtdb = getDatabase(getApp());
  return rtdb;
}

/**
 * Initialise Firebase Analytics (browser-only, lazy).
 * Called once from SiteWidgets after hydration.
 */
export async function initFirebaseAnalytics() {
  if (typeof window === "undefined" || !isFirebaseConfigured()) return null;
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (await isSupported()) {
      return getAnalytics(getApp());
    }
  } catch {
    /* analytics not supported in this environment */
  }
  return null;
}
