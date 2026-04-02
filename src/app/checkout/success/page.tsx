import Link from "next/link";
import { CheckoutSuccessClient } from "@/app/checkout/success/success-client";

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sessionId = sp.session_id;

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-[#2c1810]">Bedankt voor uw bestelling</h1>
      {sessionId ? (
        <CheckoutSuccessClient sessionId={sessionId} />
      ) : (
        <p className="text-[#5c4a3a]">
          Uw betaling is ontvangen. Heeft u een account? Facturen vindt u onder Account.
        </p>
      )}
      <Link href="/" className="inline-block font-medium text-[#3d2e24] underline">
        Terug naar de winkel
      </Link>
    </div>
  );
}
