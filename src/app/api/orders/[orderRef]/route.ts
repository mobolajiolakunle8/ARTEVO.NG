import { db, isDatabaseConfigured } from "@/db";
import { adminUnauthorized, verifyAdminRequest } from "@/lib/admin-auth";
import { publishLive } from "@/lib/sync";
import { orders } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  await ensureDatabaseSeeded();
  const { orderRef } = await params;

  try {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderRef, orderRef));

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("GET /api/orders/[orderRef] error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database is not connected yet. Add DATABASE_URL in Vercel environment variables." },
      { status: 503 }
    );
  }
  await ensureDatabaseSeeded();
  const { orderRef } = await params;

  try {
    const body = await request.json();
    const isCustomerPaymentSubmission =
      body.status === "Payment Submitted" && typeof body.paymentProofRef === "string";
    const adminOnlyUpdate = Boolean((body.status && !isCustomerPaymentSubmission) || body.shippingAddress);
    if (adminOnlyUpdate) {
      const admin = await verifyAdminRequest(request);
      if (!admin.ok) return adminUnauthorized(admin.reason);
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.status) updateFields.status = body.status;
    if (body.paymentProofRef !== undefined) updateFields.paymentProofRef = body.paymentProofRef;
    if (body.notes !== undefined) updateFields.notes = body.notes;
    if (body.shippingAddress) updateFields.shippingAddress = body.shippingAddress;

    const [updated] = await db
      .update(orders)
      .set(updateFields)
      .where(eq(orders.orderRef, orderRef))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    publishLive({ channel: "orders", action: "update", id: updated.orderRef });
    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("PUT /api/orders/[orderRef] error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
