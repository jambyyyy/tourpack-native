import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyB8lAZ7iRdRYSgRuimjqB4WTUQRNME94zU",
  authDomain: "tourpack-c44ed.firebaseapp.com",
  projectId: "tourpack-c44ed",
  storageBucket: "tourpack-c44ed.firebasestorage.app",
  messagingSenderId: "950621750295",
  appId: "1:950621750295:web:ba5fa378fc361b8e8f0852",
};

// getApps()/getApp() guard avoids a "duplicate app" error if this file
// somehow gets evaluated twice (can happen with Metro's fast refresh).
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth + getReactNativePersistence keeps the user logged in
// between app restarts, using AsyncStorage under the hood.
// Fast refresh re-runs this file, and initializeAuth can only be called once
// per app, so fall back to the existing Auth instance if it already exists.
function createAuth() {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (error && error.code === "auth/already-initialized") {
      return getAuth(app);
    }
    throw error;
  }
}

export const auth = createAuth();

// Firestore — the "packages" collection you created in the console
// (and any others you add, like "bookings") are read through this.
export const db = getFirestore(app);
  
// Cover-photo uploads for guide packages (used by MyPackages).
export const storage = getStorage(app);