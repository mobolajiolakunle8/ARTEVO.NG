import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  CLEAR_COOKIE,
  verifyAdminToken,
  isFallbackLoginAvailable,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 5; // 5 days

/** Reports whether the current browser holds a valid admin session. */
export async function GET() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  const verification = await verifyAdminToken(token);

  return Response.json({
    authenticated: verification.ok,
    email: verification.email || null,
    method: verification.method || null,
    fallbackAvailable: isFallbackLoginAvailable(),
  });
}

/** Exchanges a verified Firebase ID token for an HttpOnly admin session cookie. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token : "";

  const { verifyFirebaseAdminToken } = await import("@/lib/admin-auth");
  const verification = await verifyFirebaseAdminToken(token);

  if (!verification.ok) {
    return Response.json({ error: verification.reason || "Admin authentication failed." }, { status: 401 });
  }

  const isSecure = process.env.VERCEL === "1" || new URL(request.url).protocol === "https:";
  const response = Response.json({
    ok: true,
    email: verification.email,
    uid: verification.uid,
    method: "firebase",
  });
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${token}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${isSecure ? "; Secure" : ""}`
  );
  return response;
}

export async function DELETE() {
  const response = Response.json({ ok: true });
  response.headers.append("Set-Cookie", CLEAR_COOKIE);
  return response;
}
