"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AdminGuard, useAuth } from "@/components/useAuth";
import { requestNotificationPermission } from "@/lib/firebase-messaging";
import { getFirebaseDatabase, isFirebaseConfigured } from "@/lib/firebase";
import { onDisconnect, ref, serverTimestamp, set } from "firebase/database";

/**
 * Client wrapper for the admin page:
 * 1. Gates access behind Firebase Auth.
 * 2. Exchanges the Firebase ID token for a server-readable HttpOnly session.
 * 3. Registers realtime admin presence in Firebase Realtime Database.
 * 4. Requests FCM notifications after sign-in.
 */
export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, firebaseEnabled } = useAuth();

  useEffect(() => {
    if (!firebaseEnabled || !user) return;

    let cancelled = false;

    const establishSession = async () => {
      const token = await user.getIdToken();
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!cancelled && response.ok) {
        router.refresh();
      }
    };

    establishSession().catch((error) => console.error("[ARTÉVO] Admin session failed:", error));
    requestNotificationPermission().catch(() => undefined);

    if (isFirebaseConfigured()) {
      const db = getFirebaseDatabase();
      if (db) {
        const presenceRef = ref(db, `artevo-admin-presence/${user.uid}`);
        set(presenceRef, {
          email: user.email,
          displayName: user.displayName || "ARTÉVO Admin",
          photoURL: user.photoURL || null,
          status: "online",
          lastSeen: serverTimestamp(),
          userAgent: navigator.userAgent,
        }).catch(() => undefined);

        onDisconnect(presenceRef)
          .set({
            email: user.email,
            status: "offline",
            lastSeen: serverTimestamp(),
          })
          .catch(() => undefined);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [firebaseEnabled, router, user]);

  useEffect(() => {
    if (firebaseEnabled && !user) {
      fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined);
    }
  }, [firebaseEnabled, user]);

  return <AdminGuard>{children}</AdminGuard>;
}
