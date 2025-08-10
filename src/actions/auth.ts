'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/firebase/server';

const SESSION_COOKIE_NAME = 'session';
const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function createSession(idToken: string) {
  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to create session:', error);
    return { error: 'Failed to create session.' };
  }
}

export async function signOut() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/login');
}
