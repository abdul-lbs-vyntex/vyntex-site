"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, X, CalendarClock, ArrowRight, Compass } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { openConsultation, openConsultationFor } from "@/components/BookConsultation";
import type { CONSULT_SERVICES } from "@/lib/validation/consultation";
import {
  AI_BLUEPRINT,
  SERVICE_GROUPS,
  SERVICES,
  type ServiceGroupId,
  type ServiceItem,
} from "@/lib/services-catalog";

/**
 * VYNTEX service catalog — same content and card structure as the Command
 * Center, with NO prices, fees, deposits, terms, or quotes. Every card leads to
 * the free 30-minute consultation, pre-filled with the service chosen. Custom
 * work routes to the AI Blueprint.
 */

type ConsultService = (typeof CONSULT_SERVICES)[number];
type Lang = "en" | "es";

/** Custom work is planned through the AI Blueprint, never quoted on the site. */
const CUSTOM_IDS = new Set(["web-custom", "ai-advanced"]);

function consultTokens(service: ServiceItem): ConsultService[] {
  switch (service.group) {
    case "crm":
      return ["crm"];
    case "web":
      return ["website"];
    case "ai":
      return ["ai_automation"];
    case "brand":
      return service.id === "social-mgmt" ? ["social_media"] : ["branding"];
    default:
      return [];
  }
}

const en = {
  eyebrow: "SERVICES",
  title: "Choose the Right Starting Point",
  intro: "Start with one focused service, then connect more systems as your business grows.",
  tablistLabel: "Service categories",
  popular: "Most popular",
  readyIn: "Ready in",
  includes: "What you get",
  excludes: "What is not included",
  bestFor: "Best for",
  cta: "Book a Free Consultation",
  ctaAria: (name: string) => `Book a free consultation about ${name}`,
  prefill: (name: string) => `I'd like to learn more about: ${name}.`,
  consultTitle: "Free 30-minute consultation",
  consultBody:
    "We talk through your business, recommend the package that fits, and walk you through its pricing. No sales pressure, in English or Spanish.",
  thirdParty:
    "Third-party platform fees (hosting, domains, software, messaging, advertising) are billed separately.",
  blueprintEyebrow: "NEED SOMETHING CUSTOM?",
  blueprintCta: "Request an AI Blueprint",
  blueprintPrefill: "I'd like to request an AI Blueprint for my business.",
};

type Dict = typeof en;

const es: Dict = {
  eyebrow: "SERVICIOS",
  title: "Elija el Punto de Partida Correcto",
  intro: "Empiece con un servicio específico y conecte más sistemas a medida que su negocio crece.",
  tablistLabel: "Categorías de servicios",
  popular: "Más popular",
  readyIn: "Listo en",
  includes: "Lo que recibe",
  excludes: "Lo que no incluye",
  bestFor: "Ideal para",
  cta: "Agende su Consulta Gratis",
  ctaAria: (name: string) => `Agende una consulta gratis sobre ${name}`,
  prefill: (name: string) => `Me gustaría saber más sobre: ${name}.`,
  consultTitle: "Consulta gratis de 30 minutos",
  consultBody:
    "Hablamos de su negocio, le recomendamos el paquete adecuado y le explicamos su precio. Sin presión de ventas, en inglés o en español.",
  thirdParty:
    "Las tarifas de plataformas de terceros (hosting, dominios, software, mensajería, publicidad) se facturan por separado.",
  blueprintEyebrow: "¿NECESITA ALGO PERSONALIZADO?",
  blueprintCta: "Solicite un AI Blueprint",
  blueprintPrefill: "Me gustaría solicitar un AI Blueprint para mi negocio.",
};

const DICTS: Record<Lang, Dict> = { en, es };

interface ServiceCatalogProps {
  /** Limit to these groups (e.g. on a service detail page). Default: all. */
  groups?: ServiceGroupId[];
  /** Limit to these service ids within the groups. */
  ids?: string[];
  heading?: { eyebrow?: string; title: string; intro?: string };
  /** Show the AI Blueprint panel for custom work. */
  showBlueprint?: boolean;
  id?: string;
}

export default function ServiceCatalog({
  groups,
  ids,
  heading,
  showBlueprint = true,
  id = "service-catalog",
}: ServiceCatalogProps) {
  const { lang } = useLang();
  const t = DICTS[lang];
  const reduceMotion = useReducedMotion() === true;

  const visibleGroups = useMemo(
    () =>
      SERVICE_GROUPS.filter(
        (group) =>
          (!groups || groups.includes(group.id)) &&
          SERVICES.some((s) => s.group === group.id && (!ids || ids.includes(s.id))),
      ),
    [groups, ids],
  );

  const [selected, setSelected] = useState<ServiceGroupId | null>(null);
  const active =
    visibleGroups.find((g) => g.id === selected) ?? visibleGroups[0] ?? null;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!active) return null;

  const items = SERVICES.filter(
    (s) => s.group === active.id && (!ids || ids.includes(s.id)),
  );
  const head = heading ?? { eyebrow: t.eyebrow, title: t.title, intro: t.intro };
  const twoColumn = !active.wide || items.length === 2;

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = visibleGroups.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    const group = visibleGroups[next];
    if (group) {
      setSelected(group.id);
      tabRefs.current[next]?.focus();
    }
  };

  const book = (service: ServiceItem) =>
    openConsultationFor({
      services: consultTokens(service),
      message: t.prefill(service.name[lang]),
    });

  const requestBlueprint = () =>
    openConsultationFor({ services: [], message: t.blueprintPrefill });

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="services-pricing-section py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1200px] px-5 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {head.eyebrow ? (
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-vx-cyan">{head.eyebrow}</p>
          ) : null}
          <h2 id={`${id}-title`} className="mt-4 text-3xl font-bold tracking-[-0.045em] sm:text-5xl">
            {head.title}
          </h2>
          {head.intro ? (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-vx-muted">{head.intro}</p>
          ) : null}
        </div>

        {visibleGroups.length > 1 ? (
          <div role="tablist" aria-label={t.tablistLabel} className="services-category-tabs mx-auto mt-10">
            {visibleGroups.map((group, index) => {
              const isSelected = group.id === active.id;
              return (
                <button
                  key={group.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  id={`${id}-tab-${group.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`${id}-panel`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setSelected(group.id)}
                  onKeyDown={(event) => onTabKey(event, index)}
                  className="services-category-tab"
                >
                  {group.label[lang]}
                </button>
              );
            })}
          </div>
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.id}
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-6 text-vx-muted">
              {active.note[lang]}
            </p>

            <div
              id={`${id}-panel`}
              role={visibleGroups.length > 1 ? "tabpanel" : undefined}
              aria-labelledby={visibleGroups.length > 1 ? `${id}-tab-${active.id}` : undefined}
              className={`services-price-grid is-catalog ${twoColumn ? "is-two" : ""} mt-10`}
            >
              {items.map((service, index) => {
                const name = service.name[lang];
                const titleId = `${id}-${service.id}`;
                return (
                  <motion.article
                    key={service.id}
                    aria-labelledby={titleId}
                    className={`services-price-card is-catalog ${service.popular ? "is-featured" : ""}`}
                    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : index * 0.05, duration: 0.4 }}
                  >
                    {service.popular ? <span className="services-popular-badge">{t.popular}</span> : null}

                    <h3 id={titleId} className="text-2xl font-bold tracking-[-0.03em] text-vx-ink">
                      {name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-vx-muted">{service.line[lang]}</p>

                    <dl className="catalog-detail mt-6">
                      <dt>{t.readyIn}</dt>
                      <dd>{service.readyIn[lang]}</dd>
                    </dl>

                    <h4 className="catalog-heading mt-6 text-vx-cyan">{t.includes}</h4>
                    <ul className="mt-3 space-y-2">
                      {service.includes[lang].map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-vx-silver">
                          <Check size={16} className="mt-1 shrink-0 text-vx-cyan" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    {service.excludes[lang].length > 0 ? (
                      <>
                        <h4 className="catalog-heading mt-6 text-vx-muted">{t.excludes}</h4>
                        <ul className="mt-3 space-y-2">
                          {service.excludes[lang].map((item) => (
                            <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-vx-muted">
                              <X size={15} className="mt-1 shrink-0 opacity-70" aria-hidden />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}

                    <p className="catalog-best mt-6 text-sm leading-6 text-vx-muted">
                      <strong className="font-semibold text-vx-silver">{t.bestFor}:</strong>{" "}
                      {service.bestFor[lang]}
                    </p>

                    <div className="mt-auto pt-6">
                      {CUSTOM_IDS.has(service.id) ? (
                        <button
                          type="button"
                          onClick={requestBlueprint}
                          className="services-price-cta services-catalog-cta"
                        >
                          {t.blueprintCta}
                          <ArrowRight size={17} aria-hidden />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => book(service)}
                          aria-label={t.ctaAria(name)}
                          className={`services-price-cta services-catalog-cta ${service.popular ? "is-featured" : ""}`}
                        >
                          <CalendarClock size={17} aria-hidden />
                          {t.cta}
                        </button>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-2">
          <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-[rgba(34,211,238,0.28)] bg-vx-bg2 p-6 text-center sm:p-8">
            <div>
              <h3 className="text-xl font-bold text-vx-ink">{t.consultTitle}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-vx-muted">{t.consultBody}</p>
            </div>
            <button
              type="button"
              onClick={openConsultation}
              className="services-price-cta services-catalog-cta is-featured sm:w-auto sm:px-7"
            >
              <CalendarClock size={17} aria-hidden />
              {t.cta}
            </button>
            <p className="text-xs leading-5 text-vx-muted">{t.thirdParty}</p>
          </div>

          {showBlueprint ? (
            <div
              id={`${id}-blueprint`}
              className="flex flex-col rounded-2xl border border-[rgba(148,163,184,0.16)] bg-vx-bg2 p-6 sm:p-8"
            >
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-vx-cyan">
                {t.blueprintEyebrow}
              </p>
              <h3 className="mt-3 flex items-center gap-2 text-xl font-bold text-vx-ink">
                <Compass size={20} className="text-vx-cyan" aria-hidden />
                {AI_BLUEPRINT.name[lang]}
              </h3>
              <p className="mt-2 text-sm leading-6 text-vx-muted">{AI_BLUEPRINT.line[lang]}</p>
              <ul className="mt-4 space-y-2">
                {AI_BLUEPRINT.includes[lang].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-vx-silver">
                    <Check size={16} className="mt-1 shrink-0 text-vx-cyan" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <button
                  type="button"
                  onClick={requestBlueprint}
                  className="services-price-cta services-catalog-cta"
                >
                  {t.blueprintCta}
                  <ArrowRight size={17} aria-hidden />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
