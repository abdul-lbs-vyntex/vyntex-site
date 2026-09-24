/**
 * Centralized, VERIFIED business information for VYNTEX.
 * Only facts confirmed by the business owner live here. Do not add founding
 * year, project counts, awards, certifications, guarantees, team size, or
 * partnerships unless they have been explicitly verified.
 */

export const SITE = {
  name: "VYNTEX",
  legalName: "VYNTEX",
  tagline: "Connected business systems, CRM implementation, automation, websites, and digital solutions.",

  url: "https://vyntexusa.com",
  domain: "vyntexusa.com",

  email: "info@vyntexusa.com",

  // VYNTEX has ONE official business line (calls, texts, WhatsApp).
  // 609-813-0633 belongs to Lion Business Services — never use it for VYNTEX.
  phone: "609-780-3218",

  address: {
    locality: "Northfield",
    region: "NJ",
    postalCode: "08225",
    country: "US",
  },

  serviceArea: "United States",
  languages: ["en", "es"] as const,

  ogImage: "/og-image.png",
} as const;

/** E.164-style href for tel: links. Strips non-digits and prefixes +1 (US). */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:+1${digits}`;
}

export const CONTACT_HREFS = {
  email: `mailto:${SITE.email}`,
  phone: telHref(SITE.phone),
} as const;

/** Primary multi-page navigation. */
export const SECTION_IDS = {
  home: "home",
  solutions: "solutions",
  services: "services",
  howItWorks: "how-it-works",
  aiAutomation: "ai-automation",
  pricing: "pricing",
  industries: "industries",
  caseStudies: "case-studies",
  about: "about",
  partners: "partners",
  resources: "resources",
  faq: "faq",
  contact: "contact",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export const NAV_LINKS: { key: keyof typeof SECTION_IDS; href: string }[] = [
  { key: "home", href: "/" },
  { key: "services", href: "/services" },
  { key: "industries", href: "/industries" },
  { key: "partners", href: "/partners" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
];

/** Footer legal links. Pages are scaffolded in a later phase. */
export const LEGAL_LINKS = [
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
  { key: "cookies", href: "/cookies" },
  { key: "accessibility", href: "/accessibility" },
] as const;
