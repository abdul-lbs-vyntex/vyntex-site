# Stripe catalog sync, price removal, phone update

## Added
- lib/stripe/parse.ts — Stripe product → service card (pure; no prices ever read)
- lib/stripe/client.ts — server-only Stripe client (restricted key)
- lib/stripe/catalog.ts — cached catalog, tag-revalidated
- app/api/stripe/webhook/route.ts — signature-verified refresh on product events
- components/services/ServiceCatalog.tsx — bilingual cards, tabs, consultation CTA
- lib/reseller-program.ts — public partner terms split from the price book
- scripts/stripe-audit.ts — `npm run stripe:audit`
- tests/unit/stripe-catalog.test.ts — 8 tests
- docs/STRIPE-CATALOG.md — setup + tagging guide

## Changed
- lib/site.ts — single official number 609-780-3218 (phonePrimary/phoneSecondary → phone)
- components/Footer.tsx, Contact.tsx, Nav.tsx, Chatbot.tsx, app/error.tsx,
  app/not-found.tsx, app/partners/apply/page.tsx, lib/schema.ts, lib/legal.ts,
  lib/agreements.ts, lib/agreement-content.ts, lib/email/templates.ts,
  lib/translations.ts — phone update
- components/Chatbot.tsx — no prices; pricing/support/included answers rewritten
- lib/translations.ts — pricing FAQs rewritten without amounts (EN + ES)
- components/BookConsultation.tsx — new openConsultationFor() pre-fill
- components/marketing/ServicesHub.tsx, ServiceDetail.tsx — Stripe catalog, no prices
- app/services/page.tsx, app/services/[slug]/page.tsx — server-fetch catalog, canonical URLs, 1h revalidate
- app/checkout/page.tsx — permanent redirect to /services
- app/api/checkout/create/route.ts — public direct orders rejected (410)
- components/checkout/CheckoutCancelled.tsx — retry → /portal
- lib/pricing.ts — marked legacy/internal; re-exports RESELLER_PROGRAM
- middleware.ts — Stripe webhook excluded from session middleware
- app/globals.css — catalog card modifiers
- .env.example — STRIPE_CATALOG_KEY, STRIPE_WEBHOOK_SECRET
- package.json — stripe, tsx, `stripe:audit`
- tests/unit/agreement.test.ts, tests/e2e/public-site.spec.ts — updated expectations

## Removed (dead or price-displaying)
- components/Pricing.tsx, components/Services.tsx, components/ui/PricingCard.tsx
- components/marketing/PricingPage.tsx, components/marketing/ServicesPricingShowcase.tsx
- components/checkout/CheckoutForm.tsx, OrderSummary.tsx, CheckoutHeading.tsx

## Verified
- tsc --noEmit: clean · eslint: clean · vitest: 102/102 · next build: success
- Public prerendered HTML (home, services, all 6 service pages, about): no prices
- Retail price strings now ship only in the legacy partner-portal chunk
- Visual check desktop + mobile with sample catalog; card CTA pre-fills the
  consultation form (service checkbox + note)

## Not yet done (next passes)
- Partner program rebuild (revenue-share model) → then remove Square entirely
- Terms of Service still reference "published prices" — needs owner approval
- Site-wide canonical bug (layout canonical "/"): fixed on services pages only
- Spanish is a client-side toggle, not indexable locale routes
