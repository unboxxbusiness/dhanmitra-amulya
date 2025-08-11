
import admin from 'firebase-admin';

// This initializes the Firebase Admin SDK.
// It checks if the app is already initialized to prevent errors.
if (!admin.apps.length) {
  try {
    console.log('Initializing Firebase Admin SDK...');
    
    // Vercel deployment requires explicit credential passing.
    // Check if the required environment variables are set.
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // The private key must have newlines correctly formatted.
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
       console.log('Firebase Admin SDK initialized with explicit credentials.');
    } else {
        // Fallback for local development using gcloud ADC
        console.log('Initializing Firebase Admin SDK with Application Default Credentials...');
         admin.initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    }

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
