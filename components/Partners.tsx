"use client";

import { Check, Lock } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { SECTION_IDS } from "@/lib/site";
import { RESELLER_PROGRAM } from "@/lib/reseller-program";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GlowCard from "@/components/ui/GlowCard";
import Button from "@/components/ui/Button";

/**
 * Public reseller-program preview ONLY. No wholesale prices, partner numbers,
 * access logic, credentials, or admin codes appear here. The activation fee and
 * minimum come from the centralized program constants.
 */
export default function Partners() {
  const { t } = useLang();

  return (
    <section id={SECTION_IDS.partners} className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={t.sections.partners.eyebrow}
          title={t.sections.partners.title}
          description={t.sections.partners.description}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Program overview */}
          <GlowCard className="flex flex-col gap-6 p-7 sm:p-8">
            <p className="text-vx-muted">{t.partners.intro}</p>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-vx-blue">
                {t.partners.factsLabel}
              </p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {t.partners.facts.map((fact) => (
                  <li key={fact} className="flex items-start gap-2.5 text-sm text-vx-silver">
                    <Check size={16} className="mt-0.5 shrink-0 text-vx-cyan" aria-hidden />
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-auto flex flex-col gap-3 sm:flex-row">
              <Button href="/partners/apply" variant="primary">
                {t.partners.ctaApply}
              </Button>
              <Button href={`#${SECTION_IDS.contact}`} variant="ghost">
                {t.partners.ctaLearn}
              </Button>
            </div>
          </GlowCard>

          {/* Locked library visual */}
          <GlowCard className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl border border-vx-blue/30 bg-vx-bg3 text-vx-blue">
              <Lock size={26} aria-hidden />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-vx-ink">
                {t.partners.lockedTitle}
              </h3>
              <p className="mt-2 text-sm text-vx-muted">{t.partners.lockedSubtitle}</p>
            </div>
            <div className="mt-2 w-full space-y-2" aria-hidden>
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="flex items-center justify-between rounded-lg border border-[rgba(14,165,233,0.12)] bg-vx-bg px-3 py-2.5"
                >
                  <span className="h-2.5 w-24 rounded-full bg-vx-bg3" />
                  <span className="h-2.5 w-12 rounded-full bg-vx-bg3 blur-[2px]" />
                </div>
              ))}
            </div>
            <p className="font-mono text-[0.65rem] uppercase tracking-wide text-vx-silver-dim">
              {RESELLER_PROGRAM.activationFee}
              {t.pricing.units.perYear} · {RESELLER_PROGRAM.minimumResalesPerYear}+ /yr
            </p>
          </GlowCard>
        </div>
      </Container>
    </section>
  );
}
