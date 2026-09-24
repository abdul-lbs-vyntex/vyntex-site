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

---

# Pass 2: website copy fields, free consultation, AI Blueprint routing

## Changed
- lib/stripe/parse.ts: `vx_desc_en` / `vx_features_en` website copy (billing text in
  Stripe keeps its prices); billing line items (service fee, deposit, balance,
  domain) are never published, even if tagged
- components/services/ServiceCatalog.tsx: "Free 30-minute consultation" panel,
  "Need something custom? AI Blueprint" link, Blueprint card CTA "Request an
  AI Blueprint", centered 1/2/4-card layouts, Spanish in tú
- lib/translations.ts: CTAs "Book a Free Consultation" / "Agenda tu Consulta
  Gratis"; consultation modal "Free 30-minute consultation"; pricing FAQ (EN/ES)
- components/Chatbot.tsx: pricing answer points to the free 30-minute
  consultation and the AI Blueprint for custom work
- components/home/ConnectedHero.tsx, components/marketing/AboutPage.tsx,
  components/marketing/ServicesHub.tsx, components/marketing/ServiceDetail.tsx,
  lib/marketing-content.ts, app/services/page.tsx: consultation wording
- app/globals.css: centered catalog grids
- tests: stripe-catalog (billing-item + website-copy cases), e2e expectations,
  wholesale-isolation Windows path fix
- docs/STRIPE-CATALOG.md

## Verified
- tsc clean, eslint clean, vitest 105/105, next build success
- Rendered with the real Stripe export + tags: 17 cards, 3 hidden, 0 errors;
  Service fee blocked even when deliberately tagged; no "$" on /services;
  EN + ES, desktop + mobile checked

---

# Pass 3: Command Center catalog on the website (Stripe sync removed)

## Added
- lib/services-catalog.ts: all 17 services and 5 groups from the VYNTEX Command
  Center, EN + ES, with every price, fee, deposit, installment, term, carrier cost
  and custom quote removed. Custom Website / Advanced AI are planned through the
  AI Blueprint. Social Media Management no longer states its month-to-month term.
- tests/unit/services-catalog.test.ts: no prices/terms/quotes, EN/ES parity,
  no billing items listed as services, unique ids, 17 services.

## Changed
- components/services/ServiceCatalog.tsx: Command Center card design (name, line,
  Ready in, What you get, What is not included, Best for, Most popular), group
  tabs and notes, free 30-minute consultation panel, AI Blueprint panel. Every
  card opens the consultation form pre-filled; custom items request a Blueprint.
- ServicesHub, ServiceDetail, app/services pages: static catalog (no server fetch).
- components/Chatbot.tsx: timeline answer references the ready-in times shown.
- app/globals.css: catalog detail / heading / best-for styles, two-column groups.

## Removed
- lib/stripe/*, app/api/stripe/webhook, scripts/stripe-audit.ts,
  tests/unit/stripe-catalog.test.ts, docs/STRIPE-CATALOG.md, the `stripe` and
  `tsx` packages, the `stripe:audit` script, STRIPE_* env vars, middleware entry.
