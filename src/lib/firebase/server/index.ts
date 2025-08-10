import * as admin from 'firebase-admin';
import type { Auth, Firestore } from 'firebase-admin/lib';

let adminAuth: Auth;
let adminDb: Firestore;

if (!admin.apps.length) {
  try {
    // When running locally, GOOGLE_APPLICATION_CREDENTIALS path is used.
    // In a deployed environment, credentials will be automatically discovered.
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
       console.log('Initializing Firebase Admin SDK with service account credentials.');
       const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
       admin.initializeApp({
         credential: admin.credential.cert(serviceAccount),
       });
    } else {
       console.log('Initializing Firebase Admin SDK with default credentials.');
       admin.initializeApp();
    }
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
    // You might want to throw the error or handle it gracefully
    // depending on your application's needs. For now, we log it.
  }
}

try {
  adminAuth = admin.auth();
  adminDb = admin.firestore();
} catch (error: any) {
    console.error('Failed to get Firebase services. Was initialization successful?', error.message);
    // In a real app, you might want to have a fallback or throw an error here
    // For now, this will help in debugging.
}


export { adminAuth, adminDb };
