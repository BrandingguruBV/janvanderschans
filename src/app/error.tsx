"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--fg)]">Er ging iets mis</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--fg-muted)]">
        De pagina kon niet worden geladen. Vernieuw of probeer opnieuw. Details staan in de browserconsole (F12).
      </p>
      {process.env.NODE_ENV === "development" ? (
        <pre className="mt-4 max-h-48 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3 text-left text-xs text-red-900">
          {error.message}
        </pre>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-full bg-[var(--fg)] px-6 py-2.5 text-sm font-medium text-[#faf8f5]"
      >
        Opnieuw proberen
      </button>
    </div>
  );
}
