"use client";

import { useState, useEffect, useCallback } from "react";
import { syncBroadcast, listenBroadcast } from "@/lib/sync";

const KEY = "artevo_wishlist";

export interface WishlistItem {
  id: number; slug: string; title: string; artist: string;
  refCode: string; image: string; price: number; collectionSlug: string;
}

function read(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

function write(items: WishlistItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("artevo-wishlist-change"));
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(read());
    const sync = () => setItems(read());
    window.addEventListener("artevo-wishlist-change", sync);
    window.addEventListener("storage", sync);
    const unlisten = listenBroadcast("artevo-wishlist", () => setItems(read()));
    return () => {
      window.removeEventListener("artevo-wishlist-change", sync);
      window.removeEventListener("storage", sync);
      unlisten();
    };
  }, []);

  const has = useCallback((id: number) => items.some((i) => i.id === id), [items]);

  const toggle = useCallback((item: WishlistItem) => {
    const current = read();
    const exists = current.some((i) => i.id === item.id);
    const next = exists ? current.filter((i) => i.id !== item.id) : [...current, item];
    write(next);
    syncBroadcast("artevo-wishlist", { count: next.length, updatedAt: new Date().toISOString() });
    setItems(next);
    return !exists;
  }, []);

  const remove = useCallback((id: number) => {
    const next = read().filter((i) => i.id !== id);
    write(next);
    syncBroadcast("artevo-wishlist", { count: next.length, updatedAt: new Date().toISOString() });
    setItems(next);
  }, []);

  return { items, has, toggle, remove, count: items.length };
}
