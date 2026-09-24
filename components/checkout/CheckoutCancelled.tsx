"use client";

import { XCircle } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { SECTION_IDS } from "@/lib/site";
import GlowCard from "@/components/ui/GlowCard";
import Button from "@/components/ui/Button";

export default function CheckoutCancelled() {
  const { t } = useLang();
  const c = t.orders.cancel;

  return (
    <GlowCard className="flex flex-col items-center gap-5 p-8 text-center sm:p-10">
      <span className="grid h-16 w-16 place-items-center rounded-2xl border border-[rgba(14,165,233,0.25)] bg-vx-bg3 text-vx-silver">
        <XCircle size={28} aria-hidden />
      </span>
      <div>
        <h1 className="text-2xl font-bold text-vx-ink">{c.title}</h1>
        <p role="status" className="mx-auto mt-2 max-w-md text-sm text-vx-muted">
          {c.body}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button href="/portal" variant="primary">
          {c.retry}
        </Button>
        <Button href={`/#${SECTION_IDS.contact}`} variant="ghost">
          {c.contact}
        </Button>
      </div>
    </GlowCard>
  );
}
