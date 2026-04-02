"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

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
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Inloggen</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-[#5c4a3a]">E-mail</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-[#c9b896] bg-white px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-[#5c4a3a]">Wachtwoord</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-[#c9b896] bg-white px-3 py-2"
          />
        </label>
        {err ? <p className="text-sm text-red-800">{err}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#3d2e24] py-2.5 font-medium text-[#faf7f2] hover:bg-[#2c1810] disabled:opacity-50"
        >
          {loading ? "Bezig met inloggen…" : "Inloggen"}
        </button>
      </form>
      <p className="text-sm text-[#5c4a3a]">
        Nog geen account?{" "}
        <Link href="/register" className="font-medium text-[#3d2e24] underline">
          Registreren
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-[#5c4a3a]">Laden…</p>}>
      <LoginForm />
    </Suspense>
  );
}
