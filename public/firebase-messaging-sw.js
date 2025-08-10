// This file must be in the public directory
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase services
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
const firebaseConfig = {
    apiKey: "__NEXT_PUBLIC_FIREBASE_API_KEY__",
    authDomain: "__NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN__",
    projectId: "__NEXT_PUBLIC_FIREBASE_PROJECT_ID__",
    storageBucket: "__NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET__",
    messagingSenderId: "__NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID__",
    appId: "__NEXT_PUBLIC_FIREBASE_APP_ID__",
};


firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
