"use client";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { getService } from "@/lib/marketing-content";
import ServiceCatalog from "@/components/services/ServiceCatalog";
import type { ServiceGroupId } from "@/lib/services-catalog";
import PageShell from "@/components/marketing/PageShell";
import MarketingHero from "@/components/marketing/MarketingHero";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

const labels = { en: { ideal: "Ideal for", challenges: "Problems we solve", capabilities: "What we can build", deliverables: "What your project can include", process: "Our process", outcomes: "Business outcomes", integrations: "Common integrations", options: "Available Options", optionsIntro: "Book a free 30-minute consultation to find the right option and its pricing.", faq: "Frequently asked questions", discuss: "Discuss This Service", all: "View All Services", note: "Third-party software, hosting, domains, SMS, advertising, and platform fees are separate unless specifically included in writing." }, es: { ideal: "Ideal para", challenges: "Problemas que resolvemos", capabilities: "Lo que podemos crear", deliverables: "Lo que puede incluir su proyecto", process: "Nuestro proceso", outcomes: "Resultados para el negocio", integrations: "Integraciones comunes", options: "Opciones disponibles", optionsIntro: "Agenda una consulta gratis de 30 minutos para encontrar la opción adecuada y conocer su precio.", faq: "Preguntas frecuentes", discuss: "Consultar este servicio", all: "Ver todos los servicios", note: "Los costos de software, hosting, dominios, SMS, publicidad y plataformas de terceros son separados salvo que se incluyan por escrito." } } as const;

function List({ items }: { items: string[] }) { return <ul className="grid gap-3 sm:grid-cols-2">{items.map((item) => <li key={item} className="flex gap-3 rounded-xl border border-[rgba(14,165,233,0.12)] bg-vx-bg2/50 p-4 text-sm text-vx-silver"><CheckCircle2 className="mt-0.5 shrink-0 text-vx-cyan" size={17} />{item}</li>)}</ul>; }

/** Marketing service page category → catalog group (and specific services). */
const CATALOG_SCOPE: Record<"websites" | "ai" | "crm" | "branding" | "social", { groups: ServiceGroupId[]; ids?: string[] }> = {
  websites: { groups: ["web"] },
  ai: { groups: ["ai"] },
  crm: { groups: ["crm"] },
  branding: { groups: ["brand"], ids: ["brand-logo", "brand-bundle", "brand-kit"] },
  social: { groups: ["brand"], ids: ["social-mgmt"] },
};

export default function ServiceDetail({ slug }: { slug: string }) {
  const { lang } = useLang(); const service = getService(lang, slug); const l = labels[lang];
  if (!service) return null;
  return <PageShell><MarketingHero eyebrow={service.eyebrow} title={service.title} description={service.summary} primaryHref="/contact" primaryLabel={l.discuss} secondaryHref="/services" secondaryLabel={l.all} />
    <section className="py-16"><Container><div className="rounded-2xl border border-[rgba(34,211,238,0.2)] bg-vx-bg2 p-7 text-xl font-medium text-vx-silver">{service.promise}</div></Container></section>
    <section className="pb-20"><Container className="grid gap-14 lg:grid-cols-2"><div><h2 className="text-3xl font-semibold">{l.ideal}</h2><div className="mt-6"><List items={service.idealFor} /></div></div><div><h2 className="text-3xl font-semibold">{l.challenges}</h2><div className="mt-6"><List items={service.problems} /></div></div></Container></section>
    <section className="bg-vx-bg2/40 py-20"><Container><h2 className="text-3xl font-semibold">{l.capabilities}</h2><div className="mt-8"><List items={service.solutions} /></div><h2 className="mt-16 text-3xl font-semibold">{l.deliverables}</h2><div className="mt-8"><List items={service.deliverables} /></div></Container></section>
    <section className="py-20"><Container><h2 className="text-3xl font-semibold">{l.process}</h2><div className="mt-10 grid gap-5 md:grid-cols-5">{service.process.map((step, i) => <article key={step.title} className="rounded-2xl border border-[rgba(14,165,233,0.14)] bg-vx-bg2 p-5"><span className="font-mono text-sm text-vx-cyan">0{i + 1}</span><h3 className="mt-4 text-lg font-semibold">{step.title}</h3><p className="mt-3 text-sm text-vx-muted">{step.text}</p></article>)}</div></Container></section>
    <section className="bg-vx-bg2/40 py-20"><Container className="grid gap-14 lg:grid-cols-2"><div><h2 className="text-3xl font-semibold">{l.outcomes}</h2><div className="mt-7"><List items={service.outcomes} /></div></div><div><h2 className="text-3xl font-semibold">{l.integrations}</h2><div className="mt-7"><List items={service.integrations} /></div></div></Container></section>
    <ServiceCatalog id={`options-${slug}`} groups={CATALOG_SCOPE[service.pricingCategory].groups} ids={CATALOG_SCOPE[service.pricingCategory].ids} heading={{ title: l.options, intro: l.optionsIntro }} showBlueprint={service.pricingCategory === "websites" || service.pricingCategory === "ai"} />
    <section className="pb-10"><Container><p className="text-sm text-vx-muted">{l.note}</p></Container></section>
    <section className="bg-vx-bg2/40 py-20"><Container><h2 className="text-3xl font-semibold">{l.faq}</h2><div className="mt-8 grid gap-4">{service.faq.map((item) => <details key={item.q} className="rounded-xl border border-[rgba(14,165,233,0.14)] bg-vx-bg p-5"><summary className="cursor-pointer font-semibold">{item.q}</summary><p className="mt-3 text-vx-muted">{item.a}</p></details>)}</div><div className="mt-10 flex flex-wrap gap-3"><Button href="/contact">{l.discuss}</Button><Link href="/services" className="inline-flex items-center gap-2 px-4 py-3 text-vx-cyan">{l.all}<ArrowRight size={16}/></Link></div></Container></section>
  </PageShell>;
}
