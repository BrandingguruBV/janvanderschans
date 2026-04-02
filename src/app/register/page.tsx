"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">Account aanmaken</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-[#5c4a3a]">Naam (optioneel)</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border border-[#c9b896] bg-white px-3 py-2"
          />
        </label>
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
          <span className="mb-1 block text-[#5c4a3a]">Wachtwoord (minimaal 8 tekens)</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
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
          {loading ? "Bezig…" : "Registreren"}
        </button>
      </form>
      <p className="text-sm text-[#5c4a3a]">
        Heeft u al een account?{" "}
        <Link href="/login" className="font-medium text-[#3d2e24] underline">
          Inloggen
        </Link>
      </p>
    </div>
  );
}
