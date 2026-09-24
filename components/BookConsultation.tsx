"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Check, Loader2 } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import {
  makeConsultationSchema,
  CONSULT_SERVICES,
  CONSULT_BUDGETS,
  CONSULT_TIMELINES,
  CONSULT_PREFERRED,
  CONSULT_MESSAGE_MIN,
  type ConsultationInput,
} from "@/lib/validation/consultation";
import Button from "@/components/ui/Button";
import { TextField, TextAreaField, SelectField } from "@/components/ui/FormFields";

const OPEN_EVENT = "vx:open-consultation";

type ConsultService = (typeof CONSULT_SERVICES)[number];

/** Optional values used to pre-fill the modal (e.g. from a service card). */
export interface ConsultationPrefill {
  services?: ConsultService[];
  message?: string;
}

/**
 * Dispatch from anywhere to open the consultation modal. Safe to pass directly
 * as an onClick handler — the click event argument is ignored.
 */
export function openConsultation(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_EVENT));
}

/** Opens the consultation modal with the given service(s) and note pre-filled. */
export function openConsultationFor(prefill: ConsultationPrefill): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<ConsultationPrefill>(OPEN_EVENT, { detail: prefill }),
    );
  }
}

type Status = "idle" | "submitting" | "success" | "error";

export default function BookConsultation() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const startedAt = useRef<number>(Date.now());

  const schema = makeConsultationSchema({
    required: t.forms.errors.required,
    invalidEmail: t.forms.errors.invalidEmail,
    invalidPhone: t.forms.errors.invalidPhone,
    minMessage: t.forms.errors.minMessage.replace("{min}", String(CONSULT_MESSAGE_MIN)),
    consent: t.forms.errors.consent,
    selectAtLeastOne: t.forms.errors.selectAtLeastOne,
    selectOne: t.forms.errors.required,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConsultationInput>({
    resolver: zodResolver(schema),
    defaultValues: { services: [], honeypot: "", language: lang },
  });

  useEffect(() => {
    const onOpen = (event: Event) => {
      const prefill: ConsultationPrefill =
        event instanceof CustomEvent && event.detail ? (event.detail as ConsultationPrefill) : {};
      triggerRef.current = document.activeElement;
      startedAt.current = Date.now();
      setStatus("idle");
      setErrorMsg("");
      reset({
        services: prefill.services ?? [],
        message: prefill.message ?? "",
        honeypot: "",
        language: lang,
      });
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [reset, lang]);

  const close = () => {
    setOpen(false);
    if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus();
  };

  // Focus trap + ESC + body scroll lock.
  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    const selector =
      'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const focusables = () =>
      node ? Array.from(node.querySelectorAll<HTMLElement>(selector)) : [];
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "Tab") {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0]!;
        const last = items[items.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (values: ConsultationInput) => {
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, startedAt: startedAt.current, language: lang }),
      });
      const data = (await res.json()) as { ok: boolean; partial?: boolean; code?: string };
      if (data.ok) {
        setStatus("success");
        return;
      }
      setErrorMsg(mapError(data.code));
      setStatus("error");
    } catch {
      setErrorMsg(t.forms.errors.network);
      setStatus("error");
    }
  };

  const mapError = (code?: string): string => {
    switch (code) {
      case "rate_limited":
        return t.forms.errors.rateLimited;
      case "spam":
        return t.forms.errors.spam;
      case "validation":
        return t.forms.errors.server;
      default:
        return t.forms.errors.server;
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consult-title"
        className="relative my-8 w-full max-w-lg rounded-2xl border border-[rgba(14,165,233,0.2)] bg-vx-bg2 p-6 shadow-vx-glow sm:p-8"
      >
        <button
          type="button"
          onClick={close}
          aria-label={t.forms.close}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-vx-muted hover:bg-vx-bg3 hover:text-vx-ink"
        >
          <X size={20} aria-hidden />
        </button>

        {status === "success" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-vx-blue to-vx-cyan text-vx-bg">
              <Check size={26} aria-hidden />
            </span>
            <h2 id="consult-title" className="mt-4 text-xl font-bold text-vx-ink">
              {t.forms.success.title}
            </h2>
            <p className="mt-2 max-w-sm text-sm text-vx-muted">{t.forms.success.body}</p>
            <div className="mt-6">
              <Button onClick={close} variant="primary">
                {t.forms.close}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 id="consult-title" className="pr-8 text-xl font-bold text-vx-ink">
              {t.consult.title}
            </h2>
            <p className="mt-1.5 text-sm text-vx-muted">{t.consult.subtitle}</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4" noValidate>
              {/* Honeypot */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="hidden"
                {...register("honeypot")}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label={t.consult.fields.name} error={errors.fullName?.message} required
                  field={register("fullName")} />
                <TextField label={t.consult.fields.business} error={errors.businessName?.message}
                  field={register("businessName")} />
                <TextField label={t.consult.fields.email} type="email" error={errors.email?.message} required
                  field={register("email")} />
                <TextField label={t.consult.fields.phone} type="tel" error={errors.phone?.message}
                  field={register("phone")} />
              </div>

              {/* Services (multi) */}
              <fieldset>
                <legend className="mb-1.5 text-sm text-vx-silver">
                  {t.consult.fields.services} <span className="text-vx-blue">*</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {CONSULT_SERVICES.map((token, i) => (
                    <label
                      key={token}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(14,165,233,0.2)] bg-vx-bg3 px-3 py-1.5 text-sm text-vx-silver has-[:checked]:border-vx-blue has-[:checked]:text-vx-ink"
                    >
                      <input type="checkbox" value={token} className="accent-vx-blue" {...register("services")} />
                      {t.consult.serviceOptions[i]}
                    </label>
                  ))}
                </div>
                {errors.services?.message ? (
                  <p className="mt-1 text-xs text-red-400">{errors.services.message}</p>
                ) : null}
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label={t.consult.fields.budget} required error={errors.budget?.message}
                  placeholder={t.consult.selectPlaceholder}
                  options={CONSULT_BUDGETS.map((v, i) => ({ value: v, label: t.consult.budgetOptions[i]! }))}
                  field={register("budget")} />
                <SelectField label={t.consult.fields.timeline} required error={errors.timeline?.message}
                  placeholder={t.consult.selectPlaceholder}
                  options={CONSULT_TIMELINES.map((v, i) => ({ value: v, label: t.consult.timelineOptions[i]! }))}
                  field={register("timeline")} />
              </div>

              {/* Preferred contact */}
              <fieldset>
                <legend className="mb-1.5 text-sm text-vx-silver">
                  {t.consult.fields.preferredContact} <span className="text-vx-blue">*</span>
                </legend>
                <div className="flex flex-wrap gap-3">
                  {CONSULT_PREFERRED.map((token, i) => (
                    <label key={token} className="inline-flex items-center gap-2 text-sm text-vx-silver">
                      <input type="radio" value={token} className="accent-vx-blue" {...register("preferredContact")} />
                      {t.consult.preferredContactOptions[i]}
                    </label>
                  ))}
                </div>
                {errors.preferredContact?.message ? (
                  <p className="mt-1 text-xs text-red-400">{errors.preferredContact.message}</p>
                ) : null}
              </fieldset>

              <TextField label={t.consult.fields.referral} placeholder={t.consult.referralPlaceholder}
                field={register("referralSource")} />

              <TextAreaField label={t.consult.fields.message} required error={errors.message?.message}
                field={register("message")} />

              <label className="flex items-start gap-2 text-sm text-vx-muted">
                <input type="checkbox" className="mt-1 accent-vx-blue" {...register("consent")} />
                <span>{t.consult.fields.consent}</span>
              </label>
              {errors.consent?.message ? (
                <p className="-mt-2 text-xs text-red-400">{errors.consent.message}</p>
              ) : null}

              {status === "error" ? (
                <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {errorMsg}
                </p>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={close}>
                  {t.forms.cancel}
                </Button>
                <Button type="submit" variant="primary" disabled={status === "submitting"}>
                  {status === "submitting" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" aria-hidden />
                      {t.forms.sending}
                    </>
                  ) : (
                    t.consult.submit
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
