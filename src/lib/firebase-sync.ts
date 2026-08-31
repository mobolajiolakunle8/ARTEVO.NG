"use client";

import { getFirebaseDatabase, isFirebaseConfigured } from "@/lib/firebase";
import { ref, push, onValue, serverTimestamp, type Unsubscribe } from "firebase/database";

/**
 * Firebase Realtime Database live sync.
 *
 * When a write happens (order, bid, artwork edit, site-content update),
 * a small pulse is pushed to /artevo-sync/{channel}. Every connected
 * browser receives it in <200ms globally — no SSE, no polling, no serverless
 * timeout constraints.
 *
 * Path: https://artevo-1188a-default-rtdb.firebaseio.com/artevo-sync/
 */
const SYNC_ROOT = "artevo-sync";

export interface SyncPulse {
  channel: string;
  action?: string;
  id?: string | number;
  ts: unknown; // serverTimestamp placeholder
}

/**
 * Push a sync pulse to Firebase RTDB so every connected browser hears it.
 * Call this from client components after a successful API write.
 */
export function firebaseSyncPush(channel: string, action?: string, id?: string | number) {
  if (!isFirebaseConfigured()) return;
  const db = getFirebaseDatabase();
  if (!db) return;

  const channelRef = ref(db, `${SYNC_ROOT}/${channel}`);
  push(channelRef, {
    action: action || "update",
    id: id ?? null,
    ts: serverTimestamp(),
  }).catch((error) => {
    console.error("[ARTÉVO] Firebase sync push failed:", error);
  });
}

/**
 * Listen for sync pulses on one or more channels.
 * Returns an unsubscribe function.
 */
export function firebaseSyncListen(
  channels: string[],
  callback: (channel: string, data: Record<string, unknown>) => void
): () => void {
  if (!isFirebaseConfigured()) return () => {};
  const db = getFirebaseDatabase();
  if (!db) return () => {};

  const unsubs: Unsubscribe[] = [];

  for (const channel of channels) {
    const channelRef = ref(db, `${SYNC_ROOT}/${channel}`);
    let isFirst = true;
    const unsub = onValue(channelRef, (snapshot) => {
      // Skip the initial load (we only care about live changes)
      if (isFirst) {
        isFirst = false;
        return;
      }
      callback(channel, snapshot.val() || {});
    });
    unsubs.push(unsub);
  }

  return () => unsubs.forEach((fn) => fn());
}
