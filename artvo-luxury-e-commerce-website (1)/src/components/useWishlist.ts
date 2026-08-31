"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { syncBroadcast, listenBroadcast } from "@/lib/sync";
import { firebaseSyncListen } from "@/lib/firebase-sync";

/* ─────────────────────── Wishlist hook ─────────────────────── */

const KEY = "artevo_wishlist";

export interface WishlistItem {
  id: number;
  slug: string;
  title: string;
  artist: string;
  refCode: string;
  image: string;
  price: number;
  collectionSlug: string;
}

function read(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: WishlistItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("artevo-wishlist-change"));
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(read());
    const onChange = () => setItems(read());
    window.addEventListener("artevo-wishlist-change", onChange);
    window.addEventListener("storage", onChange);
    const unlisten = listenBroadcast("artevo-wishlist", () => setItems(read()));
    return () => {
      window.removeEventListener("artevo-wishlist-change", onChange);
      window.removeEventListener("storage", onChange);
      unlisten();
    };
  }, []);

  const has = useCallback((id: number) => items.some((i) => i.id === id), [items]);

  const toggle = useCallback((item: WishlistItem) => {
    const current = read();
    const exists = current.some((i) => i.id === item.id);
    const next = exists ? current.filter((i) => i.id !== item.id) : [...current, item];
    write(next);
    syncBroadcast("artevo-wishlist", { count: next.length, ts: Date.now() });
    setItems(next);
    return !exists;
  }, []);

  const remove = useCallback((id: number) => {
    const next = read().filter((i) => i.id !== id);
    write(next);
    syncBroadcast("artevo-wishlist", { count: next.length, ts: Date.now() });
    setItems(next);
  }, []);

  return { items, has, toggle, remove, count: items.length };
}

/* ─────────────────── Cross-browser live sync hook ─────────────────── */

/**
 * Subscribe a client component to cross-browser live updates.
 *
 * Combines four sync layers so the callback fires whenever content
 * changes anywhere:
 *   1. Firebase Realtime Database — instant global push (<200ms)
 *   2. Same-browser cross-tab pings — BroadcastChannel
 *   3. Server-Sent Events — fallback if Firebase isn't configured
 *   4. Tab focus catch-up — visibilitychange
 */
export function useLiveSync(channels: string[], onChange: () => void): void {
  const savedHandler = useRef(onChange);
  savedHandler.current = onChange;

  useEffect(() => {
    const call = () => savedHandler.current();
    const cleanups: Array<() => void> = [];

    // 1. Firebase Realtime Database (primary — instant global sync)
    cleanups.push(
      firebaseSyncListen(channels, () => call())
    );

    // 2. Same-browser cross-tab pings
    for (const channel of channels) {
      cleanups.push(listenBroadcast(`artevo-${channel}`, call));
    }

    // 3. SSE fallback (if Firebase RTDB isn't reachable)
    let source: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (typeof EventSource === "undefined") return;
      source = new EventSource("/api/sync/stream");
      source.addEventListener("change", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) as { channel?: string };
          if (data.channel && channels.includes(data.channel)) call();
        } catch {
          call();
        }
      });
      source.onerror = () => {
        source?.close();
        retryTimer = setTimeout(connect, 5000);
      };
    };
    connect();
    cleanups.push(() => {
      source?.close();
      if (retryTimer) clearTimeout(retryTimer);
    });

    // 4. On-focus catch-up
    const onVisibility = () => {
      if (document.visibilityState === "visible") call();
    };
    document.addEventListener("visibilitychange", onVisibility);
    cleanups.push(() => document.removeEventListener("visibilitychange", onVisibility));

    return () => cleanups.forEach((fn) => fn());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channels.join("|")]);
}
