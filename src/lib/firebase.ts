import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const isFirstInit = getApps().length === 0;
const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// IndexedDB persistence means a sign-up written on bad signal survives a refresh
// and syncs later. initializeFirestore can only run once per app, and never on
// the server, so fall back to the plain instance everywhere else.
function createDb() {
  if (typeof window === "undefined" || !isFirstInit) return getFirestore(app);
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch (err) {
    // Storage unavailable (private mode, quota) — fall back to memory-only.
    console.warn("Firestore persistence unavailable, using in-memory cache:", err);
    return getFirestore(app);
  }
}

const db = createDb();
const storage = getStorage(app);

export { app, auth, db, storage };
