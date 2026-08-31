import { NextResponse } from "next/server";
import { db, isDatabaseConfigured } from "@/db";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Deep environment diagnostics used by the admin setup wizard.
 * Reports exactly what is (and is not) configured so the operator can act
 * without leaving the dashboard.
 */
export async function GET() {
  const databaseUrl = process.env.DATABASE_URL || "";
  const isConfigured = isDatabaseConfigured();

  let connection: "ok" | "failed" | "not-configured" = "not-configured";
  let latencyMs: number | null = null;
  let tables: string[] = [];
  let errorMessage: string | null = null;

  if (isConfigured) {
    const started = Date.now();
    try {
      await db.execute(sql`SELECT 1`);
      connection = "ok";
      latencyMs = Date.now() - started;

      const result = await db.execute<{ table_name: string }>(
        sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
      );
      const rows = (result as unknown as { rows?: Array<{ table_name: string }> }).rows;
      tables = Array.isArray(rows) ? rows.map((row) => row.table_name) : [];
    } catch (error) {
      connection = "failed";
      errorMessage = error instanceof Error ? error.message.slice(0, 200) : String(error).slice(0, 200);
    }
  }

  // Provider hint from the URL (masked — never returns the full string)
  let provider = "unknown";
  let host = "";
  try {
    if (databaseUrl) {
      const parsed = new URL(databaseUrl.replace(/^postgres(ql)?:/, "https:"));
      host = parsed.hostname;
      if (/neon\.tech$/.test(host)) provider = "Neon";
      else if (/supabase\.(co|com)$/.test(host)) provider = "Supabase";
      else if (/vercel-storage\.com$/.test(host)) provider = "Vercel Postgres";
      else if (/railway\.app$/.test(host)) provider = "Railway";
      else if (/render\.com$/.test(host)) provider = "Render";
      else if (/localhost|127\.0\.0\.1/.test(host)) provider = "Local";
      else provider = host || "Custom PostgreSQL";
    }
  } catch {
    /* ignore malformed URL — leave provider unknown */
  }

  return NextResponse.json({
    environment: process.env.VERCEL ? "vercel" : "local",
    databaseConfigured: isConfigured,
    databaseConnection: connection,
    databaseLatencyMs: latencyMs,
    databaseProvider: provider,
    databaseHost: host,
    databaseError: errorMessage,
    tables,
    expectedTables: [
      "collections",
      "artworks",
      "orders",
      "bids",
      "journal_articles",
      "spaces_content",
      "payment_settings",
      "inquiries",
      "analytics_events",
      "site_content",
      "newsletter_subscribers",
    ],
    nodeVersion: process.version,
    checkedAt: new Date().toISOString(),
  });
}
