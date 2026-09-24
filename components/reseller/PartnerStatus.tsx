"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Clock,
  FileSignature,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  Ban,
  Download,
  Loader2,
} from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { RESELLER_PROGRAM } from "@/lib/reseller-program";
import { SECTION_IDS } from "@/lib/site";
import GlowCard from "@/components/ui/GlowCard";
import Button from "@/components/ui/Button";
import { FactRow } from "@/components/ui/FormFields";

/**
 * Serializable view of the partner's state. Computed SERVER-side by
 * lib/reseller.ts#getPartnerAccess and passed down. This component renders the
 * state; it does not compute it, and it can never widen it. Note there is no
 * pricing in this payload at all.
 */
export interface PartnerStatusView {
  state:
    | "none"
    | "pending"
    | "approved_unsigned"
    | "signed_unpaid"
    | "active"
    | "expired"
    | "suspended"
    | "terminated";
  partnerNumber: string | null;
  status: string | null;
  activationDate: string | null;
  expirationDate: string | null;
  salesCount: number;
  minimumRequired: number;
  agreementSigned: boolean;
}

type PayKind = "reseller_activation" | "reseller_renewal";

function formatDate(iso: string | null, lang: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(lang === "es" ? "es-US" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PartnerStatus({ view }: { view: PartnerStatusView }) {
  const { t, lang } = useLang();
  const [busy, setBusy] = useState<"" | "pay" | "download">("");
  const [errorMsg, setErrorMsg] = useState("");

  const p = t.partner;
  const fee = RESELLER_PROGRAM.activationFee;

  const startPayment = async (orderType: PayKind) => {
    setBusy("pay");
    setErrorMsg("");
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderType, language: lang }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        url?: string;
        code?: string;
      };

      if (data.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      setErrorMsg(
        data.code === "payments_unavailable"
          ? t.checkout.errors.unavailable
          : data.code === "rate_limited"
            ? t.forms.errors.rateLimited
            : t.checkout.errors.linkFailed,
      );
      setBusy("");
    } catch {
      setErrorMsg(t.forms.errors.network);
      setBusy("");
    }
  };

  const download = async () => {
    setBusy("download");
    setErrorMsg("");
    try {
      const res = await fetch("/api/reseller/agreement/download");
      const data = (await res.json()) as { ok: boolean; url?: string };
      if (data.ok && data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        setErrorMsg(p.downloadError);
      }
    } catch {
      setErrorMsg(t.forms.errors.network);
    }
    setBusy("");
  };

  // --- The call-to-action panel, one per state ----------------------------
  const banner = (() => {
    switch (view.state) {
      case "none":
        return {
          icon: <FileSignature size={24} aria-hidden />,
          tone: "neutral" as const,
          title: p.states.none.title,
          body: p.states.none.body,
          action: (
            <Button href="/partners/apply" variant="primary">
              {p.states.none.cta}
            </Button>
          ),
        };
      case "pending":
        return {
          icon: <Clock size={24} aria-hidden />,
          tone: "neutral" as const,
          title: p.states.pending.title,
          body: p.states.pending.body,
          action: null,
        };
      case "approved_unsigned":
        return {
          icon: <FileSignature size={24} aria-hidden />,
          tone: "info" as const,
          title: p.states.approvedUnsigned.title,
          body: p.states.approvedUnsigned.body,
          action: (
            <Button href="/portal/partner/agreement" variant="primary">
              {p.states.approvedUnsigned.cta}
            </Button>
          ),
        };
      case "signed_unpaid":
        return {
          icon: <CreditCard size={24} aria-hidden />,
          tone: "info" as const,
          title: p.states.signedUnpaid.title,
          body: p.states.signedUnpaid.body.replace("{fee}", fee),
          action: (
            <button
              type="button"
              onClick={() => startPayment("reseller_activation")}
              disabled={busy === "pay"}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-vx-blue to-vx-cyan px-6 py-3 text-sm font-semibold text-vx-bg transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy === "pay" ? (
                <Loader2 size={16} className="animate-spin" aria-hidden />
              ) : null}
              {busy === "pay"
                ? t.checkout.submitting
                : p.states.signedUnpaid.cta.replace("{fee}", fee)}
            </button>
          ),
        };
      case "expired":
        return {
          icon: <RefreshCw size={24} aria-hidden />,
          tone: "warn" as const,
          title: p.states.expired.title,
          body: p.states.expired.body,
          action: (
            <button
              type="button"
              onClick={() => startPayment("reseller_renewal")}
              disabled={busy === "pay"}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-vx-blue to-vx-cyan px-6 py-3 text-sm font-semibold text-vx-bg transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy === "pay" ? (
                <Loader2 size={16} className="animate-spin" aria-hidden />
              ) : null}
              {busy === "pay"
                ? t.checkout.submitting
                : p.states.expired.cta.replace("{fee}", fee)}
            </button>
          ),
        };
      case "suspended":
        return {
          icon: <AlertTriangle size={24} aria-hidden />,
          tone: "warn" as const,
          title: p.states.suspended.title,
          body: p.states.suspended.body,
          action: (
            <Button href={`/#${SECTION_IDS.contact}`} variant="ghost">
              {p.states.suspended.cta}
            </Button>
          ),
        };
      case "terminated":
        return {
          icon: <Ban size={24} aria-hidden />,
          tone: "warn" as const,
          title: p.states.terminated.title,
          body: p.states.terminated.body,
          action: (
            <Button href={`/#${SECTION_IDS.contact}`} variant="ghost">
              {p.states.terminated.cta}
            </Button>
          ),
        };
      case "active":
        return null;
    }
  })();

  const toneClasses: Record<"neutral" | "info" | "warn", string> = {
    neutral: "border-[rgba(14,165,233,0.16)] text-vx-silver",
    info: "border-vx-blue/45 text-vx-blue",
    warn: "border-amber-500/45 text-amber-400",
  };

  const salesMet = view.salesCount >= view.minimumRequired;

  return (
    <div className="flex flex-col gap-6">
      {/* State banner (everything except "active") */}
      {banner ? (
        <GlowCard className={`flex flex-col gap-4 p-6 sm:p-7 ${toneClasses[banner.tone]}`}>
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-current/30 bg-vx-bg3">
              {banner.icon}
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-vx-ink">{banner.title}</h2>
              <p className="mt-1.5 text-sm text-vx-muted">{banner.body}</p>
            </div>
          </div>
          {banner.action ? <div className="sm:pl-16">{banner.action}</div> : null}
        </GlowCard>
      ) : null}

      {/* Active confirmation */}
      {view.state === "active" ? (
        <GlowCard className="flex items-start gap-4 border-vx-cyan/40 p-6 sm:p-7">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-vx-cyan/30 bg-vx-bg3 text-vx-cyan">
            <ShieldCheck size={24} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-vx-ink">
              {p.statusLabels.active}
            </h2>
            <p className="mt-1.5 text-sm text-vx-muted">
              {view.expirationDate
                ? p.expiringSoon.replace("{date}", formatDate(view.expirationDate, lang))
                : p.subtitle}
            </p>
          </div>
        </GlowCard>
      ) : null}

      {/* Facts — shown for anyone with a partner record */}
      {view.partnerNumber ? (
        <GlowCard className="p-6 sm:p-7">
          <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.16em] text-vx-blue">
            {p.title}
          </h3>
          <div className="flex flex-col">
            <FactRow label={p.fields.partnerNumber} value={view.partnerNumber} />
            <FactRow
              label={p.fields.status}
              value={
                p.statusLabels[
                  (view.status ?? "none") as keyof typeof p.statusLabels
                ] ?? p.statusLabels.none
              }
            />
            <FactRow
              label={p.fields.agreementStatus}
              value={view.agreementSigned ? p.agreementSigned : p.agreementUnsigned}
            />
            <FactRow
              label={p.fields.activationDate}
              value={formatDate(view.activationDate, lang) || p.notApplicable}
            />
            <FactRow
              label={p.fields.expirationDate}
              value={formatDate(view.expirationDate, lang) || p.notApplicable}
            />
            <FactRow
              label={p.fields.salesCount}
              value={`${view.salesCount} / ${view.minimumRequired}`}
            />
          </div>

          {/* Minimum-sales notice. Not color-only: the text states it plainly. */}
          <p
            className={`mt-4 rounded-lg border px-3 py-2.5 text-xs ${
              salesMet
                ? "border-vx-cyan/30 bg-vx-bg3 text-vx-cyan"
                : "border-amber-500/30 bg-vx-bg3 text-amber-400"
            }`}
          >
            {salesMet
              ? p.minimumMet.replace("{min}", String(view.minimumRequired))
              : p.minimumWarning
                  .replace("{count}", String(view.salesCount))
                  .replace("{min}", String(view.minimumRequired))}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {view.agreementSigned ? (
              <button
                type="button"
                onClick={download}
                disabled={busy === "download"}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[rgba(14,165,233,0.25)] px-4 py-2.5 text-sm font-medium text-vx-silver transition-colors hover:border-vx-blue hover:text-vx-blue disabled:opacity-60"
              >
                {busy === "download" ? (
                  <Loader2 size={15} className="animate-spin" aria-hidden />
                ) : (
                  <Download size={15} aria-hidden />
                )}
                {busy === "download" ? p.actions.preparing : p.actions.downloadAgreement}
              </button>
            ) : null}

            <Link
              href="/portal/partner/orders"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[rgba(14,165,233,0.25)] px-4 py-2.5 text-sm font-medium text-vx-silver transition-colors hover:border-vx-blue hover:text-vx-blue"
            >
              {p.actions.viewOrders}
            </Link>

            {view.state === "active" ? (
              <button
                type="button"
                onClick={() => startPayment("reseller_renewal")}
                disabled={busy === "pay"}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[rgba(14,165,233,0.25)] px-4 py-2.5 text-sm font-medium text-vx-silver transition-colors hover:border-vx-blue hover:text-vx-blue disabled:opacity-60"
              >
                {busy === "pay" ? (
                  <Loader2 size={15} className="animate-spin" aria-hidden />
                ) : (
                  <RefreshCw size={15} aria-hidden />
                )}
                {p.actions.renew}
              </button>
            ) : null}
          </div>

          {errorMsg ? (
            <p role="alert" className="mt-3 text-sm text-red-400">
              {errorMsg}
            </p>
          ) : null}
        </GlowCard>
      ) : null}
    </div>
  );
}
