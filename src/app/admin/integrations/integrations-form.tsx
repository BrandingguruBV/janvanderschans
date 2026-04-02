"use client";

import { useState } from "react";

type Props = {
  initial: {
    googleTagManagerContainerId: string;
    googleAnalyticsMeasurementId: string;
    googleSearchConsoleVerification: string;
  };
};

const field =
  "w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-2.5 font-mono text-sm text-[var(--fg)] shadow-sm backdrop-blur-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-dim)]";

export function IntegrationsForm({ initial }: Props) {
  const [gtm, setGtm] = useState(initial.googleTagManagerContainerId);
  const [ga, setGa] = useState(initial.googleAnalyticsMeasurementId);
  const [gsc, setGsc] = useState(initial.googleSearchConsoleVerification);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleTagManagerContainerId: gtm.trim() || null,
          googleAnalyticsMeasurementId: ga.trim() || null,
          googleSearchConsoleVerification: gsc.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErr(data.error ?? "Opslaan mislukt");
        return;
      }
      setMsg("Opgeslagen. Vernieuw de winkelpagina om nieuwe tags te laden.");
    } catch {
      setErr("Netwerkfout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={save} className="stagger-children space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm md:p-8">
      <label className="block text-sm">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-soft)]">Google Tag Manager-container-ID</span>
        <input value={gtm} onChange={(e) => setGtm(e.target.value)} placeholder="GTM-XXXXXXX" className={field} />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-soft)]">GA4-meet-ID (optioneel als u GTM gebruikt)</span>
        <input value={ga} onChange={(e) => setGa(e.target.value)} placeholder="G-XXXXXXXXXX" className={field} />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-soft)]">Search Console-verificatieteken</span>
        <input value={gsc} onChange={(e) => setGsc(e.target.value)} placeholder="Inhoud uit de verificatietag van Google" className={field} />
      </label>
      {err ? <p className="text-sm font-medium text-red-800">{err}</p> : null}
      {msg ? <p className="text-sm font-medium text-emerald-800">{msg}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-gradient-to-r from-[var(--fg)] via-[#2c2824] to-[var(--fg)] px-6 py-2.5 text-sm font-semibold tracking-wide text-[#faf8f5] shadow-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? "Opslaan…" : "Koppelingen opslaan"}
      </button>
    </form>
  );
}
