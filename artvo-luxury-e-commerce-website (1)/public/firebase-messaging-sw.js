/* ARTÉVO — Firebase Cloud Messaging service worker (project: artevo-1188a)
   Handles background push notifications when the browser tab is closed. */
importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.9.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA0Ho-ObbE0Uc9VIqDxvwnWeuwE6SGbcoY",
  authDomain: "artevo-1188a.firebaseapp.com",
  projectId: "artevo-1188a",
  storageBucket: "artevo-1188a.firebasestorage.app",
  messagingSenderId: "346561178602",
  appId: "1:346561178602:web:544b32a9f20ebb7dd6e093",
  measurementId: "G-WJ8H77YGCQ"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const title = payload.notification?.title || "ARTÉVO — New Update";
  const options = {
    body: payload.notification?.body || "You have a new order, bid, or message.",
    icon: "/logo/artevo-mark.svg",
    badge: "/logo/artevo-mark.svg",
    data: payload.data || {},
    tag: "artevo-notification",
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/admin";
  event.waitUntil(clients.openWindow(url));
});
