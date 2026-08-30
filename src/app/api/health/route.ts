import { db, isDatabaseConfigured } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return Response.json({ ok: true, database: false });
  }
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, database: true });
  } catch (error) {
    return Response.json({ ok: false, database: "error", error: String(error).slice(0, 200) }, { status: 500 });
  }
}
