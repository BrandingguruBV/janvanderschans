import Link from "next/link";
import { CheckoutSuccessClient } from "@/app/checkout/success/success-client";

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sessionId = sp.session_id;

  return (
    <div className="mx-auto max-w-lg stagger-child-delays space-y-6 text-center">
      <h1 className="animate-reveal-up font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--fg)] md:text-4xl">
        Bedankt voor uw bestelling
      </h1>
      {sessionId ? (
        <div className="animate-reveal-up">
          <CheckoutSuccessClient sessionId={sessionId} />
        </div>
      ) : (
        <p className="animate-reveal-up text-[var(--fg-muted)]">
          Uw betaling is ontvangen. Heeft u een account? Facturen vindt u onder Account.
        </p>
      )}
      <Link
        href="/"
        className="animate-reveal-up inline-block font-semibold text-[var(--accent)] underline decoration-[var(--accent-dim)] underline-offset-4 transition-colors hover:text-[var(--fg)]"
      >
        Terug naar de winkel
      </Link>
    </div>
  );
}
