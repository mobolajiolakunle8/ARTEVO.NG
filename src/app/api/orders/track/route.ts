import { db, isDatabaseConfigured } from "@/db";
import { orders } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq, and, ilike } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Order tracking is unavailable until the database is connected." },
      { status: 503 }
    );
  }
  try {
    const { orderRef, email } = await request.json();

    if (!orderRef) {
      return NextResponse.json({ error: "Order reference code is required" }, { status: 400 });
    }

    const cleanRef = orderRef.trim().toUpperCase();

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderRef, cleanRef));

    if (!order) {
      return NextResponse.json({ error: "No order found with this reference code" }, { status: 404 });
    }

    if (email && email.trim() !== "") {
      if (order.customerEmail.toLowerCase() !== email.trim().toLowerCase()) {
        return NextResponse.json({ error: "Email address does not match this order reference" }, { status: 403 });
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("POST /api/orders/track error:", error);
    return NextResponse.json({ error: "Tracking request failed" }, { status: 500 });
  }
}
