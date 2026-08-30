import { db } from "./index";
import { sql } from "drizzle-orm";

let bootstrapPromise: Promise<void> | null = null;

/**
 * Creates the ARTÉVO PostgreSQL schema when it does not exist.
 *
 * This is intentionally idempotent (`IF NOT EXISTS`) and lets a fresh Vercel
 * deployment boot against any empty managed PostgreSQL database without
 * requiring a build-time migration command or drizzle-kit dependency.
 */
export function ensureDatabaseSchema(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const statements = [
        `CREATE TABLE IF NOT EXISTS collections (
          id serial PRIMARY KEY, slug text NOT NULL UNIQUE, name text NOT NULL,
          subtitle text, description text, cover_image text NOT NULL,
          featured boolean DEFAULT false, display_order integer DEFAULT 0,
          created_at timestamp DEFAULT now() NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS artworks (
          id serial PRIMARY KEY, slug text NOT NULL UNIQUE, title text NOT NULL,
          artist text NOT NULL, collection_slug text NOT NULL, story text NOT NULL,
          price integer NOT NULL, ref_code text NOT NULL UNIQUE, image text NOT NULL,
          images jsonb DEFAULT '[]'::jsonb, size_options jsonb DEFAULT '[]'::jsonb,
          orientation text NOT NULL, edition_type text NOT NULL,
          framing_options jsonb DEFAULT '[]'::jsonb, in_stock boolean DEFAULT true,
          featured boolean DEFAULT false, watermark_enabled boolean DEFAULT true,
          auction_enabled boolean DEFAULT false, min_bid integer DEFAULT 0,
          bid_increment integer DEFAULT 50, auction_end_time timestamp,
          auction_status text DEFAULT 'none', current_highest_bid integer DEFAULT 0,
          winner_email text, created_at timestamp DEFAULT now() NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS orders (
          id serial PRIMARY KEY, order_ref text NOT NULL UNIQUE, artwork_id integer,
          artwork_title text NOT NULL, artwork_ref text NOT NULL, selected_size text NOT NULL,
          selected_framing text NOT NULL, amount integer NOT NULL, customer_name text NOT NULL,
          customer_email text NOT NULL, customer_phone text NOT NULL, shipping_address text NOT NULL,
          country text NOT NULL, notes text, payment_proof_ref text,
          status text DEFAULT 'Payment Pending' NOT NULL,
          payment_method text DEFAULT 'Bank Transfer' NOT NULL,
          created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS bids (
          id serial PRIMARY KEY, artwork_id integer NOT NULL, bidder_name text NOT NULL,
          bidder_email text NOT NULL, bidder_phone text NOT NULL, amount integer NOT NULL,
          status text DEFAULT 'active' NOT NULL, created_at timestamp DEFAULT now() NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS journal_articles (
          id serial PRIMARY KEY, slug text NOT NULL UNIQUE, title text NOT NULL,
          excerpt text NOT NULL, content text NOT NULL, author text NOT NULL,
          category text NOT NULL, cover_image text NOT NULL, collection_slug text,
          published boolean DEFAULT true NOT NULL, read_time text DEFAULT '5 min read',
          created_at timestamp DEFAULT now() NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS spaces_content (
          id serial PRIMARY KEY, space_key text NOT NULL UNIQUE, title text NOT NULL,
          subtitle text NOT NULL, hero_image text NOT NULL, description text NOT NULL,
          features jsonb DEFAULT '[]'::jsonb, case_studies jsonb DEFAULT '[]'::jsonb,
          cta_title text NOT NULL, cta_text text NOT NULL,
          updated_at timestamp DEFAULT now() NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS payment_settings (
          id serial PRIMARY KEY, bank_name text NOT NULL, account_name text NOT NULL,
          account_number text NOT NULL, sort_code_or_swift text NOT NULL,
          currency text DEFAULT 'Nigerian Naira (₦)' NOT NULL, instructions text NOT NULL,
          contact_email text NOT NULL, updated_at timestamp DEFAULT now() NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS inquiries (
          id serial PRIMARY KEY, type text NOT NULL, name text NOT NULL, email text NOT NULL,
          phone text, company text, message text NOT NULL, artwork_ref text,
          status text DEFAULT 'New' NOT NULL, created_at timestamp DEFAULT now() NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS analytics_events (
          id serial PRIMARY KEY, event_type text NOT NULL, path text NOT NULL,
          artwork_slug text, meta jsonb DEFAULT '{}'::jsonb,
          created_at timestamp DEFAULT now() NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS site_content (
          id serial PRIMARY KEY, section text NOT NULL, key text NOT NULL,
          value text NOT NULL DEFAULT '', updated_at timestamp DEFAULT now() NOT NULL,
          UNIQUE(section, key)
        )`,
        `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id serial PRIMARY KEY, email text NOT NULL UNIQUE, source text DEFAULT 'footer',
          status text DEFAULT 'subscribed' NOT NULL, created_at timestamp DEFAULT now() NOT NULL
        )`,
      ];

      for (const statement of statements) {
        await db.execute(sql.raw(statement));
      }
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  return bootstrapPromise;
}
