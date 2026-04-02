"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { type CSSProperties, Suspense, useState } from "react";

const field =
  "w-full rounded-lg border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-3 py-2.5 text-[var(--fg)] shadow-sm backdrop-blur-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-dim)]";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setErr("Onjuist e-mailadres of wachtwoord.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div
      className="mx-auto w-full min-w-0 max-w-md animate-reveal-fade rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-soft)] backdrop-blur-md min-[400px]:p-7 sm:p-8 md:p-10"
      style={{ "--reveal-delay": "0.12s" } as CSSProperties}
    >
      <div className="stagger-child-delays space-y-6">
        <h1 className="animate-reveal-up text-pretty font-[family-name:var(--font-display)] text-[clamp(1.625rem,4vw+0.5rem,1.875rem)] font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
          Inloggen
        </h1>
        <form onSubmit={onSubmit} className="stagger-children space-y-4">
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
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fg-soft)]">Wachtwoord</span>
            <input
              type="password"
              required
              autoComplete="current-password"
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
            {loading ? "Bezig met inloggen…" : "Inloggen"}
          </button>
        </form>
        <p className="animate-reveal-up text-sm text-[var(--fg-muted)]">
          Nog geen account?{" "}
          <Link href="/register" className="font-semibold text-[var(--accent)] underline decoration-[var(--accent-dim)] underline-offset-4 transition-colors hover:text-[var(--fg)]">
            Registreren
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="animate-reveal-fade text-[var(--fg-muted)]">Laden…</p>}>
      <LoginForm />
    </Suspense>
  );
}
