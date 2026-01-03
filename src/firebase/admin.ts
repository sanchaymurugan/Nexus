import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: App;

// When running in a Google Cloud environment, initializeApp() with no arguments
// will automatically use Application Default Credentials.
if (!getApps().length) {
  app = initializeApp();
} else {
  app = getApps()[0];
}

const firestore = getFirestore(app);
const auth = getAuth(app);

export function getFirebaseAdmin() {
  return { app, firestore, auth };
}
