"use client";

import { Check, ArrowRight } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { RESELLER_PROGRAM } from "@/lib/reseller-program";
import GlowCard from "@/components/ui/GlowCard";

/**
 * PUBLIC program terms. The activation fee and the four-resale minimum are
 * public terms of the program (they appear in the reseller agreement itself),
 * so they are safe to show. Nothing else from RESELLER_PRICING is imported or
 * rendered here.
 */
export default function ProgramTerms() {
  const { t } = useLang();
  const a = t.reseller.apply;

  const fee = RESELLER_PROGRAM.activationFee;
  const min = String(RESELLER_PROGRAM.minimumResalesPerYear);

  return (
    <div className="flex flex-col gap-6">
      <GlowCard className="p-6 sm:p-7">
        <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-vx-blue">
          {a.programHeading}
        </h2>
        <ul className="mt-4 flex flex-col gap-2.5">
          {a.programTerms.map((term) => (
            <li
              key={term}
              className="flex items-start gap-2.5 text-sm text-vx-silver"
            >
              <Check size={16} className="mt-0.5 shrink-0 text-vx-cyan" aria-hidden />
              {term.replace("{fee}", fee).replace("{min}", min)}
            </li>
          ))}
        </ul>
      </GlowCard>

      <GlowCard className="p-6 sm:p-7">
        <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-vx-blue">
          {a.stepsHeading}
        </h2>
        <ol className="mt-4 flex flex-col gap-3">
          {a.steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm text-vx-silver">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-vx-blue/30 bg-vx-bg3 font-mono text-[0.7rem] text-vx-blue">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <p className="mt-5 flex items-start gap-2 border-t border-[rgba(14,165,233,0.12)] pt-4 text-xs text-vx-silver-dim">
          <ArrowRight size={13} className="mt-0.5 shrink-0" aria-hidden />
          {a.disclaimer}
        </p>
      </GlowCard>
    </div>
  );
}
