
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

if (getApps().length === 0) {
  console.log("Firebase Admin SDK: Attempting to initialize a new app...");
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.");
    }
    
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('CRITICAL: Could not initialize Firebase Admin SDK.', error.message);
    // This error is critical for server operation, so we re-throw it to prevent the server from starting in a broken state.
    throw new Error('Could not initialize Firebase Admin SDK. Server cannot start.');
  }
}

// Export the initialized services.
const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { admin, adminAuth, adminDb };
