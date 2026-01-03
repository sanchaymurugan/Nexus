'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getSdks } from '.';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string, name: string, phoneNumber: string): Promise<void> {
  const { firestore } = getSdks();
  const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
  
  // Update the user's profile with their name
  if (userCredential.user) {
    const user = userCredential.user;
    await updateProfile(user, {
      displayName: name,
    });
    const userRef = doc(firestore, 'users', user.uid);
    const userData = {
      id: user.uid,
      name: name,
      email: user.email,
      phoneNumber: phoneNumber,
    };
    // Use non-blocking set with catch for error handling
    setDoc(userRef, userData, { merge: true })
        .catch(error => {
            errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                    path: userRef.path,
                    operation: 'create', 
                    requestResourceData: userData,
                })
            )
        });
  }

  // After creation, sign the user out to force a manual login.
  if (authInstance.currentUser) {
    await authInstance.signOut();
  }
}


/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
