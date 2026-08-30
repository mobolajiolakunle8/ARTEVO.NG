import { db, isDatabaseConfigured } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { eventType, path, artworkSlug, meta } = await request.json();

    if (!isDatabaseConfigured()) return NextResponse.json({ ok: true });

    await db.insert(analyticsEvents).values({
      eventType: eventType || "page_view",
      path: path || "/",
      artworkSlug: artworkSlug || null,
      meta: meta || {},
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/analytics/event error:", error);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
