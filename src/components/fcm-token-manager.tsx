// src/components/fcm-token-manager.tsx
'use client';

import { useEffect } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import { app } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { saveFcmToken } from '@/actions/users';

async function requestPermissionAndGetToken(swRegistration: ServiceWorkerRegistration) {
  console.log('Requesting user permission for notifications...');
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      const messaging = getMessaging(app);
      
      // Get the token
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, // Get this from Firebase Console
        serviceWorkerRegistration: swRegistration,
      });

      if (currentToken) {
        console.log('FCM Token received:', currentToken);
        // Send this token to your server to be stored
        await saveFcmToken(currentToken);
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
      console.log('Unable to get permission to notify.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token. ', error);
    return null;
  }
}

export function FcmTokenManager() {
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
            console.log('Firebase Service Worker registered with scope: ', registration.scope);
            // Wait for the service worker to be ready
            return navigator.serviceWorker.ready.then(() => {
                console.log('Service Worker is active.');
                return requestPermissionAndGetToken(registration);
            });
        }).then(token => {
            if (!token) {
                 toast({
                   variant: 'destructive',
                   title: 'Notification Setup Failed',
                   description: "Could not get permission to send notifications. Please enable them in your browser settings.",
               });
            }
        }).catch(function(err) {
          console.log('Service Worker registration failed: ', err);
           toast({
                variant: 'destructive',
                title: 'Service Worker Error',
                description: "Could not initialize the notification service."
            });
        });
    }
  }, [toast]);

  return null; // This component does not render anything
}
