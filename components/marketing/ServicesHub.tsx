"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { servicesByLang, pageCopy } from "@/lib/marketing-content";
import PageShell from "@/components/marketing/PageShell";
import MarketingHero from "@/components/marketing/MarketingHero";
import ServiceCatalog from "@/components/services/ServiceCatalog";
import Container from "@/components/ui/Container";

const serviceOrder = [
  "crm-systems",
  "ai-automation",
  "web-development",
  "ai-chatbots",
  "digital-marketing",
  "branding",
];

export default function ServicesHub() {
  const { lang } = useLang();
  const copy = pageCopy[lang].services;
  const services = [...servicesByLang[lang]].sort(
    (a, b) => serviceOrder.indexOf(a.slug) - serviceOrder.indexOf(b.slug),
  );

  return (
    <PageShell>
      <MarketingHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        primaryHref="/contact"
        primaryLabel={lang === "en" ? "Book a Free Consultation" : "Agenda tu Consulta Gratis"}
      />

      <ServiceCatalog id="service-catalog" />

      <section className="border-t border-vx-line py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-vx-cyan">
              {lang === "en" ? "EXPLORE EVERY SERVICE" : "EXPLORE CADA SERVICIO"}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.045em] sm:text-5xl">
              {lang === "en" ? "Understand What Each Service Includes" : "Conozca Qué Incluye Cada Servicio"}
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <article key={service.slug} className="service-explorer-card group">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-vx-cyan">{service.eyebrow}</p>
                  <span className="font-mono text-xs text-vx-muted">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-vx-ink">{service.shortTitle}</h3>
                <p className="mt-3 text-sm leading-6 text-vx-muted">{service.summary}</p>
                <Link href={`/services/${service.slug}`} className="mt-6 inline-flex items-center gap-2 font-semibold text-vx-cyan transition-colors hover:text-vx-glow">
                  {lang === "en" ? "Explore Service" : "Explorar Servicio"}
                  <ArrowRight size={16} aria-hidden />
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
