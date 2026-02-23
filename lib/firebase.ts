// lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; 
// Analytics is only for client-side, need to handle strict node env check if we use it.

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// console.log("Firebase Config Loaded:", firebaseConfig); // Removed debug log



// Initialize Firebase (Singleton pattern) - lazy getter
let firebaseApp: FirebaseApp | undefined;

export function getAuthApp(): FirebaseApp {
    if (!firebaseApp) {
        firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    }
    return firebaseApp;
}

export const getDb = (): Firestore => {
    return getFirestore(getAuthApp());
};

export const getClientAuth = (): Auth => {
    return getAuth(getAuthApp());
};

// Legacy exports for backward compatibility during transition (optional, but getter is safer)
// We will migrate all files to use the getters.
