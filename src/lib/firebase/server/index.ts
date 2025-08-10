
'./init';
import admin from 'firebase-admin';

// This initializes the Firebase Admin SDK.
// It checks if the app is already initialized to prevent errors.
// By default, initializeApp() will look for credentials in the GOOGLE_APPLICATION_CREDENTIALS
// environment variable. The init.ts file helps create this file from another env var if needed.
if (!admin.apps.length) {
  try {
    console.log('Initializing Firebase Admin SDK...');
    // Explicitly set the projectId to match the client-side configuration
    // This will solve the "aud" claim mismatch error.
    admin.initializeApp({
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
