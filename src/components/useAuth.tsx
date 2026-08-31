"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { isFirebaseConfigured, getFirebaseAuth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { BRAND } from "@/lib/brand";
import {
  ShieldCheck,
  LogIn,
  Mail,
  Lock,
  Loader2,
  WifiOff,
  RefreshCw,
  KeyRound,
  AlertTriangle,
  Globe,
} from "lucide-react";
import Logo from "./Logo";

/* ─────────────── Error mapping ─────────────── */

/** Converts raw Firebase error codes into clear, actionable messages. */
function explainAuthError(error: unknown): { code: string; message: string; isNetwork: boolean } {
  const raw = error instanceof Error ? error.message : String(error);
  const codeMatch = raw.match(/\(auth\/([a-z-]+)\)/);
  const code = codeMatch ? codeMatch[1] : "unknown";

  const map: Record<string, { message: string; isNetwork?: boolean }> = {
    "network-request-failed": {
      message:
        "Could not reach Firebase. Check your internet connection, disable VPN/ad-blockers, or try the backup access code below.",
      isNetwork: true,
    },
    "invalid-credential": { message: "Incorrect email or password." },
    "wrong-password": { message: "Incorrect password." },
    "user-not-found": { message: "No admin account exists with that email." },
    "invalid-email": { message: "That email address is not valid." },
    "user-disabled": { message: "This admin account has been disabled." },
    "too-many-requests": { message: "Too many attempts. Please wait a moment and try again." },
    "unauthorized-domain": {
      message: `This domain (${typeof window !== "undefined" ? window.location.hostname : ""}) is not authorised. Add it in Firebase Console → Authentication → Settings → Authorized domains.`,
    },
    "operation-not-allowed": {
      message: "This sign-in method is disabled. Enable it in Firebase Console → Authentication → Sign-in method.",
    },
    "popup-blocked": { message: "Your browser blocked the sign-in window. Allow popups and try again." },
    "popup-closed-by-user": { message: "Sign-in window was closed before completing." },
    "api-key-not-valid": { message: "Firebase API key is invalid or missing in Vercel environment variables." },
    "admin-restricted-operation": { message: "This operation is restricted." },
  };

  const entry = map[code];
  return {
    code,
    message: entry?.message || raw.replace("Firebase: ", ""),
    isNetwork: Boolean(entry?.isNetwork) || code === "network-request-failed",
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* ─────────────── Auth context ─────────────── */

interface AuthCtx {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  /** Raw Firebase error code from the last failed attempt (e.g. network-request-failed). */
  authCode: string;
  /** Human-readable explanation of the last failure. */
  authMessage: string;
  /** True when the last failure was a network/connectivity problem. */
  authIsNetwork: boolean;
  firebaseEnabled: boolean;
  /** True when signed in via the backup access-code session. */
  fallbackSession: boolean;
  /** Whether the server has the backup unlock path enabled. */
  fallbackAvailable: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInWithAccessCode: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  isAdmin: false,
  authCode: "",
  authMessage: "",
  authIsNetwork: false,
  firebaseEnabled: false,
  fallbackSession: false,
  fallbackAvailable: false,
  signInEmail: async () => {},
  signInGoogle: async () => {},
  signInWithAccessCode: async () => {},
  signOut: async () => {},
  clearAuthError: () => {},
});

export const useAuth = () => useContext(AuthContext);

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || BRAND.email)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/* ─────────────── Provider ─────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fallbackSession, setFallbackSession] = useState(false);
  const [fallbackAvailable, setFallbackAvailable] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authIsNetwork, setAuthIsNetwork] = useState(false);

  const firebaseEnabled = isFirebaseConfigured();

  /** Asks the server whether this browser already holds a valid admin session. */
  const refreshServerSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = await res.json();
      setFallbackAvailable(Boolean(data.fallbackAvailable));
      if (data.authenticated) {
        setFallbackSession(data.method === "fallback");
        return true;
      }
      setFallbackSession(false);
      return false;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      const hasServerSession = await refreshServerSession();

      if (!firebaseEnabled) {
        if (!cancelled) setLoading(false);
        return;
      }

      const auth = getFirebaseAuth();
      if (!auth) {
        if (!cancelled) setLoading(false);
        return;
      }

      const unsubscribe = onAuthStateChanged(
        auth,
        (u) => {
          if (cancelled) return;
          setUser(u);
          // Only clear the fallback flag when a real Firebase session exists
          if (u) setFallbackSession(false);
          setLoading(false);
        },
        () => {
          // onAuthStateChanged itself errored (e.g. network) — keep going
          if (!cancelled) setLoading(false);
        }
      );

      // If the server already trusts this browser, stop the loading spinner
      // even if Firebase is unreachable and cannot restore the client session.
      if (hasServerSession) {
        await sleep(1200);
        if (!cancelled) setLoading(false);
      }

      return unsubscribe;
    };

    boot();

    return () => {
      cancelled = true;
    };
  }, [firebaseEnabled, refreshServerSession]);

  const isAdmin =
    !firebaseEnabled ||
    fallbackSession ||
    (!!user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || ""));

  const clearAuthError = useCallback(() => {
    setAuthCode("");
    setAuthMessage("");
    setAuthIsNetwork(false);
  }, []);

  const fail = useCallback((error: unknown) => {
    const parsed = explainAuthError(error);
    setAuthCode(parsed.code);
    setAuthMessage(parsed.message);
    setAuthIsNetwork(parsed.isNetwork);
    throw new Error(parsed.message);
  }, []);

  const signInEmail = useCallback(
    async (email: string, password: string) => {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase Auth is not configured.");

      clearAuthError();

      // Retry transient network failures (auth/network-request-failed)
      const attempts = 3;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
          const token = await credential.user.getIdToken();

          const res = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Could not establish an admin session.");
          }
          setFallbackAvailable(true);
          return;
        } catch (error) {
          const parsed = explainAuthError(error);
          if (parsed.isNetwork && attempt < attempts) {
            await sleep(700 * attempt);
            continue;
          }
          fail(error);
        }
      }
    },
    [clearAuthError, fail]
  );

  const signInGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase Auth is not configured.");

    clearAuthError();
    const provider = new GoogleAuthProvider();

    try {
      const credential = await signInWithPopup(auth, provider);
      const token = await credential.user.getIdToken();
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setFallbackAvailable(true);
    } catch (error) {
      const parsed = explainAuthError(error);
      // Popup blocked → fall back to full-page redirect
      if (parsed.code === "popup-blocked" || parsed.code === "operation-not-supported-in-this-environment") {
        await signInWithRedirect(auth, provider);
        return;
      }
      fail(error);
    }
  }, [clearAuthError, fail]);

  const signInWithAccessCode = useCallback(
    async (code: string) => {
      clearAuthError();
      const res = await fetch("/api/auth/fallback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setAuthCode("backup-failed");
        setAuthMessage(data.error || "Backup unlock failed.");
        throw new Error(data.error || "Backup unlock failed.");
      }

      setFallbackSession(true);
      setFallbackAvailable(true);
    },
    [clearAuthError]
  );

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch {
        /* network may be down — still clear local state */
      }
    }
    await Promise.all([
      fetch("/api/auth/session", { method: "DELETE" }).catch(() => {}),
      fetch("/api/auth/fallback", { method: "DELETE" }).catch(() => {}),
    ]);
    setFallbackSession(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        authCode,
        authMessage,
        authIsNetwork,
        firebaseEnabled,
        fallbackSession,
        fallbackAvailable,
        signInEmail,
        signInGoogle,
        signInWithAccessCode,
        signOut,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ─────────────── Admin guard (login UI + access control) ─────────────── */

export function AdminGuard({ children }: { children: ReactNode }) {
  const {
    user,
    loading,
    isAdmin,
    signInEmail,
    signInGoogle,
    signInWithAccessCode,
    authMessage,
    authIsNetwork,
    firebaseEnabled,
    fallbackSession,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [showBackup, setShowBackup] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);

  // No Firebase configured → admin stays open (backward compatible)
  if (!firebaseEnabled) return <>{children}</>;

  // Signed in through the emergency access-code session
  if (fallbackSession) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#A85C43] animate-spin" />
      </div>
    );
  }

  // Signed in with Firebase but not on the admin whitelist
  if (user && !isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 mx-auto text-[#A85C43]" />
        <h2 className="font-serif text-2xl text-[#161616]">Access Denied</h2>
        <p className="text-xs text-[#B7AEA2]">
          {user.email} is not an authorised administrator. Contact {BRAND.email}.
        </p>
      </div>
    );
  }

  // Not signed in → login screen
  if (!user) {
    const handleEmail = async (event: React.FormEvent) => {
      event.preventDefault();
      setError("");
      setSubmitting(true);
      try {
        await signInEmail(email, password);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign-in failed.");
      } finally {
        setSubmitting(false);
      }
    };

    const handleGoogle = async () => {
      setError("");
      try {
        await signInGoogle();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google sign-in failed.");
      }
    };

    const handleBackup = async (event: React.FormEvent) => {
      event.preventDefault();
      setError("");
      setChecking(true);
      try {
        await signInWithAccessCode(accessCode);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Backup unlock failed.");
      } finally {
        setChecking(false);
      }
    };

    const probeNetwork = async () => {
      setChecking(true);
      setError("");
      try {
        // Reachability probe (opaque request — success just means DNS/TLS works)
        await fetch("https://artevo-1188a.firebaseapp.com/", { mode: "no-cors", cache: "no-store" });
        setError("Network looks reachable now. Please try signing in again.");
      } catch {
        setError("Still cannot reach Firebase. Check your internet connection or disable VPN/ad-blockers.");
      } finally {
        setChecking(false);
      }
    };

    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm bg-[#FAF7F2] border border-[#161616]/15 rounded-lg shadow-2xl p-8 space-y-5">
          <div className="text-center space-y-2">
            <Logo variant="full" className="justify-center" />
            <h2 className="font-serif text-xl text-[#161616]">Admin Studio</h2>
            <p className="text-xs text-[#B7AEA2]">Sign in to access the business dashboard.</p>
          </div>

          {/* Network failure guidance */}
          {authIsNetwork && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-2">
              <div className="flex items-start gap-2 text-[11px] text-amber-900">
                <WifiOff className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block">Firebase is unreachable (auth/network-request-failed)</strong>
                  <span className="text-amber-800">
                    Add this domain in Firebase Console → Authentication → Settings → Authorized domains:
                  </span>
                  <code className="mt-1 block bg-amber-100 rounded px-2 py-1 font-mono text-[10px] break-all">
                    {typeof window !== "undefined" ? window.location.hostname : ""}
                  </code>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={probeNetwork}
                  disabled={checking}
                  className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-amber-900 border border-amber-300 rounded px-2.5 py-1.5 hover:bg-amber-100 disabled:opacity-50"
                >
                  {checking ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  Test connection
                </button>
                <button
                  onClick={() => setShowBackup((value) => !value)}
                  className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-amber-900 border border-amber-300 rounded px-2.5 py-1.5 hover:bg-amber-100"
                >
                  <KeyRound className="w-3 h-3" />
                  {showBackup ? "Hide backup" : "Use backup code"}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error || authMessage}</span>
            </div>
          )}

          <form onSubmit={handleEmail} className="space-y-3 text-xs">
            <div>
              <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B7AEA2]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={BRAND.email}
                  className="w-full pl-9 pr-3 py-3 border border-[#161616]/20 rounded bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B7AEA2]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-3 border border-[#161616]/20 rounded bg-white"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#A85C43] text-[#FAF7F2] rounded font-semibold text-xs uppercase tracking-widest hover:bg-[#874632] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Sign In
            </button>
          </form>

          <div className="relative text-center text-[10px] text-[#B7AEA2]">
            <span className="bg-[#FAF7F2] px-3 relative z-10">or</span>
            <div className="absolute top-1/2 left-0 right-0 border-t border-[#161616]/10" />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full py-3 border border-[#161616]/20 rounded font-semibold text-xs uppercase tracking-widest text-[#161616] hover:bg-[#161616]/5 transition-colors flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.44 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Emergency backup unlock */}
          {showBackup && (
            <form onSubmit={handleBackup} className="space-y-2 border-t border-[#161616]/10 pt-4">
              <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#161616] font-semibold">
                <KeyRound className="w-3 h-3 text-[#B5965A]" /> Backup access code
              </label>
              <input
                type="password"
                required
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                placeholder="ADMIN_ACCESS_CODE"
                className="w-full px-3 py-2.5 border border-[#161616]/20 rounded bg-white font-mono text-xs"
              />
              <button
                type="submit"
                disabled={checking}
                className="w-full py-2.5 bg-[#161616] text-[#FAF7F2] rounded text-[10px] uppercase tracking-widest font-semibold hover:bg-[#A85C43] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                Unlock without Firebase
              </button>
              <p className="text-[10px] text-[#B7AEA2]">
                Works when Firebase is unreachable. Requires <code>ADMIN_ACCESS_CODE</code> in Vercel.
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
