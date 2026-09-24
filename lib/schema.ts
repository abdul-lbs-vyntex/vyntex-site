/**
 * JSON-LD structured data — VERIFIED facts only.
 * No aggregateRating, no reviews, no fake counts, no unverified attributes.
 * These builders are consumed by app/layout.tsx.
 */
import { SITE } from "@/lib/site";

const postalAddress = {
  "@type": "PostalAddress",
  addressLocality: SITE.address.locality,
  addressRegion: SITE.address.region,
  postalCode: SITE.address.postalCode,
  addressCountry: SITE.address.country,
};

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    description:
      "VYNTEX builds AI automation, websites, CRM systems, branding, and digital marketing for businesses across the United States. Bilingual English and Spanish service.",
    address: postalAddress,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: `+1-${SITE.phone}`,
        contactType: "customer service",
        email: SITE.email,
        areaServed: "US",
        availableLanguage: ["English", "Spanish"],
      },
    ],
  };
}

export function professionalServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    telephone: `+1-${SITE.phone}`,
    address: postalAddress,
    areaServed: { "@type": "Country", name: SITE.serviceArea },
    availableLanguage: ["English", "Spanish"],
    slogan: SITE.tagline,
    priceRange: "$$",
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    inLanguage: ["en-US", "es-US"],
  };
}

/**
 * FAQPage schema. Only call this with questions/answers that are ALSO rendered
 * visibly on the page (required for valid FAQ structured data).
 */
export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** Combined graph injected once in the document head. */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      professionalServiceSchema(),
      websiteSchema(),
    ],
  };
}
