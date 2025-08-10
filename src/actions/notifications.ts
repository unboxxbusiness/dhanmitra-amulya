
'use server';

import { adminDb, admin } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import type { UserProfile } from '@/lib/definitions';

const ADMIN_ROLES = ['admin', 'branch_manager'];

async function verifyAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.includes(session.role)) {
    throw new Error('Not authorized for this action');
  }
  return session;
}


type SendNotificationPayload = {
  target: 'all' | 'single';
  userId?: string; // required if target is 'single'
  title: string;
  body: string;
};

export async function sendNotification(payload: SendNotificationPayload) {
  await verifyAdmin();

  const { target, userId, title, body } = payload;

  if (!title || !body) {
    return { success: false, error: 'Title and body are required.' };
  }

  try {
    let tokens: string[] = [];

    if (target === 'single' && userId) {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return { success: false, error: 'Target user not found.' };
      }
      const userData = userDoc.data() as UserProfile;
      tokens = userData.fcmTokens || [];
    } else if (target === 'all') {
      const usersSnapshot = await adminDb.collection('users').where('fcmTokens', '!=', []).get();
      usersSnapshot.forEach(doc => {
        const userData = doc.data() as UserProfile;
        if (userData.fcmTokens) {
          tokens.push(...userData.fcmTokens);
        }
      });
       // Remove duplicates
      tokens = [...new Set(tokens)];
    }

    if (tokens.length === 0) {
      return { success: false, error: 'No registered devices found for the target audience.' };
    }

    // FCM allows sending to a maximum of 500 tokens per request
    const messageBatches = [];
    for (let i = 0; i < tokens.length; i += 500) {
      const chunk = tokens.slice(i, i + 500);
      messageBatches.push(chunk);
    }
    
    const message = {
        notification: { title, body },
        webpush: {
            notification: {
                icon: '/icon-192x192.png', // Default icon
            },
        },
    };

    let successfulSends = 0;
    let failedSends = 0;

    for (const batch of messageBatches) {
         const response = await admin.messaging().sendToDevice(batch, message);
         successfulSends += response.successCount;
         failedSends += response.failureCount;
    }

    return { 
        success: true, 
        message: `Notifications sent. Success: ${successfulSends}, Failed: ${failedSends}.`
    };

  } catch (error: any) {
    console.error("Error sending notification:", error);
    return { success: false, error: error.message };
  }
}
