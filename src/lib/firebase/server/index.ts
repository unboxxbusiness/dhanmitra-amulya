
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// This initializes the Firebase Admin SDK.
// It checks if the app is already initialized to prevent errors.
if (!admin.apps.length) {
  try {
    console.log('Initializing Firebase Admin SDK...');

    let serviceAccount: ServiceAccount | undefined;

    // In a deployed environment, the service account JSON might be stored in an environment variable.
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        } catch (e) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e);
        }
    }
    
    // The GOOGLE_APPLICATION_CREDENTIALS env var is often set in managed environments like Google Cloud.
    // If we have parsed a service account, we use it, otherwise we let the SDK
    // find the credentials from the environment.
    admin.initializeApp({
      credential: serviceAccount ? admin.credential.cert(serviceAccount) : undefined,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('CRITICAL: Error initializing Firebase Admin SDK:', error.message);
    // This error is critical for server operation, so we re-throw it to prevent 
    // the server from starting in a broken state.
    throw new Error('Could not initialize Firebase Admin SDK. Server cannot start.');
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export { admin };
