import { subscribeLive, type LiveEvent } from "@/lib/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-Sent Events (SSE) stream: every connected browser gets a live push
 * whenever another browser (or the admin studio) changes ARTÉVO content.
 *
 * Clients subscribe via `new EventSource("/api/sync/stream")` — no websockets,
 * no third-party services, and it works through Vercel's serverless proxy.
 * A heartbeat every 25s keeps the connection alive through idle proxies.
 */
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;

      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      // Initial hello so the browser knows the pipe is open.
      send("hello", { ts: Date.now() });

      const unsubscribe = subscribeLive((event: LiveEvent) => {
        send("change", event);
      });

      // Heartbeat every 25s
      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`));
        } catch {
          closed = true;
        }
      }, 25_000);

      // Cleanup once the client disconnects.
      const cleanup = () => {
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try { controller.close(); } catch { /* already closed */ }
      };

      (controller as unknown as { signal?: AbortSignal }).signal?.addEventListener("abort", cleanup);
      // Best-effort watchdog: close after 5 min so serverless functions recycle.
      setTimeout(cleanup, 5 * 60 * 1000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
