
import admin from 'firebase-admin';
import './init'; // Ensures GOOGLE_APPLICATION_CREDENTIALS is set on environments like Vercel

// This initializes the Firebase Admin SDK.
// It checks if the app is already initialized to prevent errors.
if (!admin.apps.length) {
  try {
    console.log('Initializing Firebase Admin SDK...');
    
    // Explicitly passing the projectId is a robust way to initialize in Next.js build environments.
    // The SDK will use the GOOGLE_APPLICATION_CREDENTIALS environment variable for the credential.
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
