import { db, isDatabaseConfigured } from "@/db";
import { sql } from "drizzle-orm";
import { ensureDatabaseSeeded } from "@/db/init";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return Response.json({
      ok: true,
      status: "live_without_database",
      message: "ARTÉVO is serving fallback content. Add DATABASE_URL in Vercel to enable synced admin data.",
    });
  }

  try {
    await ensureDatabaseSeeded();
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, status: "database_connected" });
  } catch (error) {
    console.error("[ARTÉVO] Health database check failed:", error);
    return Response.json({
      ok: true,
      status: "live_database_unavailable",
      message: "ARTÉVO is live with fallback content while the database connection is unavailable.",
    });
  }
}
