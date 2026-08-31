import { db, isDatabaseConfigured } from "@/db";
import { publishLive } from "@/lib/sync";
import { orders, analyticsEvents } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { desc, eq, ilike, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await ensureDatabaseSeeded();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  try {
    let query = db.select().from(orders).orderBy(desc(orders.createdAt));

    const list = await query;
    let filtered = list;

    if (status && status !== "all") {
      filtered = filtered.filter((o) => o.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderRef.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.artworkTitle.toLowerCase().includes(q) ||
          o.artworkRef.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ orders: filtered });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database is not connected yet. Add DATABASE_URL in Vercel environment variables." }, { status: 503 });
  }
  await ensureDatabaseSeeded();
  try {
    const body = await request.json();

    // Generate reference code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderRef = body.orderRef || `ARTEVO-ORD-${randomSuffix}`;

    const [created] = await db
      .insert(orders)
      .values({
        orderRef,
        artworkId: body.artworkId ? Number(body.artworkId) : null,
        artworkTitle: body.artworkTitle || "Custom Piece",
        artworkRef: body.artworkRef || "ART-GEN-001",
        selectedSize: body.selectedSize || "Medium (24 × 36 in)",
        selectedFraming: body.selectedFraming || "Obsidian Ebonized Hardwood Frame",
        amount: Number(body.amount) || 1200,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        shippingAddress: body.shippingAddress,
        country: body.country || "International",
        notes: body.notes || "",
        paymentProofRef: body.paymentProofRef || "",
        status: "Payment Pending",
        paymentMethod: "Bank Transfer",
      })
      .returning();

    // Log analytics event
    await db.insert(analyticsEvents).values({
      eventType: "order_create",
      path: "/order",
      meta: { orderRef, artworkRef: body.artworkRef, amount: body.amount },
    });

    publishLive({ channel: "orders", action: "create", id: created.orderRef });
    return NextResponse.json({ order: created });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Failed to submit order" }, { status: 500 });
  }
}
