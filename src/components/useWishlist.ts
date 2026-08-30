"use client";

import { useState, useEffect, useCallback } from "react";

const KEY = "artevo_wishlist";
const CHANNEL = "artevo-wishlist";

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

function broadcastChange(count: number) {
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(CHANNEL);
  channel.postMessage({ count, updatedAt: new Date().toISOString() });
  channel.close();
}

function write(items: WishlistItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("artevo-wishlist-change"));
  broadcastChange(items.length);
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(read());
    const sync = () => setItems(read());
    window.addEventListener("artevo-wishlist-change", sync);
    window.addEventListener("storage", sync);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(CHANNEL);
      channel.addEventListener("message", sync);
    }

    return () => {
      window.removeEventListener("artevo-wishlist-change", sync);
      window.removeEventListener("storage", sync);
      channel?.removeEventListener("message", sync);
      channel?.close();
    };
  }, []);

  const has = useCallback((id: number) => items.some((item) => item.id === id), [items]);

  const toggle = useCallback((item: WishlistItem) => {
    const current = read();
    const exists = current.some((entry) => entry.id === item.id);
    const next = exists ? current.filter((entry) => entry.id !== item.id) : [...current, item];
    write(next);
    setItems(next);
    return !exists;
  }, []);

  const remove = useCallback((id: number) => {
    const next = read().filter((entry) => entry.id !== id);
    write(next);
    setItems(next);
  }, []);

  return { items, has, toggle, remove, count: items.length };
}
