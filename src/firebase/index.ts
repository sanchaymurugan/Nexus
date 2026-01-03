'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  const isConfigAvailable = firebaseConfig && firebaseConfig.projectId;

  if (getApps().length === 0) {
    if (!isConfigAvailable) {
      try {
        const app = initializeApp();
        return getSdks(app);
      } catch (e) {
        console.error(
          'Firebase initialization failed. Please provide a valid Firebase config object.'
        );
        // Return a dummy object or throw an error if Firebase is essential
        return getEmptySdks();
      }
    } else {
      const app = initializeApp(firebaseConfig);
      return getSdks(app);
    }
  }
  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp?: FirebaseApp) {
  if (!firebaseApp) return getEmptySdks();

  const firestore = getFirestore(firebaseApp);
  
  // Example of connecting to an emulator.
  // This should be behind a feature flag or environment variable.
  // if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  //   connectFirestoreEmulator(firestore, 'localhost', 8080);
  // }

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: firestore
  };
}

function getEmptySdks() {
  // This is a failsafe for when Firebase isn't configured.
  // It provides mock objects that won't crash the app.
  return {
    firebaseApp: null as unknown as FirebaseApp,
    auth: null as unknown as any,
    firestore: null as unknown as any,
  };
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
