import { db } from "@/db";
import { paymentSettings } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  await ensureDatabaseSeeded();
  try {
    const [settings] = await db.select().from(paymentSettings).limit(1);
    return NextResponse.json({ settings: settings || null });
  } catch (error) {
    console.error("GET /api/payment-settings error:", error);
    return NextResponse.json({ error: "Failed to fetch payment settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  await ensureDatabaseSeeded();
  try {
    const body = await request.json();
    const [existing] = await db.select().from(paymentSettings).limit(1);

    if (existing) {
      const [updated] = await db
        .update(paymentSettings)
        .set({
          bankName: body.bankName,
          accountName: body.accountName,
          accountNumber: body.accountNumber,
          sortCodeOrSwift: body.sortCodeOrSwift,
          currency: body.currency || "USD ($)",
          instructions: body.instructions,
          contactEmail: body.contactEmail,
          updatedAt: new Date(),
        })
        .where(eq(paymentSettings.id, existing.id))
        .returning();

      return NextResponse.json({ settings: updated });
    } else {
      const [created] = await db
        .insert(paymentSettings)
        .values({
          bankName: body.bankName,
          accountName: body.accountName,
          accountNumber: body.accountNumber,
          sortCodeOrSwift: body.sortCodeOrSwift,
          currency: body.currency || "USD ($)",
          instructions: body.instructions,
          contactEmail: body.contactEmail,
        })
        .returning();

      return NextResponse.json({ settings: created });
    }
  } catch (error) {
    console.error("PUT /api/payment-settings error:", error);
    return NextResponse.json({ error: "Failed to update payment settings" }, { status: 500 });
  }
}
