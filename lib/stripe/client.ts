import "server-only";
import Stripe from "stripe";

/**
 * Server-only Stripe client for the public service catalog.
 *
 * Use a RESTRICTED key (rk_...) with "Products: Read" and nothing else. The
 * website never needs to create charges, read customers, or see prices.
 * Created lazily so a missing key never breaks `next build`.
 */
let instance: Stripe | null = null;

export function isStripeCatalogConfigured(): boolean {
  return Boolean(process.env.STRIPE_CATALOG_KEY);
}

export function getStripe(): Stripe {
  if (instance) return instance;

  const key = process.env.STRIPE_CATALOG_KEY;
  if (!key) {
    throw new Error("STRIPE_CATALOG_KEY is not set");
  }
  if (key.startsWith("sk_")) {
    console.warn(
      "[stripe] STRIPE_CATALOG_KEY is a full secret key. Replace it with a restricted key (rk_) that has Products: Read only.",
    );
  }

  instance = new Stripe(key, {
    maxNetworkRetries: 2,
    appInfo: { name: "vyntex-website" },
  });
  return instance;
}
