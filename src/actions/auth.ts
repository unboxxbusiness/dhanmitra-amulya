'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { ROLES, type Role } from '@/lib/definitions';
import { DecodedIdToken } from 'firebase-admin/auth';

const SESSION_COOKIE_NAME = 'session';
const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function createSession(idToken: string) {
  try {
    const decodedClaims = await adminAuth.verifyIdToken(idToken);
    const userRef = adminDb.collection('users').doc(decodedClaims.uid);
    const userDoc = await userRef.get();

    let role: Role = 'member'; // Default role

    if (userDoc.exists) {
      // If user document exists, get their role from it.
      const userRole = userDoc.data()?.role as Role;
      if (ROLES.includes(userRole)) {
        role = userRole;
      }
    } else {
      // If it's a new user, create their document in Firestore with default 'member' role.
      try {
        await userRef.set({
          email: decodedClaims.email,
          role: 'member',
          createdAt: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error('Failed to create user document in Firestore:', dbError);
        // Proceed with 'member' role even if DB write fails, but log the error.
      }
    }
    
    // Set role as a custom claim on the user's auth token for security and server-side checks.
    await adminAuth.setCustomUserClaims(decodedClaims.uid, { role });

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
