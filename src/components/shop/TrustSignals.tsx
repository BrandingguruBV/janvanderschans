import type { CSSProperties } from "react";

export function TrustSignals() {
  return (
    <section
      id="waarom"
      className="scroll-mt-[max(5.5rem,calc(4.5rem+env(safe-area-inset-top)))] rounded-[var(--radius-xl)] border border-[var(--border)] bg-gradient-to-br from-[var(--bg-card)] via-white/50 to-[var(--bg-elevated)] p-5 shadow-[var(--shadow-soft)] backdrop-blur-md min-[400px]:p-7 sm:p-8 md:p-10"
      aria-labelledby="trust-heading"
    >
      <h2
        id="trust-heading"
        className="animate-reveal-up text-pretty font-[family-name:var(--font-display)] text-[clamp(1.375rem,3.5vw+0.5rem,1.875rem)] font-semibold tracking-tight text-[var(--fg)] md:text-3xl"
      >
        Gebouwd voor vertrouwen — en een vlotte aankoop
      </h2>
      <p
        className="animate-reveal-fade mt-3 max-w-2xl text-pretty text-[var(--fg-muted)]"
        style={{ "--reveal-delay": "0.1s" } as CSSProperties}
      >
        Minder twijfel, meer klik naar de juiste camera: heldere filters, echte foto&apos;s en een checkout die u kent.
      </p>
      <ul className="mt-6 grid gap-4 stagger-children min-[600px]:mt-8 min-[600px]:grid-cols-3 min-[600px]:gap-6">
        <li className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/40 p-4 min-[400px]:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">01</p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--fg)]">Wat u ziet is wat u koopt</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
            Productpagina&apos;s gebruiken dezelfde beelden als hierboven — rechtstreeks uit uw catalogusmap.
          </p>
        </li>
        <li className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/40 p-4 min-[400px]:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">02</p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--fg)]">Stripe — bekend &amp; veilig</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
            Afrekenen via Stripe met directe bevestiging. Factuur en geschiedenis vindt u in uw account.
          </p>
        </li>
        <li className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white/40 p-4 min-[400px]:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">03</p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--fg)]">Slim filteren</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
            Merk, conditie, prijs en voorraad helpen u snel bij het juiste stuk — zonder ruis.
          </p>
        </li>
      </ul>
    </section>
  );
}
