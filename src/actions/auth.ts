'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { ROLES, type Role } from '@/lib/definitions';
import { DecodedIdToken } from 'firebase-admin/auth';

const SESSION_COOKIE_NAME = 'session';
const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

async function getUserRole(decodedClaims: DecodedIdToken): Promise<Role> {
  // Temporary hardcode for admin user to ensure access.
  if (decodedClaims.email === 'anujkumar7676@gmail.com') {
    return 'admin';
  }

  try {
    const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get();
    if (userDoc.exists) {
      const userRole = userDoc.data()?.role as Role;
      if (ROLES.includes(userRole)) {
        return userRole;
      }
    }
  } catch (error) {
    console.error("Error fetching user role from Firestore:", error);
  }
  
  // Default to 'member' if no role found or on error
  return 'member';
}

export async function createSession(idToken: string, isNewUser: boolean) {
  try {
    const decodedClaims = await adminAuth.verifyIdToken(idToken);
    
    // If it's a new user, create their document in Firestore
    if (isNewUser) {
      try {
        await adminDb.collection('users').doc(decodedClaims.uid).set({
          email: decodedClaims.email,
          role: 'member' // Default role
        });
      } catch (dbError) {
        console.error("Failed to create user document in Firestore:", dbError);
        // Continue, but the user won't have a role from DB until next login
      }
    }

    const role = await getUserRole(decodedClaims);

    // Set the role as a custom claim on the user's auth token.
    await adminAuth.setCustomUserClaims(decodedClaims.uid, { role });

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });

    return { success: true, role };
  } catch (error) {
    console.error('Failed to create session:', error);
    return { error: 'Failed to create session.', role: 'member' };
  }
}

export async function signOut() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/login');
}
