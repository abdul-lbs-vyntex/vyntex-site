"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, MapPin, Globe2, Languages, Check, Loader2 } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { SITE, CONTACT_HREFS, SECTION_IDS } from "@/lib/site";
import {
  makeContactSchema,
  CONTACT_SERVICES,
  CONTACT_PREFERRED,
  MESSAGE_MIN,
  type ContactInput,
} from "@/lib/validation/contact";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import GlowCard from "@/components/ui/GlowCard";
import Button from "@/components/ui/Button";
import { TextField, TextAreaField, SelectField } from "@/components/ui/FormFields";

type Status = "idle" | "submitting" | "success" | "partial" | "error";

export default function Contact() {
  const { t, lang } = useLang();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const startedAt = useRef<number>(Date.now());
  const f = t.contact.form;

  const schema = makeContactSchema({
    required: t.forms.errors.required,
    invalidEmail: t.forms.errors.invalidEmail,
    invalidPhone: t.forms.errors.invalidPhone,
    minMessage: t.forms.errors.minMessage.replace("{min}", String(MESSAGE_MIN)),
    consent: t.forms.errors.consent,
    selectService: t.forms.errors.selectService,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(schema),
    defaultValues: { preferredContact: "email", honeypot: "", language: lang },
  });

  const mapError = (code?: string): string => {
    switch (code) {
      case "rate_limited":
        return t.forms.errors.rateLimited;
      case "spam":
        return t.forms.errors.spam;
      default:
        return t.forms.errors.server;
    }
  };

  const onSubmit = async (values: ContactInput) => {
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, startedAt: startedAt.current, language: lang }),
      });
      const data = (await res.json()) as { ok: boolean; partial?: boolean; code?: string };
      if (data.ok) {
        setStatus(data.partial ? "partial" : "success");
        reset({ preferredContact: "email", honeypot: "", language: lang });
        return;
      }
      setErrorMsg(mapError(data.code));
      setStatus("error");
    } catch {
      setErrorMsg(t.forms.errors.network);
      setStatus("error");
    }
  };

  const showSuccess = status === "success" || status === "partial";

  return (
    <section id={SECTION_IDS.contact} className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={t.sections.contact.eyebrow}
          title={t.sections.contact.title}
          description={t.sections.contact.description}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Contact details */}
          <GlowCard className="flex flex-col gap-5 p-7 sm:p-8">
            <div>
              <h3 className="text-lg font-semibold text-vx-ink">{t.contact.infoTitle}</h3>
              <p className="mt-1.5 text-sm text-vx-muted">{t.contact.infoSubtitle}</p>
            </div>
            <ul className="flex flex-col gap-4">
              <Row icon={<Mail size={18} aria-hidden />} label={t.contact.labels.email}>
                <a href={CONTACT_HREFS.email} className="text-vx-silver hover:text-vx-ink">
                  {SITE.email}
                </a>
              </Row>
              <Row icon={<Phone size={18} aria-hidden />} label={t.contact.labels.phone}>
                <a href={CONTACT_HREFS.phone} className="text-vx-silver hover:text-vx-ink">
                  {SITE.phone}
                </a>
              </Row>
              <Row icon={<MapPin size={18} aria-hidden />} label={t.contact.labels.location}>
                <span className="text-vx-silver">
                  {SITE.address.locality}, {SITE.address.region} {SITE.address.postalCode}
                </span>
              </Row>
              <Row icon={<Globe2 size={18} aria-hidden />} label={t.contact.labels.area}>
                <span className="text-vx-silver">{t.contact.areaValue}</span>
              </Row>
              <Row icon={<Languages size={18} aria-hidden />} label={t.contact.labels.languages}>
                <span className="text-vx-silver">{t.contact.languagesValue}</span>
              </Row>
            </ul>
          </GlowCard>

          {/* Live form */}
          <GlowCard className="flex flex-col gap-4 p-7 sm:p-8">
            <h3 className="text-lg font-semibold text-vx-ink">{f.title}</h3>

            {showSuccess ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-vx-blue to-vx-cyan text-vx-bg">
                  <Check size={26} aria-hidden />
                </span>
                <div>
                  <p className="text-lg font-semibold text-vx-ink">
                    {t.forms.success.title}
                  </p>
                  <p className="mt-1.5 max-w-sm text-sm text-vx-muted">
                    {t.forms.success.body}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => setStatus("idle")}>
                  {f.sendAnother}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" {...register("honeypot")} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField label={f.name} required field={register("fullName")} error={errors.fullName?.message} autoComplete="name" />
                  <TextField label={f.business} field={register("businessName")} error={errors.businessName?.message} autoComplete="organization" />
                  <TextField label={f.email} type="email" required field={register("email")} error={errors.email?.message} autoComplete="email" />
                  <TextField label={f.phone} type="tel" field={register("phone")} error={errors.phone?.message} autoComplete="tel" />
                </div>

                <SelectField
                  label={f.service}
                  required
                  placeholder={t.consult.selectPlaceholder}
                  field={register("serviceInterest")}
                  error={errors.serviceInterest?.message}
                  options={CONTACT_SERVICES.map((v, i) => ({ value: v, label: f.serviceOptions[i]! }))}
                />

                <fieldset>
                  <legend className="mb-1.5 text-sm text-vx-silver">
                    {f.preferredContactLabel} <span className="text-vx-blue">*</span>
                  </legend>
                  <div className="flex flex-wrap gap-3">
                    {CONTACT_PREFERRED.map((token) => (
                      <label key={token} className="inline-flex items-center gap-2 text-sm text-vx-silver">
                        <input type="radio" value={token} className="accent-vx-blue" {...register("preferredContact")} />
                        {f.preferredContact[token]}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <TextAreaField label={f.message} required field={register("message")} error={errors.message?.message} />

                <label className="flex items-start gap-2 text-sm text-vx-muted">
                  <input type="checkbox" className="mt-1 accent-vx-blue" {...register("consent")} />
                  <span>{f.consent}</span>
                </label>
                {errors.consent?.message ? <p className="-mt-2 text-xs text-red-400">{errors.consent.message}</p> : null}

                {status === "error" ? (
                  <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    {errorMsg}
                  </p>
                ) : null}

                <Button type="submit" variant="primary" fullWidth disabled={status === "submitting"}>
                  {status === "submitting" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" aria-hidden />
                      {t.forms.sending}
                    </>
                  ) : (
                    f.submit
                  )}
                </Button>

                <p className="text-center text-sm text-vx-muted">
                  {f.orReach}{" "}
                  <a href={CONTACT_HREFS.email} className="text-vx-blue hover:text-vx-cyan">
                    {SITE.email}
                  </a>{" "}
                  ·{" "}
                  <a href={CONTACT_HREFS.phone} className="text-vx-blue hover:text-vx-cyan">
                    {SITE.phone}
                  </a>
                </p>
              </form>
            )}
          </GlowCard>
        </div>
      </Container>
    </section>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-vx-blue to-vx-cyan text-vx-bg">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="font-mono text-[0.62rem] uppercase tracking-wide text-vx-silver-dim">
          {label}
        </span>
        <span className="text-sm">{children}</span>
      </span>
    </li>
  );
}
