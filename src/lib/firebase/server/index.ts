
import admin from 'firebase-admin';

// This initializes the Firebase Admin SDK.
// It checks if the app is already initialized to prevent errors.
if (!admin.apps.length) {
  try {
    console.log('Initializing Firebase Admin SDK...');
    
    // The init.ts script handles setting GOOGLE_APPLICATION_CREDENTIALS.
    // The SDK will automatically find the credentials from the environment.
    admin.initializeApp();
    
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
