"use client";

import { useEffect, type ReactNode } from "react";
import { AdminGuard, useAuth } from "@/components/useAuth";
import { requestNotificationPermission } from "@/lib/firebase-messaging";
import { isFirebaseConfigured } from "@/lib/firebase";

/**
 * Client wrapper for the admin page:
 *  1. Gates access behind Firebase Auth (when configured)
 *  2. Auto-requests FCM push notifications after sign-in
 */
export default function AdminShell({ children }: { children: ReactNode }) {
  const { user, firebaseEnabled } = useAuth();

  // Request push permission after auth
  useEffect(() => {
    if (firebaseEnabled && user && isFirebaseConfigured()) {
      requestNotificationPermission().catch(() => {});
    }
  }, [firebaseEnabled, user]);

  return <AdminGuard>{children}</AdminGuard>;
}
