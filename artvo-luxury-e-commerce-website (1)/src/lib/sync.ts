/**
 * ARTÉVO sync infrastructure — server + client helpers in one place.
 *
 * BROWSER SIDE
 *   • createBroadcastChannel / syncBroadcast / listenBroadcast
 *     Same-browser cross-tab messaging via the BroadcastChannel API.
 *
 * SERVER SIDE
 *   • subscribeLive / publishLive
 *     Cross-browser event bus consumed by /api/sync/stream (SSE) so a change
 *     posted from one browser is pushed to every other connected browser.
 */

// ────────────────────────────────
// Client-side (BroadcastChannel)
// ────────────────────────────────
export function createBroadcastChannel(name: string) {
  return typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(name) : null;
}

export function syncBroadcast(name: string, data: unknown) {
  const bc = createBroadcastChannel(name);
  if (bc) bc.postMessage({ ts: Date.now(), payload: data });
}

export function listenBroadcast(name: string, handler: (payload: unknown) => void) {
  const bc = createBroadcastChannel(name);
  if (!bc) return () => {};
  const onMsg = (event: MessageEvent) => handler(event.data?.payload ?? event.data);
  bc.addEventListener("message", onMsg);
  return () => bc.removeEventListener("message", onMsg);
}

// ────────────────────────────────
// Server-side (live event bus for SSE)
// ────────────────────────────────
export type LiveEvent = {
  channel: string;
  action?: string;
  id?: string | number;
  ts: number;
};

type Listener = (event: LiveEvent) => void;

const globalForBus = globalThis as typeof globalThis & { __artevoLiveBus?: Set<Listener> };

function getListeners(): Set<Listener> {
  if (!globalForBus.__artevoLiveBus) globalForBus.__artevoLiveBus = new Set();
  return globalForBus.__artevoLiveBus;
}

export function subscribeLive(listener: Listener): () => void {
  const listeners = getListeners();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publishLive(event: Omit<LiveEvent, "ts"> & { ts?: number }) {
  const payload: LiveEvent = { ts: Date.now(), ...event };
  for (const listener of getListeners()) {
    try { listener(payload); } catch (error) { console.error("[ARTÉVO sync bus]", error); }
  }
}
