"use client";

import { useState } from "react";

type Props = {
  initial: {
    googleTagManagerContainerId: string;
    googleAnalyticsMeasurementId: string;
    googleSearchConsoleVerification: string;
  };
};

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
    <form onSubmit={save} className="space-y-4 rounded-lg border border-[#d4c4a8] bg-[#faf7f2] p-6">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-[#3d2e24]">Google Tag Manager-container-ID</span>
        <input
          value={gtm}
          onChange={(e) => setGtm(e.target.value)}
          placeholder="GTM-XXXXXXX"
          className="w-full rounded border border-[#c9b896] bg-white px-3 py-2 font-mono text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-[#3d2e24]">GA4-meet-ID (optioneel als u GTM gebruikt)</span>
        <input
          value={ga}
          onChange={(e) => setGa(e.target.value)}
          placeholder="G-XXXXXXXXXX"
          className="w-full rounded border border-[#c9b896] bg-white px-3 py-2 font-mono text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-[#3d2e24]">Search Console-verificatieteken</span>
        <input
          value={gsc}
          onChange={(e) => setGsc(e.target.value)}
          placeholder="Inhoud uit de verificatietag van Google"
          className="w-full rounded border border-[#c9b896] bg-white px-3 py-2 font-mono text-sm"
        />
      </label>
      {err ? <p className="text-sm text-red-800">{err}</p> : null}
      {msg ? <p className="text-sm text-green-800">{msg}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-[#3d2e24] px-5 py-2 font-medium text-[#faf7f2] hover:bg-[#2c1810] disabled:opacity-50"
      >
        {loading ? "Opslaan…" : "Koppelingen opslaan"}
      </button>
    </form>
  );
}
