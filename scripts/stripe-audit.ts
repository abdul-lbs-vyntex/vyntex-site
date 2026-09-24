/**
 * npm run stripe:audit
 *
 * Reads your Stripe products (never prices) and reports which ones will appear
 * on vyntexusa.com, which are hidden, and exactly what to fix on the rest.
 * Exits with code 1 when any published product has errors (CI-friendly).
 */
import Stripe from "stripe";
import { buildCatalog } from "../lib/stripe/parse";

async function main(): Promise<void> {
  const key = process.env.STRIPE_CATALOG_KEY;
  if (!key) {
    console.error("STRIPE_CATALOG_KEY is not set. Add it to .env.local.");
    process.exit(1);
  }

  const stripe = new Stripe(key);
  const products: Stripe.Product[] = [];
  for await (const product of stripe.products.list({ active: true, limit: 100 })) {
    products.push(product);
  }

  const { services, invalid, hiddenCount } = buildCatalog(products);

  console.log(`\nActive products in Stripe:  ${products.length}`);
  console.log(`Published on website:       ${services.length}`);
  console.log(`Hidden (vx_show not true):  ${hiddenCount}`);
  console.log(`Excluded with errors:       ${invalid.length}\n`);

  for (const service of services) {
    console.log(
      `  OK  [${service.category}] ${service.name.en} / ${service.name.es}  (${service.slug})`,
    );
  }

  if (invalid.length > 0) {
    console.log("\nFix these in the Stripe Dashboard:\n");
    for (const product of invalid) {
      console.log(`  X   ${product.productName} (${product.productId})`);
      for (const issue of product.issues) console.log(`        - ${issue}`);
    }
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
