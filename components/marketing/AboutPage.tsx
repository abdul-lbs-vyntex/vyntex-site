"use client";

import { CheckCircle2 } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { pageCopy } from "@/lib/marketing-content";
import PageShell from "@/components/marketing/PageShell";
import MarketingHero from "@/components/marketing/MarketingHero";
import Container from "@/components/ui/Container";

export default function AboutPage() {
  const { lang } = useLang();
  const c = pageCopy[lang].about;

  return (
    <PageShell>
      <MarketingHero
        eyebrow={c.eyebrow}
        title={c.title}
        description={c.intro}
        primaryHref="/contact"
        primaryLabel={lang === "en" ? "Book a Free Consultation" : "Agenda tu Consulta Gratis"}
      />

      <section className="py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div className="space-y-5 text-lg leading-8 text-vx-muted">
            {c.body.slice(0, 2).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <aside className="rounded-2xl border border-[rgba(14,165,233,.16)] bg-vx-bg2 p-7">
            <h2 className="text-2xl font-semibold">{lang === "en" ? "What guides our work" : "Lo que guía nuestro trabajo"}</h2>
            <ul className="mt-6 space-y-4">
              {c.values.slice(0, 4).map((value) => <li key={value} className="flex gap-3 text-vx-silver"><CheckCircle2 size={18} className="mt-1 shrink-0 text-vx-cyan"/>{value}</li>)}
            </ul>
          </aside>
        </Container>
      </section>

      <section className="border-y border-vx-line bg-vx-bg2/40 py-16">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { en: "Strategy before software", es: "Estrategia antes del software" },
              { en: "Built for real operations", es: "Creado para operaciones reales" },
              { en: "Clear, bilingual support", es: "Apoyo claro y bilingüe" },
            ].map((item) => <article key={item.en} className="rounded-2xl border border-[rgba(14,165,233,.12)] bg-vx-bg p-7"><h3 className="text-xl font-semibold">{lang === "en" ? item.en : item.es}</h3></article>)}
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
