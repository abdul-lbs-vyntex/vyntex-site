"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, CalendarClock, Sparkles, ArrowRight } from "lucide-react";
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
  cta: "Book a Free Consultation",
  ctaAria: (name: string) => `Book a free consultation about ${name}`,
  prefill: (name: string) => `I'd like to learn more about: ${name}.`,
  blueprintCta: "Request an AI Blueprint",
  blueprintAria: "Request an AI Blueprint",
  blueprintPrefill: "I'd like to request an AI Blueprint for my business.",
  consultTitle: "Free 30-minute consultation",
  consultBody:
    "We talk through your business, recommend the package that fits, and walk you through its pricing. No sales pressure, in English or Spanish.",
  customNote: "Need something custom? We plan it with an AI Blueprint first.",
  customLink: "See the AI Blueprint",
  thirdParty: "Third-party platform fees (hosting, domains, software, messaging, advertising) are billed separately.",
  emptyTitle: "Our service catalog is being updated",
  emptyBody:
    "Book a free 30-minute consultation and we will walk you through every option for your business.",
};

type Dict = typeof en;

const es: Dict = {
  eyebrow: "SERVICIOS",
  title: "Elige el Punto de Partida Correcto",
  intro:
    "Empieza con un servicio específico y conecta más sistemas a medida que tu negocio crece.",
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
  cta: "Agenda tu Consulta Gratis",
  ctaAria: (name: string) => `Agenda una consulta gratis sobre ${name}`,
  prefill: (name: string) => `Me gustaría saber más sobre: ${name}.`,
  blueprintCta: "Solicita un Plan de IA",
  blueprintAria: "Solicita un Plan de IA (AI Blueprint)",
  blueprintPrefill: "Me gustaría solicitar un Plan de IA (AI Blueprint) para mi negocio.",
  consultTitle: "Consulta gratis de 30 minutos",
  consultBody:
    "Hablamos de tu negocio, te recomendamos el paquete adecuado y te explicamos su precio. Sin presión de ventas, en inglés o en español.",
  customNote: "¿Necesitas algo a la medida? Primero lo planificamos con un Plan de IA (AI Blueprint).",
  customLink: "Ver el Plan de IA",
  thirdParty: "Las tarifas de plataformas de terceros (hosting, dominios, software, mensajería, publicidad) se facturan por separado.",
  emptyTitle: "Estamos actualizando nuestro catálogo de servicios",
  emptyBody:
    "Agenda una consulta gratis de 30 minutos y te explicamos todas las opciones para tu negocio.",
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

  const showCustomLink =
    visibleCategories.includes("consulting") && active !== "consulting";

  const selectCategory = (category: CatalogCategory) => {
    setSelected(category);
    const index = visibleCategories.indexOf(category);
    tabRefs.current[index]?.focus();
    document.getElementById(`${baseId}-title`)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  // The AI Blueprint is a paid planning engagement, not the free consultation,
  // so its card asks for a Blueprint instead of offering a free call.
  const isBlueprint = (service: CatalogService) => service.category === "consulting";

  const book = (service: CatalogService) => {
    openConsultationFor({
      services: isBlueprint(service) ? ["ai_automation"] : CONSULT_TOKEN[service.category],
      message: isBlueprint(service) ? t.blueprintPrefill : t.prefill(service.name[lang]),
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
                className={`services-price-grid is-catalog count-${Math.min(items.length, 4)} mt-12`}
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
                          aria-label={isBlueprint(service) ? t.blueprintAria : t.ctaAria(name)}
                          className={`services-price-cta services-catalog-cta ${service.featured ? "is-featured" : ""}`}
                        >
                          <CalendarClock size={17} aria-hidden />
                          {isBlueprint(service) ? t.blueprintCta : t.cta}
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <div className="mx-auto mt-12 flex max-w-4xl flex-col items-center gap-5 rounded-2xl border border-[rgba(34,211,238,0.28)] bg-vx-bg2 p-6 text-center sm:p-8">
              <div>
                <h3 className="text-xl font-bold text-vx-ink">{t.consultTitle}</h3>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-vx-muted">{t.consultBody}</p>
              </div>
              <button
                type="button"
                onClick={openConsultation}
                className="services-price-cta services-catalog-cta is-featured sm:w-auto sm:px-7"
              >
                <CalendarClock size={17} aria-hidden />
                {t.cta}
              </button>
              {showCustomLink ? (
                <p className="text-sm text-vx-silver">
                  {t.customNote}{" "}
                  <button
                    type="button"
                    onClick={() => selectCategory("consulting")}
                    className="services-catalog-cta inline-flex items-center gap-1 font-semibold text-vx-cyan underline-offset-4 hover:underline"
                  >
                    {t.customLink}
                    <ArrowRight size={14} aria-hidden />
                  </button>
                </p>
              ) : null}
              <p className="text-xs leading-5 text-vx-muted">{t.thirdParty}</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
