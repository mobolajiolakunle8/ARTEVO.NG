"use client";

import { isFirebaseConfigured } from "@/lib/firebase";

let messagingToken: string | null = null;

/**
 * Request push notification permission and register the FCM token.
 * Call this once from the admin dashboard after the user logs in.
 *
 * Returns the FCM token (useful for sending targeted pushes) or null
 * if Firebase is not configured, permission was denied, or the browser
 * doesn't support push.
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (!isFirebaseConfigured()) return null;
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    // Dynamic import to avoid loading firebase/messaging in every page bundle
    const { getMessaging, getToken } = await import("firebase/messaging");
    const { initializeApp, getApps } = await import("firebase/app");

    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    };

    const app = getApps().length > 0 ? getApps()[0] : initializeApp(config);

    // Pass config to the service worker so it can initialise Firebase too
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    await navigator.serviceWorker.ready;

    registration.active?.postMessage?.({ type: "FIREBASE_CONFIG", config });

    const messaging = getMessaging(app);
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    messagingToken = token;
    console.log("[ARTÉVO] FCM token:", token?.slice(0, 20) + "…");

    // Listen for foreground messages (tab is open)
    const { onMessage } = await import("firebase/messaging");
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || "ARTÉVO";
      const body = payload.notification?.body || "You have a new update.";
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/logo/artevo-mark.svg",
        });
      }
    });

    return token;
  } catch (error) {
    console.error("[ARTÉVO] FCM registration failed:", error);
    return null;
  }
}

export function getFCMToken(): string | null {
  return messagingToken;
}
