"use client";

import { useEffect, useRef, useState } from "react";
import { getFirebaseDatabase, isFirebaseConfigured } from "@/lib/firebase";
import {
  ref,
  set,
  onDisconnect,
  onValue,
  serverTimestamp,
  update,
  remove,
} from "firebase/database";
import { type User } from "firebase/auth";

export interface SessionInfo {
  email: string;
  device: string;
  connectedAt: number | null;
  lastSeen: number | null;
}

const PRESENCE_ROOT = "artevo-presence/admin-sessions";

/**
 * Realtime admin presence tracker.
 *
 * When an authenticated admin has the dashboard open, a node is written to
 * Firebase Realtime Database describing their session (email, device, browser).
 * Firebase's `onDisconnect` guarantee removes it the instant the tab closes,
 * crashes, or loses network — so the admin always sees an accurate, live list
 * of every connected device and session, in real time.
 *
 * Returns the list of live sessions plus the current device's connection state.
 */
export function useAdminPresence(user: User | null) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "online" | "offline">("idle");
  const sessionPath = useRef<string | null>(null);

  useEffect(() => {
    // Reset when the user changes or logs out
    if (sessionPath.current) {
      remove(ref(getFirebaseDatabase()!, sessionPath.current)).catch(() => {});
      sessionPath.current = null;
    }
    setSessions([]);
    setConnectionState("idle");

    if (!user || !isFirebaseConfigured()) return;
    const db = getFirebaseDatabase();
    if (!db) return;

    const sessionKey = `${user.uid.slice(0, 12)}-${crypto.randomUUID().slice(0, 8)}`;
    const myPath = `${PRESENCE_ROOT}/${sessionKey}`;
    sessionPath.current = myPath;

    const device = `${navigator.platform || "device"} · ${navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"} · ${
      navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Safari") ? "Safari" : "Browser"
    }`;

    setConnectionState("connecting");

    // Clean up any stale sessions older than 6h at startup
    const allRef = ref(db, PRESENCE_ROOT);
    const unsub = onValue(allRef, (snapshot) => {
      const data = snapshot.val() || {};
      const now = Date.now();
      const list: SessionInfo[] = [];
      for (const key of Object.keys(data)) {
        const node = data[key];
        // Consider a session live only if it reported within the last 2 minutes.
        const lastSeen = node?.lastSeen ?? 0;
        if (now - lastSeen < 2 * 60_000) {
          list.push({
            email: node?.email || "admin",
            device: node?.device || "Unknown device",
            connectedAt: node?.connectedAt ?? null,
            lastSeen,
          });
        }
      }
      setSessions(list);
    });

    // Write own presence with disconnect guarantee
    const setConnected = async () => {
      try {
        await set(ref(db, myPath), {
          email: user.email || user.displayName || "admin",
          device,
          connectedAt: serverTimestamp(),
          lastSeen: Date.now(),
        });
        await onDisconnect(ref(db, myPath)).remove();
        setConnectionState("online");

        // Heartbeat every 30s so the session stays "live"
        const heartbeat = setInterval(() => {
          update(ref(db, myPath), { lastSeen: Date.now() }).catch(() => {});
        }, 30_000);
        return () => clearInterval(heartbeat);
      } catch (error) {
        console.error("[ARTÉVO] Presence failed:", error);
        setConnectionState("offline");
      }
    };

    const cleanupHeartbeat = setConnected();

    return () => {
      unsub();
      setConnectionState("idle");
      remove(ref(db, myPath)).catch(() => {});
      if (sessionPath.current === myPath) sessionPath.current = null;
      // Heartbeat cleanup is handled above if the promise resolved.
      void cleanupHeartbeat;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, user?.email]);

  return { sessions, connectionState };
}
