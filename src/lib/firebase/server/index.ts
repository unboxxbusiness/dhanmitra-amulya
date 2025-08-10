import * as admin from 'firebase-admin';
import type { Auth, Firestore } from 'firebase-admin/lib';

let adminAuth: Auth;
let adminDb: Firestore;

if (!admin.apps.length) {
  try {
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
  }
}

try {
  adminAuth = admin.auth();
  adminDb = admin.firestore();
} catch (error: any) {
    console.error('Failed to get Firebase services. Was initialization successful?', error.message);
}


export { adminAuth, adminDb };
