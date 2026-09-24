"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, CalendarClock, Sparkles } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { openConsultation, openConsultationFor } from "@/components/BookConsultation";
import type { CONSULT_SERVICES } from "@/lib/validation/consultation";
import {
  SERVICE_CATEGORIES,
  type CatalogCategory,
  type CatalogService,
} from "@/lib/stripe/parse";

/**
 * Service catalog synced from Stripe (see lib/stripe/catalog.ts).
 *
 * NO PRICES. The data passed in never contains an amount. Every card leads to a
 * consultation, pre-filled with the service the visitor picked.
 *
 * Receives plain serializable data from a Server Component, so the Stripe key
 * and the Stripe SDK never reach the browser.
 */

type ConsultService = (typeof CONSULT_SERVICES)[number];
type Lang = "en" | "es";

/** Stripe category → consultation form checkbox. Empty = visitor chooses. */
const CONSULT_TOKEN: Record<CatalogCategory, ConsultService[]> = {
  packages: [],
  websites: ["website"],
  "ai-tools": ["ai_automation"],
  crm: ["crm"],
  branding: ["branding"],
  social: ["social_media"],
  consulting: [],
};

const en = {
  eyebrow: "SERVICES",
  title: "Choose the Right Starting Point",
  intro:
    "Start with one focused service, then connect more systems as your business grows.",
  tablistLabel: "Service categories",
  categories: {
    packages: "Packages",
    websites: "Websites",
    "ai-tools": "AI Tools",
    crm: "CRM",
    branding: "Branding",
    social: "Social Media",
    consulting: "Consulting",
  } as Record<CatalogCategory, string>,
  recommended: "Recommended",
  cta: "Book a Consultation",
  ctaAria: (name: string) => `Book a consultation about ${name}`,
  prefill: (name: string) => `I'd like to learn more about: ${name}.`,
  pricingNote:
    "Every project is quoted after a free consultation, with a written proposal before any work begins. Third-party platform fees are billed separately.",
  emptyTitle: "Our service catalog is being updated",
  emptyBody:
    "Book a free consultation and we will walk you through every option for your business.",
};

type Dict = typeof en;

const es: Dict = {
  eyebrow: "SERVICIOS",
  title: "Elija el Punto de Partida Correcto",
  intro:
    "Comience con un servicio específico y conecte más sistemas a medida que su negocio crece.",
  tablistLabel: "Categorías de servicios",
  categories: {
    packages: "Paquetes",
    websites: "Sitios Web",
    "ai-tools": "Herramientas de IA",
    crm: "CRM",
    branding: "Marca",
    social: "Redes Sociales",
    consulting: "Consultoría",
  },
  recommended: "Recomendado",
  cta: "Reservar una Consulta",
  ctaAria: (name: string) => `Reservar una consulta sobre ${name}`,
  prefill: (name: string) => `Me gustaría saber más sobre: ${name}.`,
  pricingNote:
    "Cada proyecto se cotiza después de una consulta gratuita, con una propuesta por escrito antes de comenzar cualquier trabajo. Las tarifas de plataformas de terceros se facturan por separado.",
  emptyTitle: "Estamos actualizando nuestro catálogo de servicios",
  emptyBody:
    "Reserve una consulta gratuita y le explicaremos todas las opciones para su negocio.",
};

const DICTS: Record<Lang, Dict> = { en, es };

interface ServiceCatalogProps {
  services: CatalogService[];
  available: boolean;
  /** Limit to these categories (e.g. on a service detail page). Default: all. */
  categories?: CatalogCategory[];
  /** Section heading override. When omitted, the default heading is shown. */
  heading?: { eyebrow?: string; title: string; intro?: string };
  /** Render nothing (instead of the fallback card) when there is nothing to show. */
  hideWhenEmpty?: boolean;
  id?: string;
}

export default function ServiceCatalog({
  services,
  available,
  categories,
  heading,
  hideWhenEmpty = false,
  id,
}: ServiceCatalogProps) {
  // `available` distinguishes "Stripe unreachable" from "nothing published";
  // both render the same honest fallback, so it is only used for diagnostics.
  if (!available && process.env.NODE_ENV !== "production") {
    console.warn("[ServiceCatalog] Stripe catalog unavailable — showing fallback.");
  }
  const { lang } = useLang();
  const t = DICTS[lang];
  const reduceMotion = useReducedMotion() === true;

  const visibleCategories = useMemo(() => {
    const allowed = categories ?? SERVICE_CATEGORIES;
    return SERVICE_CATEGORIES.filter(
      (category) =>
        allowed.includes(category) && services.some((s) => s.category === category),
    );
  }, [categories, services]);

  const [selected, setSelected] = useState<CatalogCategory | null>(null);
  const active: CatalogCategory | undefined =
    selected && visibleCategories.includes(selected) ? selected : visibleCategories[0];

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = id ?? "service-catalog";

  const isEmpty = visibleCategories.length === 0 || !active;
  if (isEmpty && hideWhenEmpty) return null;

  const items = active ? services.filter((s) => s.category === active) : [];
  const head = heading ?? { eyebrow: t.eyebrow, title: t.title, intro: t.intro };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = visibleCategories.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    const category = visibleCategories[next];
    if (category) {
      setSelected(category);
      tabRefs.current[next]?.focus();
    }
  };

  const book = (service: CatalogService) => {
    openConsultationFor({
      services: CONSULT_TOKEN[service.category],
      message: t.prefill(service.name[lang]),
    });
  };

  return (
    <section
      id={id}
      aria-labelledby={`${baseId}-title`}
      className="services-pricing-section py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {head.eyebrow ? (
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-vx-cyan">
              {head.eyebrow}
            </p>
          ) : null}
          <h2
            id={`${baseId}-title`}
            className="mt-4 text-3xl font-bold tracking-[-0.045em] sm:text-5xl"
          >
            {head.title}
          </h2>
          {head.intro ? (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-vx-muted">
              {head.intro}
            </p>
          ) : null}
        </div>

        {isEmpty ? (
          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-[rgba(14,165,233,0.16)] bg-vx-bg2 p-8 text-center">
            <h3 className="text-xl font-semibold text-vx-ink">{t.emptyTitle}</h3>
            <p className="mt-3 text-vx-muted">{t.emptyBody}</p>
            <button
              type="button"
              onClick={openConsultation}
              className="services-price-cta services-catalog-cta is-featured mt-6 sm:w-auto sm:px-6"
            >
              <CalendarClock size={17} aria-hidden />
              {t.cta}
            </button>
          </div>
        ) : (
          <>
            {visibleCategories.length > 1 ? (
              <div
                role="tablist"
                aria-label={t.tablistLabel}
                className="services-category-tabs mx-auto mt-10"
              >
                {visibleCategories.map((category, index) => {
                  const isSelected = category === active;
                  return (
                    <button
                      key={category}
                      ref={(node) => {
                        tabRefs.current[index] = node;
                      }}
                      id={`${baseId}-tab-${category}`}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      aria-controls={`${baseId}-panel`}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => setSelected(category)}
                      onKeyDown={(event) => onTabKey(event, index)}
                      className="services-category-tab"
                    >
                      {t.categories[category]}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                id={`${baseId}-panel`}
                role={visibleCategories.length > 1 ? "tabpanel" : undefined}
                aria-labelledby={
                  visibleCategories.length > 1 ? `${baseId}-tab-${active}` : undefined
                }
                className="services-price-grid mt-12"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              >
                {items.map((service, index) => {
                  const name = service.name[lang];
                  const titleId = `${baseId}-${service.slug}`;
                  return (
                    <motion.article
                      key={service.id}
                      aria-labelledby={titleId}
                      className={`services-price-card is-catalog ${service.featured ? "is-featured" : ""}`}
                      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduceMotion ? 0 : index * 0.06, duration: 0.42 }}
                    >
                      {service.featured ? (
                        <span className="services-popular-badge">
                          <Sparkles size={13} aria-hidden />
                          {t.recommended}
                        </span>
                      ) : null}

                      <h3
                        id={titleId}
                        className="text-2xl font-bold tracking-[-0.03em] text-vx-ink"
                      >
                        {name}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-vx-muted">
                        {service.description[lang]}
                      </p>

                      {service.features[lang].length > 0 ? (
                        <ul className="mt-7 space-y-3">
                          {service.features[lang].map((feature) => (
                            <li
                              key={feature}
                              className="flex items-start gap-3 text-sm leading-6 text-vx-silver"
                            >
                              <Check size={17} className="mt-1 shrink-0 text-vx-cyan" aria-hidden />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      <div className="mt-auto pt-8">
                        <button
                          type="button"
                          onClick={() => book(service)}
                          aria-label={t.ctaAria(name)}
                          className={`services-price-cta services-catalog-cta ${service.featured ? "is-featured" : ""}`}
                        >
                          <CalendarClock size={17} aria-hidden />
                          {t.cta}
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-6 text-vx-muted">
              {t.pricingNote}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
