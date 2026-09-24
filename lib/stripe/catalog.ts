import "server-only";
import type Stripe from "stripe";
import { unstable_cache } from "next/cache";
import { getStripe, isStripeCatalogConfigured } from "./client";
import { buildCatalog, type CatalogService } from "./parse";

export const CATALOG_TAG = "stripe-catalog";

async function fetchCatalog(): Promise<CatalogService[]> {
  const products: Stripe.Product[] = [];
  // Products only. Prices are intentionally never requested.
  for await (const product of getStripe().products.list({ active: true, limit: 100 })) {
    products.push(product);
  }

  const { services, invalid } = buildCatalog(products);
  if (invalid.length > 0) {
    console.warn(
      `[stripe-catalog] ${invalid.length} product(s) excluded. Run "npm run stripe:audit" for details.`,
    );
  }
  return services;
}

// Throws on failure, so a failed fetch is never cached as an empty catalog.
// Refreshed instantly by the Stripe webhook (revalidateTag), hourly as backup.
const cachedCatalog = unstable_cache(fetchCatalog, ["stripe-catalog-v1"], {
  tags: [CATALOG_TAG],
  revalidate: 3600,
});

export interface CatalogResult {
  services: CatalogService[];
  /** False when Stripe is unreachable or not configured. UI shows an honest fallback. */
  available: boolean;
}

export async function getServiceCatalog(): Promise<CatalogResult> {
  if (!isStripeCatalogConfigured()) {
    return { services: [], available: false };
  }
  try {
    return { services: await cachedCatalog(), available: true };
  } catch (error) {
    console.error(
      "[stripe-catalog] fetch failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return { services: [], available: false };
  }
}
