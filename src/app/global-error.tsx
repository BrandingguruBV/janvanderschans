"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="nl">
      <body style={{ fontFamily: "system-ui", padding: "2rem", background: "#f3efe6", color: "#141210" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Er ging iets mis</h1>
        <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", opacity: 0.85 }}>
          Vernieuw de pagina of probeer opnieuw. Open de console (F12) voor details.
        </p>
        {process.env.NODE_ENV === "development" ? (
          <pre style={{ marginTop: "1rem", fontSize: "0.75rem", overflow: "auto", maxHeight: "12rem" }}>{error.message}</pre>
        ) : null}
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1.25rem",
            borderRadius: "9999px",
            border: "none",
            background: "#141210",
            color: "#faf8f5",
            cursor: "pointer",
          }}
        >
          Opnieuw proberen
        </button>
      </body>
    </html>
  );
}
