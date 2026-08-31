"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Database,
  ExternalLink,
  Loader2,
  RefreshCw,
  Server,
  XCircle,
} from "lucide-react";

interface Diagnostics {
  environment: "vercel" | "local";
  databaseConfigured: boolean;
  databaseConnection: "ok" | "failed" | "not-configured";
  databaseLatencyMs: number | null;
  databaseProvider: string;
  databaseHost: string;
  databaseError: string | null;
  tables: string[];
  expectedTables: string[];
  nodeVersion: string;
  checkedAt: string;
}

const STEPS = [
  {
    title: "Create a hosted PostgreSQL",
    body: "Pick any managed Postgres provider — Vercel Postgres, Neon, or Supabase all take under two minutes and have a free tier.",
    action: {
      label: "Open Vercel Storage",
      href: "https://vercel.com/dashboard/stores",
    },
    detail:
      "In Vercel: Storage → Create Database → Postgres → link it to this project. Vercel will auto-populate DATABASE_URL for you.",
  },
  {
    title: "Copy the connection string",
    body: "Your provider gives you a URL that starts with postgresql://…  Copy it (already done if you used Vercel Postgres).",
    detail:
      "Neon: click the project → Connection Details → copy the pooled connection. Supabase: Settings → Database → Connection string → URI.",
  },
  {
    title: "Add DATABASE_URL in Vercel",
    body: "Open your ARTÉVO project in Vercel → Settings → Environment Variables → Add.",
    action: {
      label: "Open Environment Variables",
      href: "https://vercel.com/dashboard",
    },
    detail:
      "Name: DATABASE_URL   Value: paste the connection string   Environments: Production, Preview, Development (all three).",
  },
  {
    title: "Redeploy the project",
    body: "Deployments → the latest one → ⋯ menu → Redeploy. Uncheck 'Use existing Build Cache' so the new variable is picked up.",
  },
  {
    title: "Refresh this page",
    body: "Come back here and click Re-check status. Tables will auto-create on first request; sample content seeds if the catalog is empty.",
  },
];

export default function DatabaseSetupGuide() {
  const [diag, setDiag] = useState<Diagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync/diagnostics", { cache: "no-store" });
      const data = (await res.json()) as Diagnostics;
      setDiag(data);
    } catch {
      /* silent — the panel below reflects the state */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const copyValue = (label: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    });
  };

  // If everything is green we render a slim confirmation stripe instead of the setup guide.
  if (diag && diag.databaseConfigured && diag.databaseConnection === "ok") {
    return (
      <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg p-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
        <span>
          <strong>Database connected.</strong> {diag.databaseProvider}
          {diag.databaseLatencyMs !== null ? ` · ${diag.databaseLatencyMs} ms` : ""} · {diag.tables.length}/
          {diag.expectedTables.length} tables ready.
        </span>
        <button
          onClick={load}
          className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-emerald-800 hover:text-emerald-950"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> Re-check
        </button>
      </div>
    );
  }

  const missingTables = diag?.databaseConnection === "ok"
    ? diag.expectedTables.filter((table) => !diag.tables.includes(table))
    : [];

  return (
    <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start gap-3 border-b border-amber-200">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
        <div className="flex-1">
          <strong className="block text-sm">Database is not connected yet</strong>
          <p className="text-xs text-amber-800 mt-0.5">
            The public catalog is running on built-in preview content. Once you add
            <code className="mx-1 bg-amber-100 px-1 rounded font-mono">DATABASE_URL</code>
            to Vercel, orders, bids, admin saves, and cross-browser live sync will start working immediately.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-amber-800 hover:text-amber-950 border border-amber-300 rounded px-2.5 py-1.5"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Re-check status
        </button>
      </div>

      {/* Live diagnostics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white/60 border-b border-amber-200 text-[11px]">
        <DiagCell
          icon={Server}
          label="Environment"
          value={diag ? (diag.environment === "vercel" ? "Vercel" : "Local dev") : "…"}
        />
        <DiagCell
          icon={Database}
          label="DATABASE_URL"
          value={diag ? (diag.databaseConfigured ? "Set" : "Missing") : "…"}
          state={diag?.databaseConfigured ? "ok" : "bad"}
        />
        <DiagCell
          icon={Database}
          label="Connection"
          value={
            diag
              ? diag.databaseConnection === "ok"
                ? `OK · ${diag.databaseLatencyMs ?? 0} ms`
                : diag.databaseConnection === "failed"
                ? "Failed"
                : "Not attempted"
              : "…"
          }
          state={
            diag?.databaseConnection === "ok" ? "ok" : diag?.databaseConnection === "failed" ? "bad" : "neutral"
          }
        />
        <DiagCell
          icon={Database}
          label="Tables"
          value={diag ? `${diag.tables.length}/${diag.expectedTables.length}` : "…"}
          state={diag && diag.tables.length >= diag.expectedTables.length ? "ok" : "neutral"}
        />
      </div>

      {/* Error surface */}
      {diag?.databaseError && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-[11px] text-red-800 flex items-start gap-2">
          <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <div>
            <strong>Postgres connection error:</strong> {diag.databaseError}
            <p className="mt-1 text-red-700">
              Check that the connection string is correct, the database is not paused, and SSL is not being blocked.
            </p>
          </div>
        </div>
      )}

      {missingTables.length > 0 && (
        <div className="p-3 bg-white/60 border-b border-amber-200 text-[11px]">
          <strong>Tables to create:</strong>{" "}
          <span className="font-mono">{missingTables.join(", ")}</span>
          <p className="mt-1 text-amber-800">
            They will auto-create on the next request; no manual migration needed.
          </p>
        </div>
      )}

      {/* Step-by-step guide */}
      <ol className="p-4 space-y-3 text-xs">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 text-amber-900 font-bold text-[11px] flex items-center justify-center">
              {index + 1}
            </span>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-amber-950">{step.title}</strong>
                {step.action && (
                  <a
                    href={step.action.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-amber-800 hover:text-amber-950 border border-amber-300 rounded px-2 py-0.5"
                  >
                    {step.action.label} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="mt-1 text-amber-800">{step.body}</p>
              {step.detail && <p className="mt-1 text-amber-700/80 leading-relaxed">{step.detail}</p>}
            </div>
          </li>
        ))}
      </ol>

      {/* Copy helpers */}
      <div className="p-4 border-t border-amber-200 bg-white/60 space-y-2 text-[11px] text-amber-900">
        <p className="font-semibold uppercase tracking-widest text-amber-800">Quick copy — Vercel variable</p>
        <CopyRow label="Name" value="DATABASE_URL" copied={copied === "name"} onCopy={() => copyValue("name", "DATABASE_URL")} />
        <CopyRow
          label="Example value"
          value="postgresql://user:password@host.neon.tech:5432/artevo?sslmode=require"
          copied={copied === "value"}
          onCopy={() =>
            copyValue("value", "postgresql://user:password@host.neon.tech:5432/artevo?sslmode=require")
          }
        />
        <p className="text-amber-700/90 pt-1">
          Do not paste the localhost URL from local development into Vercel — the Vercel runtime cannot reach it.
        </p>
      </div>
    </div>
  );
}

function DiagCell({
  icon: Icon,
  label,
  value,
  state = "neutral",
}: {
  icon: typeof Server;
  label: string;
  value: string;
  state?: "ok" | "bad" | "neutral";
}) {
  const stateColor =
    state === "ok" ? "text-emerald-700" : state === "bad" ? "text-red-700" : "text-amber-900";
  return (
    <div className="rounded border border-amber-200 bg-white px-2.5 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-amber-800">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className={`text-sm font-semibold mt-0.5 ${stateColor}`}>{value}</div>
    </div>
  );
}

function CopyRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-white border border-amber-200 rounded px-2.5 py-2 font-mono">
      <span className="text-amber-800 text-[10px] uppercase tracking-widest w-24">{label}</span>
      <span className="flex-1 truncate text-amber-950">{value}</span>
      <button
        onClick={onCopy}
        className="text-amber-800 hover:text-amber-950"
        title={`Copy ${label}`}
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
