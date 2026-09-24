import type Stripe from "stripe";
import { revalidateTag } from "next/cache";
import { getStripe } from "@/lib/stripe/client";
import { CATALOG_TAG } from "@/lib/stripe/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe → website sync.
 *
 * Register in Stripe (Developers → Webhooks) with these events only:
 *   product.created · product.updated · product.deleted
 *
 * Every verified event refreshes the cached service catalog, so an edit in the
 * Stripe Dashboard is live on the site within seconds. Unsigned or mis-signed
 * requests are rejected. No data from the event is trusted or stored — the
 * catalog is re-read from the Stripe API.
 */
const CATALOG_EVENTS = new Set<string>([
  "product.created",
  "product.updated",
  "product.deleted",
]);

export async function POST(request: Request): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set.");
    return Response.json({ error: "Not configured" }, { status: 503 });
  }
  if (!signature) {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (CATALOG_EVENTS.has(event.type)) {
    revalidateTag(CATALOG_TAG);
  }

  return Response.json({ received: true });
}
