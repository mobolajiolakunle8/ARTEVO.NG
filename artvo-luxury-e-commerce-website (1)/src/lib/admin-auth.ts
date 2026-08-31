import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA0Ho-ObbE0Uc9VIqDxvwnWeuwE6SGbcoY";

export const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "mobolajiolakunle8@gmail.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const ADMIN_COOKIE = "artevo_admin_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 5; // 5 days

/** Prefix that marks a cookie value as a locally-issued fallback session. */
const FALLBACK_PREFIX = "artevo-local.";

export type AdminVerification = {
  ok: boolean;
  email?: string;
  uid?: string;
  method?: "firebase" | "fallback";
  reason?: string;
};

type FirebaseLookupResponse = {
  users?: Array<{ localId: string; email?: string }>;
  error?: { message?: string };
};

/* ─────────────── Firebase token verification ─────────────── */

export async function verifyFirebaseAdminToken(token?: string | null): Promise<AdminVerification> {
  if (!token) return { ok: false, reason: "Missing Firebase ID token." };

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
        cache: "no-store",
      }
    );

    const data = (await response.json()) as FirebaseLookupResponse;
    const user = data.users?.[0];
    const email = user?.email?.toLowerCase();

    if (!response.ok || !user || !email) {
      return { ok: false, reason: data.error?.message || "Invalid Firebase session." };
    }

    if (!ADMIN_EMAILS.includes(email)) {
      return {
        ok: false,
        email,
        uid: user.localId,
        reason: "This user is not in the admin whitelist.",
      };
    }

    return { ok: true, email, uid: user.localId, method: "firebase" };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Could not verify Firebase session.",
    };
  }
}

/* ─────────────── Fallback session (Firebase unreachable) ─────────────── */

function getAccessCode(): string | null {
  const code = process.env.ADMIN_ACCESS_CODE || "";
  return code.trim().length >= 8 ? code.trim() : null;
}

function getFallbackSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_ACCESS_CODE || "";
  return secret.trim().length >= 8 ? secret.trim() : null;
}

/** True when the fallback unlock path is available in this environment. */
export function isFallbackLoginAvailable(): boolean {
  return getAccessCode() !== null && getFallbackSecret() !== null;
}

function issueFallbackToken(): string {
  const secret = getFallbackSecret() as string;
  const signature = createHmac("sha256", secret).update("artevo-admin-session").digest("hex");
  return `${FALLBACK_PREFIX}${signature}`;
}

function verifyFallbackToken(token: string): boolean {
  const secret = getFallbackSecret();
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update("artevo-admin-session").digest("hex");
  const supplied = token.slice(FALLBACK_PREFIX.length);

  if (supplied.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
  } catch {
    return false;
  }
}

/** Constant-time check of the admin access code. */
export function checkAccessCode(code: unknown): boolean {
  const expected = getAccessCode();
  if (!expected || typeof code !== "string") return false;
  const supplied = code.trim();
  if (supplied.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function buildFallbackCookie(): { value: string; maxAge: number } {
  return { value: issueFallbackToken(), maxAge: COOKIE_MAX_AGE };
}

export const CLEAR_COOKIE = `${ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;

/* ─────────────── Request verification ─────────────── */

/** Verifies either a Firebase ID token or a locally-issued fallback session. */
export async function verifyAdminToken(token?: string | null): Promise<AdminVerification> {
  if (!token) return { ok: false, reason: "Admin authentication required." };

  if (token.startsWith(FALLBACK_PREFIX)) {
    if (verifyFallbackToken(token)) {
      return { ok: true, email: ADMIN_EMAILS[0], method: "fallback" };
    }
    return { ok: false, reason: "Admin session expired. Please sign in again." };
  }

  return verifyFirebaseAdminToken(token);
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") || "";
  if (!header.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim() || null;
}

export async function verifyAdminRequest(request: Request): Promise<AdminVerification> {
  return verifyAdminToken(getBearerToken(request));
}

export async function verifyAdminCookie(): Promise<AdminVerification> {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

export function adminUnauthorized(reason = "Admin authentication required.") {
  return Response.json({ error: reason }, { status: 401 });
}
