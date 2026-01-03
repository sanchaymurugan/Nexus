import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { firebaseConfig } from './config';

let app: App;

if (!getApps().length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
     app = initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
    });
  } else {
    app = initializeApp({
        projectId: firebaseConfig.projectId
    });
  }
} else {
  app = getApps()[0];
}


const firestore = getFirestore(app);
const auth = getAuth(app);

export function getFirebaseAdmin() {
  return { app, firestore, auth };
}
