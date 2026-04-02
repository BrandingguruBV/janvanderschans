"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { type CSSProperties, useState } from "react";

const field =
  "w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[var(--fg)] shadow-sm backdrop-blur-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-dim)]";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Registratie mislukt");
        setLoading(false);
        return;
      }
      const sign = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      });
      if (sign?.error) {
        setErr("Account aangemaakt, maar inloggen mislukt — probeer handmatig in te loggen.");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setErr("Netwerkfout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="mx-auto w-full min-w-0 max-w-md animate-reveal-fade rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-soft)] backdrop-blur-md min-[400px]:p-7 sm:p-8 md:p-10"
      style={{ "--reveal-delay": "0.12s" } as CSSProperties}
    >
      <div className="stagger-child-delays space-y-6">
        <h1 className="animate-reveal-up text-pretty font-[family-name:var(--font-display)] text-[clamp(1.625rem,4vw+0.5rem,1.875rem)] font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
          Account aanmaken
        </h1>
        <form onSubmit={onSubmit} className="stagger-children space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fg-soft)]">Naam (optioneel)</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={field} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fg-soft)]">E-mail</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fg-soft)]">Wachtwoord (minimaal 8 tekens)</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </label>
          {err ? <p className="text-sm font-medium text-red-800">{err}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-[var(--fg)] via-[#2c2824] to-[var(--fg)] py-3 text-sm font-semibold tracking-wide text-[#faf8f5] shadow-lg transition-all duration-500 hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? "Bezig…" : "Registreren"}
          </button>
        </form>
        <p className="animate-reveal-up text-sm text-[var(--fg-muted)]">
          Heeft u al een account?{" "}
          <Link href="/login" className="font-semibold text-[var(--accent)] underline decoration-[var(--accent-dim)] underline-offset-4 transition-colors hover:text-[var(--fg)]">
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
