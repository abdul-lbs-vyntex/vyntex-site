import type Stripe from "stripe";
import { z } from "zod";

/**
 * Stripe product → public service card.
 *
 * PURE MODULE (no `server-only`): imported by lib/stripe/catalog.ts, by the
 * audit script (scripts/stripe-audit.ts, runs outside Next.js), by unit tests,
 * and — for its TYPES only — by client components.
 *
 * PRICES ARE NEVER READ. Nothing here touches Stripe Price objects or
 * `default_price`. The public site describes services; amounts are quoted after
 * a consultation. A description that sneaks a price in is rejected.
 *
 * WEBSITE COPY vs BILLING COPY. The Stripe product description also appears on
 * invoices and payment pages, and usually mentions the price. So the website
 * prefers `vx_desc_en` / `vx_features_en` from metadata when present and falls
 * back to the product description / Marketing features only when absent.
 * Billing text in Stripe never has to change to keep prices off the site.
 *
 * PUBLISHING IS OPT-IN. A product appears on the site only when its metadata has
 * `vx_show = "true"`. Deposit, balance, and service-fee products stay hidden by
 * default.
 *
 * BILINGUAL PARITY. A product missing any Spanish field — or whose EN/ES feature
 * lists differ in length — is excluded from BOTH languages rather than shown
 * half-translated. `npm run stripe:audit` reports exactly what to fix.
 */

export const SERVICE_CATEGORIES = [
  "packages",
  "websites",
  "ai-tools",
  "crm",
  "branding",
  "social",
  "consulting",
] as const;

export type CatalogCategory = (typeof SERVICE_CATEGORIES)[number];

export interface LocalizedText {
  en: string;
  es: string;
}

export interface CatalogService {
  id: string;
  slug: string;
  category: CatalogCategory;
  order: number;
  featured: boolean;
  name: LocalizedText;
  description: LocalizedText;
  features: { en: string[]; es: string[] };
}

export interface InvalidProduct {
  productId: string;
  productName: string;
  issues: string[];
}

export type ParseResult =
  | { status: "published"; service: CatalogService }
  | { status: "hidden" }
  | { status: "invalid"; product: InvalidProduct };

export interface CatalogBuild {
  services: CatalogService[];
  invalid: InvalidProduct[];
  hiddenCount: number;
}

/** The subset of a Stripe Product this module reads. Keeps tests simple. */
export type CatalogProductInput = Pick<
  Stripe.Product,
  "id" | "active" | "name" | "description" | "metadata" | "marketing_features"
>;

const metadataSchema = z.object({
  vx_category: z.enum(SERVICE_CATEGORIES),
  vx_slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be lowercase-with-hyphens"),
  vx_order: z.coerce.number().int().min(0).max(9999).optional(),
  vx_desc_en: z.string().trim().min(1).max(500).optional(),
  vx_features_en: z.string().optional(),
  vx_name_es: z.string().trim().min(1).max(120),
  vx_desc_es: z.string().trim().min(1).max(500),
  vx_features_es: z.string().optional(),
  vx_featured: z.enum(["true", "false"]).optional(),
});

/**
 * Billing line items (service fee, deposits, balances, domain pass-throughs)
 * are NEVER services, so they are never published — even if tagged by mistake.
 */
export const BILLING_ONLY_PATTERN =
  /\b(service fee|processing fee|convenience fee|deposit|balance|domain)\b/i;

/** Anything that reads like an amount. Prices are not published on the site. */
export const PRICE_PATTERN = /\$\s?\d|\bUSD\b|\/\s?(mo|mes|month|mensual)\b/i;

export function splitList(value: string | undefined): string[] {
  return (value ?? "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseStripeProduct(product: CatalogProductInput): ParseResult {
  if (!product.active || product.metadata.vx_show?.trim() !== "true") {
    return { status: "hidden" };
  }

  if (BILLING_ONLY_PATTERN.test(product.name)) {
    return {
      status: "invalid",
      product: {
        productId: product.id,
        productName: product.name.trim(),
        issues: ["billing line item (fee / deposit / balance / domain) — never published; remove vx_show"],
      },
    };
  }

  const issues: string[] = [];
  const meta = metadataSchema.safeParse(product.metadata);

  if (!meta.success) {
    for (const issue of meta.error.issues) {
      issues.push(`${issue.path.join(".") || "metadata"}: ${issue.message}`);
    }
  }

  const nameEn = product.name.trim();
  // Website copy (metadata) wins over billing copy (product fields).
  const descEn = (
    (meta.success ? meta.data.vx_desc_en : undefined) ??
    product.description ??
    ""
  ).trim();
  const featuresEn =
    meta.success && meta.data.vx_features_en !== undefined
      ? splitList(meta.data.vx_features_en)
      : (product.marketing_features ?? [])
          .map((feature) => feature.name?.trim() ?? "")
          .filter(Boolean);
  const featuresEs = meta.success ? splitList(meta.data.vx_features_es) : [];

  if (!descEn) issues.push("description (EN): empty");
  if (meta.success && featuresEn.length !== featuresEs.length) {
    issues.push(
      `features: ${featuresEn.length} EN vs ${featuresEs.length} ES (vx_features_es)`,
    );
  }

  const allText = [
    nameEn,
    descEn,
    ...featuresEn,
    ...(meta.success ? [meta.data.vx_name_es, meta.data.vx_desc_es, ...featuresEs] : []),
  ];
  if (allText.some((text) => PRICE_PATTERN.test(text))) {
    issues.push("price text found — prices are not published on the website");
  }

  if (!meta.success || issues.length > 0) {
    return {
      status: "invalid",
      product: { productId: product.id, productName: nameEn, issues },
    };
  }

  return {
    status: "published",
    service: {
      id: product.id,
      slug: meta.data.vx_slug,
      category: meta.data.vx_category,
      order: meta.data.vx_order ?? 9999,
      featured: meta.data.vx_featured === "true",
      name: { en: nameEn, es: meta.data.vx_name_es },
      description: { en: descEn, es: meta.data.vx_desc_es },
      features: { en: featuresEn, es: featuresEs },
    },
  };
}

const CATEGORY_RANK = new Map<CatalogCategory, number>(
  SERVICE_CATEGORIES.map((category, index) => [category, index]),
);

export function buildCatalog(products: CatalogProductInput[]): CatalogBuild {
  const services: CatalogService[] = [];
  const invalid: InvalidProduct[] = [];
  const slugOwners = new Map<string, string>();
  let hiddenCount = 0;

  for (const product of products) {
    const result = parseStripeProduct(product);

    if (result.status === "hidden") {
      hiddenCount += 1;
      continue;
    }
    if (result.status === "invalid") {
      invalid.push(result.product);
      continue;
    }

    const owner = slugOwners.get(result.service.slug);
    if (owner) {
      invalid.push({
        productId: product.id,
        productName: product.name,
        issues: [`vx_slug "${result.service.slug}" already used by ${owner}`],
      });
      continue;
    }

    slugOwners.set(result.service.slug, product.id);
    services.push(result.service);
  }

  services.sort(
    (a, b) =>
      (CATEGORY_RANK.get(a.category) ?? 0) - (CATEGORY_RANK.get(b.category) ?? 0) ||
      a.order - b.order ||
      a.name.en.localeCompare(b.name.en),
  );

  return { services, invalid, hiddenCount };
}
