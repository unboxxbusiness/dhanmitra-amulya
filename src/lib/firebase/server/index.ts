'use server';

import * as admin from 'firebase-admin';

// This function ensures that the Firebase Admin SDK is initialized only once.
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    console.log('Firebase Admin SDK already initialized.');
    return;
  }

  try {
    // When deployed to Firebase, environment variables are automatically set.
    // initializeApp() with no arguments will use these variables.
    console.log('Initializing Firebase Admin SDK...');
    admin.initializeApp();
    console.log('Firebase Admin SDK initialized successfully.');

  } catch (error: any) {
    console.error('CRITICAL: Error initializing Firebase Admin SDK:', error);
    // This error is critical and should prevent the server from starting.
    throw new Error('Could not initialize Firebase Admin SDK. Please check server logs and environment variables.');
  }
}

// Initialize the app
initializeFirebaseAdmin();

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb };
