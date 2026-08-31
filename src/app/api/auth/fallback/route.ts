import {
  ADMIN_COOKIE,
  CLEAR_COOKIE,
  buildFallbackCookie,
  checkAccessCode,
  isFallbackLoginAvailable,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * Emergency admin unlock for when Firebase Auth is unreachable
 * (auth/network-request-failed, corporate firewall, offline, blocked region).
 *
 * Enabled only when ADMIN_ACCESS_CODE is set in the environment. The issued
 * cookie is an HMAC session token, never the access code itself, so the code is
 * never exposed to the browser.
 */
export async function GET() {
  return Response.json({ available: isFallbackLoginAvailable() });
}

export async function POST(request: Request) {
  if (!isFallbackLoginAvailable()) {
    return Response.json(
      { error: "Backup unlock is not enabled. Set ADMIN_ACCESS_CODE in Vercel environment variables." },
      { status: 404 }
    );
  }

  const body = await request.json().catch(() => ({}));

  if (!checkAccessCode(body.code)) {
    return Response.json({ error: "Incorrect access code." }, { status: 401 });
  }

  const { value, maxAge } = buildFallbackCookie();
  const isSecure = process.env.VERCEL === "1" || new URL(request.url).protocol === "https:";

  const response = Response.json({ ok: true, method: "fallback" });
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${isSecure ? "; Secure" : ""}`
  );
  return response;
}

export async function DELETE() {
  const response = Response.json({ ok: true });
  response.headers.append("Set-Cookie", CLEAR_COOKIE);
  return response;
}
