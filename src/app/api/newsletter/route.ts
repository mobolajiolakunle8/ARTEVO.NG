import { db, isDatabaseConfigured } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  await ensureDatabaseSeeded();
  try {
    const list = await db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt));
    return NextResponse.json({ subscribers: list });
  } catch (error) {
    console.error("GET /api/newsletter error:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database is not connected yet. Add DATABASE_URL in Vercel environment variables." }, { status: 503 });
  }
  await ensureDatabaseSeeded();
  try {
    const { email, source } = await request.json();
    const clean = (email || "").trim().toLowerCase();

    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, clean));

    if (existing) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }

    const [created] = await db
      .insert(newsletterSubscribers)
      .values({ email: clean, source: source || "footer", status: "subscribed" })
      .returning();

    return NextResponse.json({ ok: true, subscriber: created });
  } catch (error) {
    console.error("POST /api/newsletter error:", error);
    return NextResponse.json({ error: "Subscription failed. Please try again." }, { status: 500 });
  }
}
