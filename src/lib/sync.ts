/** Cross-tab / cross-browser sync via BroadcastChannel + storage fallbacks. */
export function createBroadcastChannel(name: string) {
  return typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(name) : null;
}

export function syncBroadcast(name: string, data: unknown) {
  const bc = createBroadcastChannel(name);
  if (bc) { bc.postMessage({ ts: Date.now(), payload: data }); }
}

export function listenBroadcast(name: string, handler: (payload: unknown) => void) {
  const bc = createBroadcastChannel(name);
  if (!bc) return () => {};
  const onMsg = (e: MessageEvent) => handler(e.data?.payload ?? e.data);
  bc.addEventListener("message", onMsg);
  return () => bc.removeEventListener("message", onMsg);
}
