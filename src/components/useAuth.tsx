"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAdminPresence, type SessionInfo } from "./useAdminPresence";
import { isFirebaseConfigured, getFirebaseAuth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { ShieldCheck, LogIn, Mail, Lock, Loader2 } from "lucide-react";
import Logo from "./Logo";
import { BRAND } from "@/lib/brand";

/* ─────────────── Auth context ─────────────── */

interface AuthCtx {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  firebaseEnabled: boolean;
  /** Realtime live sessions (other admin devices/browsers) */
  liveSessions: SessionInfo[];
  /** Connection state of the current admin session */
  presenceState: "idle" | "connecting" | "online" | "offline";
  /** Idle auto lock-out after inactivity (seconds) */
  sessionMinutes: number;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  isAdmin: false,
  signInEmail: async () => {},
  signInGoogle: async () => {},
  signOut: async () => {},
  firebaseEnabled: false,
  liveSessions: [],
  presenceState: "idle",
  sessionMinutes: 30,
});

export const useAuth = () => useContext(AuthContext);

/**
 * The ADMIN_EMAILS list controls who can access /admin.
 * Add emails via Vercel env or edit this array directly.
 * When Firebase Auth is not configured the admin is open (backward compat).
 */
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || BRAND.email)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/* ─────────────── Provider ─────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const firebaseEnabled = isFirebaseConfigured();

  useEffect(() => {
    if (!firebaseEnabled) {
      setLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, [firebaseEnabled]);

  const isAdmin = !firebaseEnabled || (!!user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || ""));

  const signInEmail = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase Auth not configured.");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInGoogle = async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase Auth not configured.");
    await signInWithPopup(auth, new GoogleAuthProvider());
  };

  const signOut = async () => {
    const auth = getFirebaseAuth();
    if (auth) await fbSignOut(auth);
  };

  // Realtime session presence (live connected devices)
  const { sessions: liveSessions, connectionState: presenceState } = useAdminPresence(user);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInEmail, signInGoogle, signOut, firebaseEnabled, liveSessions, presenceState, sessionMinutes: 30 }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ─────────────── Admin guard (wraps admin pages) ─────────────── */

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin, signInEmail, signInGoogle, firebaseEnabled } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // No Firebase configured → admin is open (backward compatible)
  if (!firebaseEnabled) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#A85C43] animate-spin" />
      </div>
    );
  }

  // Signed in but not in the admin list
  if (user && !isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 mx-auto text-[#A85C43]" />
        <h2 className="font-serif text-2xl text-[#161616]">Access Denied</h2>
        <p className="text-xs text-[#B7AEA2]">
          {user.email} is not an authorised administrator. Contact the business owner at {BRAND.email}.
        </p>
      </div>
    );
  }

  // Not signed in → show login form
  if (!user) {
    const handleEmail = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSubmitting(true);
      try {
        await signInEmail(email, password);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message.replace("Firebase: ", "") : "Sign-in failed.");
      } finally {
        setSubmitting(false);
      }
    };

    const handleGoogle = async () => {
      setError("");
      try {
        await signInGoogle();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message.replace("Firebase: ", "") : "Google sign-in failed.");
      }
    };

    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-[#FAF7F2] border border-[#161616]/15 rounded-lg shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <Logo variant="full" className="justify-center" />
            <h2 className="font-serif text-xl text-[#161616]">Admin Studio</h2>
            <p className="text-xs text-[#B7AEA2]">Sign in to access the business dashboard.</p>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded">
              {error}
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
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-3 border border-[#161616]/20 rounded bg-white"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#A85C43] text-[#FAF7F2] rounded font-semibold text-xs uppercase tracking-widest hover:bg-[#874632] transition-colors flex items-center justify-center gap-2"
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

          <p className="text-center text-[10px] text-[#B7AEA2]">
            Only email addresses listed in the admin whitelist ({ADMIN_EMAILS.join(", ")}) can access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
