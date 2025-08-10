
// This file must be in the public folder.

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// These are replaced by the webpack config
const firebaseConfig = {
  apiKey: "__NEXT_PUBLIC_FIREBASE_API_KEY__",
  authDomain: "__NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN__",
  projectId: "__NEXT_PUBLIC_FIREBASE_PROJECT_ID__",
  storageBucket: "__NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET__",
  messagingSenderId: "__NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID__",
  appId: "__NEXT_PUBLIC_FIREBASE_APP_ID__",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
