import { db, isDatabaseConfigured } from "@/db";
import { adminUnauthorized, verifyAdminRequest } from "@/lib/admin-auth";
import { publishLive } from "@/lib/sync";
import { siteContent } from "@/db/schema";
import { ensureDatabaseSeeded } from "@/db/init";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// Default content — shown before admin saves anything
export const DEFAULT_CONTENT: Record<string, Record<string, string>> = {
  hero: {
    headline: "Art. Evolved.",
    sub: "We believe the art you live with should feel like a part of your story — not an afterthought.",
    cta_primary: "Explore the Collection",
    cta_secondary: "About ARTÉVO",
    badge: "Contemporary art, made meaningful",
  },
  announcement: {
    enabled: "1",
    ticker:
      "New arrivals in the African Soul collection | Limited editions now open for acquisition | Bespoke commissions for homes, offices & hospitality | Order via bank transfer with full tracking",
  },
  about_section: {
    headline: "More than something beautiful to look at.",
    body: "ARTÉVO is a contemporary art and wall décor brand from Ibadan, Nigeria, creating and curating work that makes a space feel more like you. For the first home, the new office, the room that needs more soul.",
    cta: "Discover our world",
  },
  contact_info: {
    email: "mobolajiolakunle8@gmail.com",
    phone: "0903 019 2034",
    whatsapp: "0903 019 2034",
    address: "Ibadan, Oyo State, Nigeria",
    studio_hours: "Monday – Saturday · 9 AM – 6 PM WAT",
  },
  brand: {
    business_name: "ARTÉVO Nigeria Limited",
    founded: "2026",
    city: "Ibadan",
    state: "Oyo State",
    country: "Nigeria",
    tagline: "Art. Evolved.",
  },
  journal_section: {
    headline: "Notes on Seeing.",
    sub: "Essays, artist stories and interior styling from the ARTÉVO editorial desk.",
  },
  spaces_section: {
    headline: "How will you live with art?",
    sub: "From one considered piece to a whole new atmosphere.",
  },
  footer_note: {
    copy: "ARTÉVO is an African-origin contemporary art and wall décor brand based in Ibadan, Nigeria. Established in 2026, we create, curate, print, frame, and sell meaningful artwork for homes, executive offices, hospitality projects, and private collectors.",
  },
};

export async function GET() {
  await ensureDatabaseSeeded();
  try {
    const rows = await db.select().from(siteContent);
    // Merge DB values on top of defaults
    const result = JSON.parse(JSON.stringify(DEFAULT_CONTENT)) as typeof DEFAULT_CONTENT;
    for (const row of rows) {
      if (!result[row.section]) result[row.section] = {};
      result[row.section][row.key] = row.value;
    }
    return NextResponse.json({ content: result });
  } catch (err) {
    console.error("GET /api/site-content", err);
    return NextResponse.json({ content: DEFAULT_CONTENT });
  }
}

export async function PUT(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin.ok) return adminUnauthorized(admin.reason);

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database is not connected yet. Add DATABASE_URL in Vercel environment variables." }, { status: 503 });
  }
  await ensureDatabaseSeeded();
  try {
    const body = await request.json() as Record<string, Record<string, string>>;
    for (const [section, keys] of Object.entries(body)) {
      for (const [key, value] of Object.entries(keys)) {
        const [existing] = await db
          .select()
          .from(siteContent)
          .where(and(eq(siteContent.section, section), eq(siteContent.key, key)));

        if (existing) {
          await db
            .update(siteContent)
            .set({ value: String(value), updatedAt: new Date() })
            .where(and(eq(siteContent.section, section), eq(siteContent.key, key)));
        } else {
          await db.insert(siteContent).values({ section, key, value: String(value) });
        }
      }
    }
    publishLive({ channel: "site-content", action: "update" });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/site-content", err);
    return NextResponse.json({ error: "Failed to save content." }, { status: 500 });
  }
}
