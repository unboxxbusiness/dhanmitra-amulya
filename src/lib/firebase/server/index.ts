
'use server';

import admin from 'firebase-admin';

/**
 * Ensures the Firebase Admin SDK is initialized, but only once.
 * This is the single source of truth for the admin SDK instance.
 */
function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin;
  }

  try {
    console.log('Initializing Firebase Admin SDK...');
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.'
      );
    }
    const serviceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
    return admin;
  } catch (error: any) {
    console.error(
      'CRITICAL: Could not initialize Firebase Admin SDK.',
      error.message
    );
    // This error is critical for server operation, so we re-throw it to prevent the server from starting in a broken state.
    throw new Error('Could not initialize Firebase Admin SDK. Server cannot start.');
  }
}

export const adminInstance = getFirebaseAdmin();
export const adminAuth = adminInstance.auth();
export const adminDb = adminInstance.firestore();
