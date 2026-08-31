import { db, isDatabaseConfigured } from "@/db";
import { adminUnauthorized, verifyAdminRequest } from "@/lib/admin-auth";
import { publishLive } from "@/lib/sync";
import { inquiries, analyticsEvents } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin.ok) return adminUnauthorized(admin.reason);
  await ensureDatabaseSeeded();
  try {
    const list = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
    return NextResponse.json({ inquiries: list });
  } catch (error) {
    console.error("GET /api/inquiries error:", error);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database is not connected yet. Add DATABASE_URL in Vercel environment variables." }, { status: 503 });
  }
  await ensureDatabaseSeeded();
  try {
    const body = await request.json();

    const [created] = await db
      .insert(inquiries)
      .values({
        type: body.type || "General Inquiry",
        name: body.name,
        email: body.email,
        phone: body.phone || "",
        company: body.company || "",
        message: body.message,
        artworkRef: body.artworkRef || "",
        status: "New",
      })
      .returning();

    // Log analytics event
    await db.insert(analyticsEvents).values({
      eventType: "inquiry_submit",
      path: "/contact",
      meta: { type: body.type, name: body.name, email: body.email },
    });

    publishLive({ channel: "inquiries", action: "create", id: created.id });
    return NextResponse.json({ inquiry: created });
  } catch (error) {
    console.error("POST /api/inquiries error:", error);
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 });
  }
}
