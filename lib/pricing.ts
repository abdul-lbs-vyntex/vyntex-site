import { RESELLER_PROGRAM } from "@/lib/reseller-program";

/**
 * VYNTEX pricing — LEGACY INTERNAL PRICE BOOK.
 *
 * As of the Stripe migration, prices are NOT shown on the public website.
 * Services and their descriptions sync from Stripe (lib/stripe/*); amounts are
 * quoted after a consultation. This file remains only for the legacy partner
 * portal and order code, and must not be imported by public pages.
 *
 * Every price shown anywhere on the site (pricing cards, checkout, chatbot,
 * reseller portal, structured data, emails) must read from this file. Do not
 * hardcode prices in components.
 *
 * Figures are the official values confirmed by the business owner and match
 * the existing website HTML.
 *
 * PUBLIC MODULE. This file is imported by Client Components (Pricing, Partners,
 * CheckoutForm), so everything in it ships to the browser.
 *
 * CONFIDENTIAL wholesale pricing therefore lives in lib/pricing-reseller.ts,
 * which is marked `server-only`. That is not stylistic: a client component that
 * imports it fails the BUILD. Keeping RESELLER_PRICING here and merely "not
 * using it" on public pages is not sufficient — the bundler does not reliably
 * tree-shake an unused named export out of a module that is imported for its
 * other exports, so the entire wholesale price book would ship inside the
 * public homepage chunk and be readable with a single curl.
 */

export type Money = string; // pre-formatted display string, e.g. "$1,100"

export type ServiceCategory =
  | "websites"
  | "ai"
  | "crm"
  | "branding"
  | "social";

export interface DirectTier {
  id: string;
  category: ServiceCategory;
  /** i18n key suffix; resolves to translations.pricing.items[nameKey]. */
  nameKey: string;
  price: Money;
  /** Unit i18n key: "oneTime" | "setup" | "perMonth" | "custom". */
  unitKey: "oneTime" | "setup" | "perMonth" | "custom";
  /** Optional recurring add-on, e.g. CRM monthly. */
  recurring?: Money;
  /** Maintenance display i18n key suffix, resolved in translations. */
  maintenanceKey?: string;
  featured?: boolean;
}

export const DIRECT_PRICING: DirectTier[] = [
  // Websites
  { id: "web-basic", category: "websites", nameKey: "webBasic", price: "$500", unitKey: "oneTime", maintenanceKey: "from149" },
  { id: "web-standard", category: "websites", nameKey: "webStandard", price: "$1,100", unitKey: "oneTime", maintenanceKey: "from189", featured: true },
  { id: "web-custom", category: "websites", nameKey: "webCustom", price: "$2,000+", unitKey: "oneTime", maintenanceKey: "quoted" },

  // AI Tools
  { id: "ai-simple", category: "ai", nameKey: "aiSimple", price: "$500", unitKey: "oneTime", maintenanceKey: "from149" },
  { id: "ai-standard", category: "ai", nameKey: "aiStandard", price: "$1,200", unitKey: "oneTime", maintenanceKey: "from189", featured: true },
  { id: "ai-advanced", category: "ai", nameKey: "aiAdvanced", price: "$2,000+", unitKey: "oneTime", maintenanceKey: "quoted" },

  // CRM
  { id: "crm-basic", category: "crm", nameKey: "crmBasic", price: "$1,000", unitKey: "setup", recurring: "$149", maintenanceKey: "perMonth" },
  { id: "crm-standard", category: "crm", nameKey: "crmStandard", price: "$1,500", unitKey: "setup", recurring: "$225", maintenanceKey: "perMonth", featured: true },
  { id: "crm-custom", category: "crm", nameKey: "crmCustom", price: "$4,000+", unitKey: "setup", maintenanceKey: "buyout" },

  // Branding
  { id: "brand-logo", category: "branding", nameKey: "brandLogo", price: "$125", unitKey: "oneTime" },
  { id: "brand-bundle", category: "branding", nameKey: "brandBundle", price: "$350", unitKey: "oneTime", featured: true },
  { id: "brand-kit", category: "branding", nameKey: "brandKit", price: "$600", unitKey: "oneTime" },

  // Social
  { id: "social-setup", category: "social", nameKey: "socialSetup", price: "$250", unitKey: "oneTime" },
  { id: "social-mgmt", category: "social", nameKey: "socialMgmt", price: "$149", unitKey: "perMonth", featured: true },
];

/** Labor / support terms that apply to all direct services. */
export const LABOR_TERMS = {
  supportIncludedDays: 30,
  hourly: "$95",
  rush: "$145",
  minimumHours: 1,
  incrementMinutes: 30,
  crmBuyoutRange: "$6,000–$10,000",
} as const;

/** Reseller program terms — defined in lib/reseller-program.ts (public-safe). */
export { RESELLER_PROGRAM };

export const PRICING_CATEGORIES: ServiceCategory[] = [
  "websites",
  "ai",
  "crm",
  "branding",
  "social",
];

export function getDirectByCategory(category: ServiceCategory): DirectTier[] {
  return DIRECT_PRICING.filter((t) => t.category === category);
}

// =========================================================================
// Machine-readable amounts.
//
// Prices above are display strings so the UI never reformats them. Checkout
// needs integer cents. Rather than duplicating every figure as a number (which
// would break the single-source rule and could silently drift), we DERIVE the
// amount from the same string. A trailing "+" means the price is a starting
// point, not a fixed amount — those tiers are quote-only and must never be
// charged automatically.
// =========================================================================

export interface MoneyValue {
  /** Integer cents. */
  cents: number;
  /** True when the source string ends in "+" (a starting price, not a fixed one). */
  quoteOnly: boolean;
}

/** Parses "$1,100" -> 110000 cents; "$2,000+" -> 200000 cents, quoteOnly. */
export function parseMoney(value: Money): MoneyValue {
  const quoteOnly = value.trim().endsWith("+");
  const digits = value.replace(/[^0-9.]/g, "");
  const amount = Number.parseFloat(digits);
  if (!Number.isFinite(amount)) {
    throw new Error(`pricing: unparseable money value "${value}"`);
  }
  return { cents: Math.round(amount * 100), quoteOnly };
}

export function findDirectTier(id: string): DirectTier | undefined {
  return DIRECT_PRICING.find((t) => t.id === id);
}

/** Every valid service id (both price books share the same ids). */
export const SERVICE_KEYS: string[] = DIRECT_PRICING.map((t) => t.id);

/** The reseller activation / renewal fee, in cents. Derived, never duplicated. */
export function activationFeeCents(): number {
  return parseMoney(RESELLER_PROGRAM.activationFee).cents;
}
