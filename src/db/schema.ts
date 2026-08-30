import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  coverImage: text("cover_image").notNull(),
  featured: boolean("featured").default(false),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  collectionSlug: text("collection_slug").notNull(),
  story: text("story").notNull(),
  price: integer("price").notNull(),
  refCode: text("ref_code").notNull().unique(),
  image: text("image").notNull(),
  images: jsonb("images").$type<string[]>().default([]),
  sizeOptions: jsonb("size_options").$type<{ size: string; price: number; dimensions: string }[]>().default([]),
  orientation: text("orientation").notNull(), // "Portrait", "Landscape", "Square"
  editionType: text("edition_type").notNull(), // "Original Monotype", "Limited Edition (1/25)", "Open Gallery Edition"
  framingOptions: jsonb("framing_options").$type<string[]>().default([]),
  inStock: boolean("in_stock").default(true),
  featured: boolean("featured").default(false),
  watermarkEnabled: boolean("watermark_enabled").default(true),
  
  // Auction details
  auctionEnabled: boolean("auction_enabled").default(false),
  minBid: integer("min_bid").default(0),
  bidIncrement: integer("bid_increment").default(50),
  auctionEndTime: timestamp("auction_end_time"),
  auctionStatus: text("auction_status").default("none"), // "none", "active", "ended", "sold"
  currentHighestBid: integer("current_highest_bid").default(0),
  winnerEmail: text("winner_email"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderRef: text("order_ref").notNull().unique(),
  artworkId: integer("artwork_id"),
  artworkTitle: text("artwork_title").notNull(),
  artworkRef: text("artwork_ref").notNull(),
  selectedSize: text("selected_size").notNull(),
  selectedFraming: text("selected_framing").notNull(),
  amount: integer("amount").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  country: text("country").notNull(),
  notes: text("notes"),
  paymentProofRef: text("payment_proof_ref"),
  status: text("status").default("Payment Pending").notNull(), // "Payment Pending", "Payment Submitted", "Paid", "Processing & Framing", "Dispatched", "Delivered", "Cancelled"
  paymentMethod: text("payment_method").default("Bank Transfer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  artworkId: integer("artwork_id").notNull(),
  bidderName: text("bidder_name").notNull(),
  bidderEmail: text("bidder_email").notNull(),
  bidderPhone: text("bidder_phone").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").default("active").notNull(), // "active", "accepted", "outbid", "rejected"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalArticles = pgTable("journal_articles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(), // "Artist Story", "Interior Styling", "African Contemporary", "Collector Guide"
  coverImage: text("cover_image").notNull(),
  collectionSlug: text("collection_slug"),
  published: boolean("published").default(true).notNull(),
  readTime: text("read_time").default("5 min read"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const spacesContent = pgTable("spaces_content", {
  id: serial("id").primaryKey(),
  spaceKey: text("space_key").notNull().unique(), // "editions", "limited", "custom", "spaces"
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  heroImage: text("hero_image").notNull(),
  description: text("description").notNull(),
  features: jsonb("features").$type<{ title: string; desc: string }[]>().default([]),
  caseStudies: jsonb("case_studies").$type<{
    title: string;
    client: string;
    location: string;
    description: string;
    image: string;
    year: string;
  }[]>().default([]),
  ctaTitle: text("cta_title").notNull(),
  ctaText: text("cta_text").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentSettings = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  bankName: text("bank_name").notNull(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  sortCodeOrSwift: text("sort_code_or_swift").notNull(),
  currency: text("currency").default("USD ($)").notNull(),
  instructions: text("instructions").notNull(),
  contactEmail: text("contact_email").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "Custom Commission", "Hospitality & Commercial", "Collector Consultation", "General"
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  message: text("message").notNull(),
  artworkRef: text("artwork_ref"),
  status: text("status").default("New").notNull(), // "New", "In Touch", "Completed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // "page_view", "artwork_view", "cta_click", "bid_place", "order_create", "inquiry_submit"
  path: text("path").notNull(),
  artworkSlug: text("artwork_slug"),
  meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Key-value store for admin-editable website copy / settings */
export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  section: text("section").notNull(),   // e.g. "hero", "about", "contact_info", "brand"
  key: text("key").notNull(),           // e.g. "headline", "sub", "cta_label"
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source").default("footer"),
  status: text("status").default("subscribed").notNull(), // "subscribed", "unsubscribed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
