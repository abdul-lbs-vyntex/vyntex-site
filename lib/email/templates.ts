import { SITE } from "@/lib/site";

/**
 * Transactional email templates (HTML + plain text). User-supplied content is
 * HTML-escaped. Client confirmations are bilingual; internal notifications are
 * in English for the team. No unsupported promises — only the verified
 * one-business-day response commitment and real contact details.
 */

type Lang = "en" | "es";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SERVICE_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    website: "Website",
    ai_automation: "AI Automation",
    ai_chatbot: "AI Chatbot",
    crm: "CRM",
    branding: "Branding",
    digital_marketing: "Digital Marketing",
    social_media: "Social Media",
    reseller: "Reseller Program",
    other: "Other",
  },
  es: {
    website: "Sitio web",
    ai_automation: "Automatización con IA",
    ai_chatbot: "Chatbot con IA",
    crm: "CRM",
    branding: "Imagen de marca",
    digital_marketing: "Marketing digital",
    social_media: "Redes sociales",
    reseller: "Programa de revendedor",
    other: "Otro",
  },
};

const BUDGET_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    under_500: "Under $500",
    "500_1500": "$500–$1,500",
    "1500_5000": "$1,500–$5,000",
    "5000_10000": "$5,000–$10,000",
    "10000_plus": "$10,000+",
    unsure: "Not sure yet",
  },
  es: {
    under_500: "Menos de $500",
    "500_1500": "$500–$1,500",
    "1500_5000": "$1,500–$5,000",
    "5000_10000": "$5,000–$10,000",
    "10000_plus": "$10,000+",
    unsure: "Aún no estoy seguro",
  },
};

const TIMELINE_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    asap: "ASAP",
    "2_4_weeks": "Within 2–4 weeks",
    "1_3_months": "Within 1–3 months",
    planning: "Planning ahead",
  },
  es: {
    asap: "Lo antes posible",
    "2_4_weeks": "En 2–4 semanas",
    "1_3_months": "En 1–3 meses",
    planning: "Planeando a futuro",
  },
};

const PREFERRED_LABELS: Record<Lang, Record<string, string>> = {
  en: { email: "Email", phone: "Phone", text: "Text", whatsapp: "WhatsApp", video: "Video Call" },
  es: { email: "Correo", phone: "Teléfono", text: "Texto", whatsapp: "WhatsApp", video: "Videollamada" },
};

export function serviceLabel(token: string, lang: Lang): string {
  return SERVICE_LABELS[lang][token] ?? token;
}

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

/** Branded shell for HTML emails. `preheader` is the inbox preview line. */
function shell(title: string, bodyHtml: string, preheader: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;background:#0A0D1F;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;">
<tr><td style="background:#050714;padding:22px 28px;">
<span style="font-size:20px;font-weight:800;letter-spacing:-0.02em;color:#38BDF8;">VYNTEX</span>
<div style="font-size:11px;color:#7880A8;margin-top:2px;">AI Automation · Web Development · Digital Technology</div>
</td></tr>
<tr><td style="padding:28px;">
<h1 style="font-size:18px;margin:0 0 16px;color:#111827;">${esc(title)}</h1>
${bodyHtml}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280;">
VYNTEX · ${esc(SITE.address.locality)}, ${esc(SITE.address.region)} ${esc(SITE.address.postalCode)}<br>
${esc(SITE.email)} · ${esc(SITE.phone)}
</td></tr>
</table></body></html>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 0;font-size:13px;color:#6B7280;width:170px;vertical-align:top;">${esc(label)}</td>
<td style="padding:6px 0;font-size:13px;color:#111827;">${esc(value) || "—"}</td></tr>`;
}

// ---------------- Contact ----------------

export interface ContactEmailData {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  serviceInterest: string;
  preferredContact: string;
  message: string;
  language: Lang;
}

export function internalContactEmail(d: ContactEmailData): EmailContent {
  const svc = serviceLabel(d.serviceInterest, "en");
  const subject = `New VYNTEX Contact — ${svc} — ${d.fullName}`;
  const html = shell(
    "New contact submission",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row("Name", d.fullName)}
${row("Business", d.businessName)}
${row("Email", d.email)}
${row("Phone", d.phone)}
${row("Service interest", svc)}
${row("Preferred contact", PREFERRED_LABELS.en[d.preferredContact] ?? d.preferredContact)}
${row("Language", d.language.toUpperCase())}
</table>
<div style="margin-top:16px;padding:14px;background:#F9FAFB;border-radius:8px;font-size:13px;color:#111827;white-space:pre-wrap;">${esc(d.message)}</div>`,
    `New contact from ${d.fullName} (${svc})`,
  );
  const text = `New VYNTEX contact submission
Name: ${d.fullName}
Business: ${d.businessName || "-"}
Email: ${d.email}
Phone: ${d.phone || "-"}
Service: ${svc}
Preferred contact: ${PREFERRED_LABELS.en[d.preferredContact] ?? d.preferredContact}
Language: ${d.language}

Message:
${d.message}`;
  return { subject, html, text };
}

export function clientContactConfirmation(d: ContactEmailData): EmailContent {
  const lang = d.language;
  const subject = lang === "es" ? "Recibimos tu solicitud de VYNTEX" : "We received your VYNTEX request";
  const greeting = lang === "es" ? `Hola ${d.fullName},` : `Hi ${d.fullName},`;
  const bodyIntro =
    lang === "es"
      ? "Gracias por contactar a VYNTEX. Recibimos tu mensaje y te responderemos en un día hábil."
      : "Thanks for reaching out to VYNTEX. We received your message and will reply within one business day.";
  const summaryLabel = lang === "es" ? "Resumen de tu solicitud" : "Summary of your request";
  const reachLabel = lang === "es" ? "¿Necesitas algo pronto?" : "Need something sooner?";
  const svc = serviceLabel(d.serviceInterest, lang);

  const html = shell(
    lang === "es" ? "Recibimos tu solicitud" : "We received your request",
    `<p style="font-size:14px;color:#111827;margin:0 0 12px;">${esc(greeting)}</p>
<p style="font-size:14px;color:#374151;margin:0 0 18px;">${esc(bodyIntro)}</p>
<p style="font-size:12px;color:#6B7280;margin:0 0 6px;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;">${esc(summaryLabel)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row(lang === "es" ? "Servicio" : "Service", svc)}
</table>
<div style="margin-top:8px;padding:14px;background:#F9FAFB;border-radius:8px;font-size:13px;color:#111827;white-space:pre-wrap;">${esc(d.message)}</div>
<p style="font-size:13px;color:#374151;margin:18px 0 4px;font-weight:bold;">${esc(reachLabel)}</p>
<p style="font-size:13px;color:#374151;margin:0;">${esc(SITE.phone)} · ${esc(SITE.email)}</p>`,
    bodyIntro,
  );
  const text = `${greeting}

${bodyIntro}

${summaryLabel}:
${lang === "es" ? "Servicio" : "Service"}: ${svc}

${d.message}

${reachLabel}
${SITE.phone} · ${SITE.email}

— VYNTEX`;
  return { subject, html, text };
}

// ---------------- Consultation ----------------

export interface ConsultationEmailData {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  services: string[];
  budget: string;
  timeline: string;
  preferredContact: string;
  referralSource: string;
  message: string;
  language: Lang;
}

export function internalConsultationEmail(d: ConsultationEmailData): EmailContent {
  const subject = `New VYNTEX Consultation — ${d.fullName}`;
  const services = d.services.map((s) => serviceLabel(s, "en")).join(", ");
  const html = shell(
    "New consultation request",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row("Name", d.fullName)}
${row("Business", d.businessName)}
${row("Email", d.email)}
${row("Phone", d.phone)}
${row("Services", services)}
${row("Budget", BUDGET_LABELS.en[d.budget] ?? d.budget)}
${row("Timeline", TIMELINE_LABELS.en[d.timeline] ?? d.timeline)}
${row("Preferred contact", PREFERRED_LABELS.en[d.preferredContact] ?? d.preferredContact)}
${row("Referral", d.referralSource)}
${row("Language", d.language.toUpperCase())}
</table>
<div style="margin-top:16px;padding:14px;background:#F9FAFB;border-radius:8px;font-size:13px;color:#111827;white-space:pre-wrap;">${esc(d.message)}</div>`,
    `New consultation from ${d.fullName}`,
  );
  const text = `New VYNTEX consultation request
Name: ${d.fullName}
Business: ${d.businessName || "-"}
Email: ${d.email}
Phone: ${d.phone || "-"}
Services: ${services}
Budget: ${BUDGET_LABELS.en[d.budget] ?? d.budget}
Timeline: ${TIMELINE_LABELS.en[d.timeline] ?? d.timeline}
Preferred contact: ${PREFERRED_LABELS.en[d.preferredContact] ?? d.preferredContact}
Referral: ${d.referralSource || "-"}
Language: ${d.language}

Message:
${d.message}`;
  return { subject, html, text };
}

export function clientConsultationConfirmation(d: ConsultationEmailData): EmailContent {
  const lang = d.language;
  const subject = lang === "es" ? "Recibimos tu solicitud de VYNTEX" : "We received your VYNTEX request";
  const greeting = lang === "es" ? `Hola ${d.fullName},` : `Hi ${d.fullName},`;
  const intro =
    lang === "es"
      ? "Gracias por solicitar una consulta con VYNTEX. Te contactaremos en un día hábil por tu método preferido."
      : "Thanks for requesting a consultation with VYNTEX. We'll reach out within one business day via your preferred method.";
  const services = d.services.map((s) => serviceLabel(s, lang)).join(", ");
  const summaryLabel = lang === "es" ? "Resumen de tu solicitud" : "Summary of your request";

  const html = shell(
    lang === "es" ? "Recibimos tu solicitud" : "We received your request",
    `<p style="font-size:14px;color:#111827;margin:0 0 12px;">${esc(greeting)}</p>
<p style="font-size:14px;color:#374151;margin:0 0 18px;">${esc(intro)}</p>
<p style="font-size:12px;color:#6B7280;margin:0 0 6px;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;">${esc(summaryLabel)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row(lang === "es" ? "Servicios" : "Services", services)}
${row(lang === "es" ? "Presupuesto" : "Budget", BUDGET_LABELS[lang][d.budget] ?? d.budget)}
${row(lang === "es" ? "Tiempo" : "Timeline", TIMELINE_LABELS[lang][d.timeline] ?? d.timeline)}
</table>
<p style="font-size:13px;color:#374151;margin:18px 0 0;">${esc(SITE.phone)} · ${esc(SITE.email)}</p>`,
    intro,
  );
  const text = `${greeting}

${intro}

${summaryLabel}:
${lang === "es" ? "Servicios" : "Services"}: ${services}
${lang === "es" ? "Presupuesto" : "Budget"}: ${BUDGET_LABELS[lang][d.budget] ?? d.budget}
${lang === "es" ? "Tiempo" : "Timeline"}: ${TIMELINE_LABELS[lang][d.timeline] ?? d.timeline}

${SITE.phone} · ${SITE.email}

— VYNTEX`;
  return { subject, html, text };
}

// =========================================================================
// Phase 4 — reseller program, agreement, and order emails.
//
// CONFIDENTIALITY RULE: no wholesale price, partner cost, or margin appears in
// any email below. Order confirmations state the amount actually charged (which
// the partner already knows, since they just paid it) and nothing else. The
// wholesale library is never emailed.
// =========================================================================

const CLIENT_COUNT_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    "0": "No clients yet",
    "1_10": "1–10 clients",
    "11_50": "11–50 clients",
    "51_200": "51–200 clients",
    "200_plus": "200+ clients",
  },
  es: {
    "0": "Aún sin clientes",
    "1_10": "1–10 clientes",
    "11_50": "11–50 clientes",
    "51_200": "51–200 clientes",
    "200_plus": "200+ clientes",
  },
};

const RESELL_MODEL_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    add_on_service: "Add-on to an existing service business",
    agency: "Agency or marketing shop",
    referral: "Refer and hand off",
    white_label: "Resell under my own brand",
    other: "Other",
  },
  es: {
    add_on_service: "Complemento a un negocio de servicios existente",
    agency: "Agencia o firma de marketing",
    referral: "Referir y transferir",
    white_label: "Revender bajo mi propia marca",
    other: "Otro",
  },
};

const RESELLER_SERVICE_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    websites: "Websites",
    ai_automation: "AI Automation",
    crm: "CRM",
    branding: "Branding",
    social_media: "Social Media",
    digital_marketing: "Digital Marketing",
  },
  es: {
    websites: "Sitios web",
    ai_automation: "Automatización con IA",
    crm: "CRM",
    branding: "Imagen de marca",
    social_media: "Redes sociales",
    digital_marketing: "Marketing digital",
  },
};

function money(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

// ---------------- Reseller application ----------------

export interface ResellerApplicationEmailData {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  website: string;
  city: string;
  state: string;
  clientCount: string;
  servicesInterest: string[];
  resellModel: string;
  message: string;
  language: Lang;
}

export function internalResellerApplicationEmail(
  d: ResellerApplicationEmailData,
): EmailContent {
  const subject = `New VYNTEX Reseller Application — ${d.businessName}`;
  const services = d.servicesInterest
    .map((s) => RESELLER_SERVICE_LABELS.en[s] ?? s)
    .join(", ");

  const html = shell(
    "New reseller application",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row("Name", d.fullName)}
${row("Business", d.businessName)}
${row("Email", d.email)}
${row("Phone", d.phone)}
${row("Website", d.website)}
${row("Location", `${d.city}, ${d.state}`)}
${row("Current clients", CLIENT_COUNT_LABELS.en[d.clientCount] ?? d.clientCount)}
${row("Services of interest", services)}
${row("Resell model", RESELL_MODEL_LABELS.en[d.resellModel] ?? d.resellModel)}
${row("Language", d.language.toUpperCase())}
</table>
<div style="margin-top:16px;padding:14px;background:#F9FAFB;border-radius:8px;font-size:14px;line-height:1.6;color:#111827;">
  <strong>Application review required</strong>
  <p style="margin:8px 0 0;">
    Review the applicant’s information in the VYNTEX admin portal. If approved,
    send the partner agreement and activation instructions. Wholesale pricing
    should remain locked until all onboarding requirements are completed.
  </p>
</div>`,
    `New reseller application from ${d.businessName}`,
  );

  const text = `New VYNTEX reseller application
Name: ${d.fullName}
Business: ${d.businessName}
Email: ${d.email}
Phone: ${d.phone}
Website: ${d.website || "-"}
Location: ${d.city}, ${d.state}
Current clients: ${CLIENT_COUNT_LABELS.en[d.clientCount] ?? d.clientCount}
Services: ${services}
Resell model: ${RESELL_MODEL_LABELS.en[d.resellModel] ?? d.resellModel}
Language: ${d.language}

Message:

${d.message}

Next step:
Review the application in the VYNTEX admin portal. If approved, send the partner agreement and activation instructions. Wholesale pricing remains locked until all onboarding requirements are completed.`;

  return { subject, html, text };
}

export function resellerApplicationConfirmation(
  d: ResellerApplicationEmailData,
): EmailContent {
  const lang = d.language;
  const subject =
    lang === "es"
      ? "Recibimos tu solicitud de revendedor VYNTEX"
      : "We received your VYNTEX reseller application";
  const greeting = lang === "es" ? `Hola ${d.fullName},` : `Hi ${d.fullName},`;
  const intro =
    lang === "es"
      ? "Gracias por solicitar el Programa de Revendedor Autorizado de VYNTEX. Recibimos tu solicitud y la revisaremos manualmente."
      : "Thanks for applying to the VYNTEX Authorized Reseller Program. We received your application and will review it manually.";
  const stepsLabel = lang === "es" ? "Qué sigue" : "What happens next";
  const steps =
    lang === "es"
      ? [
          "Revisamos tu solicitud y te respondemos en un día hábil.",
          "Si eres aprobado, recibirás un correo con tu número de socio.",
          "Firmas el Acuerdo de Revendedor Autorizado en tu portal.",
          "Pagas la activación anual de $199.",
          "El acceso al precio mayorista confidencial se abre después de esos pasos.",
        ]
      : [
          "We review your application and reply within one business day.",
          "If you are approved, you will receive an email with your partner number.",
          "You sign the Authorized Reseller Agreement in your portal.",
          "You pay the $199 annual activation.",
          "Access to confidential wholesale pricing opens only after those steps.",
        ];
  const note =
    lang === "es"
      ? "Enviar una solicitud no otorga acceso ni descuentos. La aprobación es a discreción de VYNTEX."
      : "Submitting an application does not grant access or pricing. Approval is at VYNTEX's discretion.";

  const html = shell(
    lang === "es" ? "Solicitud recibida" : "Application received",
    `<p style="font-size:14px;color:#111827;margin:0 0 12px;">${esc(greeting)}</p>
<p style="font-size:14px;color:#374151;margin:0 0 18px;">${esc(intro)}</p>
<p style="font-size:12px;color:#6B7280;margin:0 0 8px;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;">${esc(stepsLabel)}</p>
<ol style="font-size:13px;color:#374151;margin:0 0 18px;padding-left:20px;">
${steps.map((s) => `<li style="margin-bottom:6px;">${esc(s)}</li>`).join("")}
</ol>
<p style="font-size:12px;color:#6B7280;margin:0 0 18px;font-style:italic;">${esc(note)}</p>
<p style="font-size:13px;color:#374151;margin:0;">${esc(SITE.phone)} · ${esc(SITE.email)}</p>`,
    intro,
  );

  const text = `${greeting}

${intro}

${stepsLabel}:
${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

${note}

${SITE.phone} · ${SITE.email}

— VYNTEX`;

  return { subject, html, text };
}

// ---------------- Application approved ----------------

export interface ResellerApprovedEmailData {
  fullName: string;
  businessName: string;
  partnerNumber: string;
  language: Lang;
  portalUrl: string;
}

export function resellerApprovedEmail(d: ResellerApprovedEmailData): EmailContent {
  const lang = d.language;
  const subject =
    lang === "es"
      ? `Aprobado — Programa de Revendedor VYNTEX (${d.partnerNumber})`
      : `Approved — VYNTEX Reseller Program (${d.partnerNumber})`;
  const greeting = lang === "es" ? `Hola ${d.fullName},` : `Hi ${d.fullName},`;
  const intro =
    lang === "es"
      ? `Tu solicitud para ${d.businessName} fue aprobada. Tu número de socio es ${d.partnerNumber}.`
      : `Your application for ${d.businessName} has been approved. Your partner number is ${d.partnerNumber}.`;
  const nextLabel = lang === "es" ? "Dos pasos para activarte" : "Two steps to activate";
  const steps =
    lang === "es"
      ? [
          "Inicia sesión en tu portal y firma el Acuerdo de Revendedor Autorizado.",
          "Paga la cuota de activación anual de $199.",
        ]
      : [
          "Sign in to your portal and sign the Authorized Reseller Agreement.",
          "Pay the $199 annual activation fee.",
        ];
  const closing =
    lang === "es"
      ? "El precio mayorista confidencial se desbloquea al confirmarse el pago."
      : "Confidential wholesale pricing unlocks once your payment is confirmed.";

  const html = shell(
    lang === "es" ? "Solicitud aprobada" : "Application approved",
    `<p style="font-size:14px;color:#111827;margin:0 0 12px;">${esc(greeting)}</p>
<p style="font-size:14px;color:#374151;margin:0 0 18px;">${esc(intro)}</p>
<p style="font-size:12px;color:#6B7280;margin:0 0 8px;font-weight:bold;text-transform:uppercase;letter-spacing:0.04em;">${esc(nextLabel)}</p>
<ol style="font-size:13px;color:#374151;margin:0 0 18px;padding-left:20px;">
${steps.map((s) => `<li style="margin-bottom:6px;">${esc(s)}</li>`).join("")}
</ol>
<p style="margin:0 0 18px;"><a href="${esc(d.portalUrl)}" style="display:inline-block;background:#0EA5E9;color:#050714;font-weight:bold;font-size:13px;text-decoration:none;padding:11px 20px;border-radius:8px;">${esc(lang === "es" ? "Abrir mi portal de socio" : "Open my partner portal")}</a></p>
<p style="font-size:13px;color:#374151;margin:0 0 6px;">${esc(closing)}</p>
<p style="font-size:13px;color:#374151;margin:0;">${esc(SITE.phone)} · ${esc(SITE.email)}</p>`,
    intro,
  );

  const text = `${greeting}

${intro}

${nextLabel}:
${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

${d.portalUrl}

${closing}

${SITE.phone} · ${SITE.email}

— VYNTEX`;

  return { subject, html, text };
}

// ---------------- Agreement signed ----------------

export interface AgreementSignedEmailData {
  partnerNumber: string;
  signedName: string;
  businessName: string;
  signerTitle: string;
  signedEmail: string;
  signedAt: string;
  agreementVersion: string;
  agreementHash: string;
  language: Lang;
}

export function internalAgreementSignedEmail(d: AgreementSignedEmailData): EmailContent {
  const subject = `Reseller Agreement Signed — ${d.businessName} (${d.partnerNumber})`;
  const html = shell(
    "Reseller agreement signed",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row("Partner number", d.partnerNumber)}
${row("Signed by", d.signedName)}
${row("Business", d.businessName)}
${row("Title", d.signerTitle)}
${row("Email", d.signedEmail)}
${row("Signed at", new Date(d.signedAt).toUTCString())}
${row("Agreement version", d.agreementVersion)}
${row("Agreement hash", d.agreementHash)}
</table>
<p style="font-size:13px;color:#374151;margin-top:16px;">The signed PDF is attached. The partner is not active until the $199 activation payment is confirmed by the Square webhook.</p>`,
    `${d.businessName} signed the reseller agreement`,
  );
  const text = `Reseller agreement signed
Partner number: ${d.partnerNumber}
Signed by: ${d.signedName}
Business: ${d.businessName}
Title: ${d.signerTitle}
Email: ${d.signedEmail}
Signed at: ${new Date(d.signedAt).toUTCString()}
Agreement version: ${d.agreementVersion}
Agreement hash: ${d.agreementHash}

Not active until the activation payment is confirmed.`;
  return { subject, html, text };
}

export function partnerAgreementSignedEmail(d: AgreementSignedEmailData): EmailContent {
  const lang = d.language;
  const subject =
    lang === "es"
      ? `Tu Acuerdo de Revendedor VYNTEX firmado (${d.partnerNumber})`
      : `Your signed VYNTEX Reseller Agreement (${d.partnerNumber})`;
  const greeting = lang === "es" ? `Hola ${d.signedName},` : `Hi ${d.signedName},`;
  const intro =
    lang === "es"
      ? "Adjuntamos tu copia del Acuerdo de Revendedor Autorizado firmado. Guárdala para tus registros."
      : "Attached is your copy of the signed Authorized Reseller Agreement. Please keep it for your records.";
  const nextStep =
    lang === "es"
      ? "Siguiente paso: paga la cuota de activación anual de $199 en tu portal. El precio mayorista confidencial se desbloquea al confirmarse el pago."
      : "Next step: pay the $199 annual activation fee in your portal. Confidential wholesale pricing unlocks once your payment is confirmed.";
  const disclaimer =
    lang === "es"
      ? "Esta es una plantilla comercial, no asesoría legal. Que la revise un abogado con licencia en su estado antes de usarla."
      : "This is a business template, not legal advice. Have it reviewed by a licensed attorney in your state before use.";

  const html = shell(
    lang === "es" ? "Acuerdo firmado" : "Agreement signed",
    `<p style="font-size:14px;color:#111827;margin:0 0 12px;">${esc(greeting)}</p>
<p style="font-size:14px;color:#374151;margin:0 0 18px;">${esc(intro)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row(lang === "es" ? "Número de socio" : "Partner number", d.partnerNumber)}
${row(lang === "es" ? "Negocio" : "Business", d.businessName)}
${row(lang === "es" ? "Firmado el" : "Signed at", new Date(d.signedAt).toUTCString())}
${row(lang === "es" ? "Versión" : "Version", d.agreementVersion)}
${row("SHA-256", d.agreementHash)}
</table>
<p style="font-size:13px;color:#374151;margin:18px 0;">${esc(nextStep)}</p>
<p style="font-size:12px;color:#6B7280;margin:0 0 12px;font-style:italic;">${esc(disclaimer)}</p>
<p style="font-size:13px;color:#374151;margin:0;">${esc(SITE.phone)} · ${esc(SITE.email)}</p>`,
    intro,
  );

  const text = `${greeting}

${intro}

${lang === "es" ? "Número de socio" : "Partner number"}: ${d.partnerNumber}
${lang === "es" ? "Negocio" : "Business"}: ${d.businessName}
${lang === "es" ? "Firmado el" : "Signed at"}: ${new Date(d.signedAt).toUTCString()}
${lang === "es" ? "Versión" : "Version"}: ${d.agreementVersion}
SHA-256: ${d.agreementHash}

${nextStep}

${disclaimer}

${SITE.phone} · ${SITE.email}

— VYNTEX`;

  return { subject, html, text };
}

// ---------------- Order paid ----------------

export interface OrderPaidItem {
  name: string;
  unitPriceCents: number;
  quantity: number;
  billingType: string;
}

export interface OrderPaidEmailData {
  orderId: string;
  orderType: string;
  customerName: string;
  customerEmail: string;
  partnerNumber: string | null;
  clientReference: string | null;
  totalCents: number;
  items: OrderPaidItem[];
  language: Lang;
}

const ORDER_TYPE_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    direct: "Service order",
    reseller_activation: "Reseller annual activation",
    reseller_renewal: "Reseller annual renewal",
    partner_wholesale: "Partner order",
  },
  es: {
    direct: "Pedido de servicio",
    reseller_activation: "Activación anual de revendedor",
    reseller_renewal: "Renovación anual de revendedor",
    partner_wholesale: "Pedido de socio",
  },
};

export function internalOrderPaidEmail(d: OrderPaidEmailData): EmailContent {
  const label = ORDER_TYPE_LABELS.en[d.orderType] ?? d.orderType;
  const subject = `Payment received — ${label} — ${money(d.totalCents)}`;

  const itemRows = d.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;font-size:13px;color:#111827;">${esc(i.name)} × ${i.quantity}</td>
<td style="padding:6px 0;font-size:13px;color:#111827;text-align:right;">${esc(money(i.unitPriceCents * i.quantity))}</td></tr>`,
    )
    .join("");

  const html = shell(
    "Payment received",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row("Order type", label)}
${row("Order ID", d.orderId)}
${row("Customer", d.customerName || "—")}
${row("Email", d.customerEmail)}
${d.partnerNumber ? row("Partner number", d.partnerNumber) : ""}
${d.clientReference ? row("Client reference", d.clientReference) : ""}
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px solid #E5E7EB;">
${itemRows}
<tr><td style="padding:10px 0 0;font-size:14px;font-weight:bold;color:#111827;border-top:1px solid #E5E7EB;">Total</td>
<td style="padding:10px 0 0;font-size:14px;font-weight:bold;color:#111827;text-align:right;border-top:1px solid #E5E7EB;">${esc(money(d.totalCents))}</td></tr>
</table>
<p style="font-size:12px;color:#6B7280;margin-top:16px;">Confirmed by verified Square webhook.</p>`,
    `Payment received — ${label}`,
  );

  const text = `Payment received
Order type: ${label}
Order ID: ${d.orderId}
Customer: ${d.customerName || "-"}
Email: ${d.customerEmail}
${d.partnerNumber ? `Partner number: ${d.partnerNumber}\n` : ""}${d.clientReference ? `Client reference: ${d.clientReference}\n` : ""}
${d.items.map((i) => `${i.name} x${i.quantity} — ${money(i.unitPriceCents * i.quantity)}`).join("\n")}

Total: ${money(d.totalCents)}

Confirmed by verified Square webhook.`;

  return { subject, html, text };
}

export function customerOrderPaidEmail(d: OrderPaidEmailData): EmailContent {
  const lang = d.language;
  const label = ORDER_TYPE_LABELS[lang][d.orderType] ?? d.orderType;
  const subject =
    lang === "es"
      ? `Pago confirmado — VYNTEX (${money(d.totalCents)})`
      : `Payment confirmed — VYNTEX (${money(d.totalCents)})`;
  const greeting =
    lang === "es"
      ? `Hola${d.customerName ? ` ${d.customerName}` : ""},`
      : `Hi${d.customerName ? ` ${d.customerName}` : ""},`;

  let intro: string;
  if (d.orderType === "reseller_activation") {
    intro =
      lang === "es"
        ? "Recibimos tu pago de activación. Tu estatus de Revendedor Autorizado está activo por 12 meses y el precio mayorista confidencial ya está disponible en tu portal."
        : "We received your activation payment. Your Authorized Reseller status is active for 12 months, and confidential wholesale pricing is now available in your portal.";
  } else if (d.orderType === "reseller_renewal") {
    intro =
      lang === "es"
        ? "Recibimos tu pago de renovación. Tu acceso de socio se extendió por 12 meses más."
        : "We received your renewal payment. Your partner access has been extended for another 12 months.";
  } else if (d.orderType === "partner_wholesale") {
    intro =
      lang === "es"
        ? "Recibimos tu pedido y tu pago. Nos pondremos en contacto contigo en un día hábil para comenzar el trabajo."
        : "We received your order and your payment. We'll be in touch within one business day to begin the work.";
  } else {
    intro =
      lang === "es"
        ? "Recibimos tu pago. Nos pondremos en contacto contigo en un día hábil para comenzar."
        : "We received your payment. We'll be in touch within one business day to get started.";
  }

  const laborNote =
    lang === "es"
      ? "Los precios cubren solo nuestra mano de obra. Hosting, dominios, licencias de software o CRM, envío de SMS y pauta publicitaria se cobran por separado por el proveedor."
      : "Prices cover our labor only. Hosting, domains, software or CRM licenses, SMS sending, and ad spend are billed separately by the provider.";

  const itemRows = d.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;font-size:13px;color:#111827;">${esc(i.name)} × ${i.quantity}</td>
<td style="padding:6px 0;font-size:13px;color:#111827;text-align:right;">${esc(money(i.unitPriceCents * i.quantity))}</td></tr>`,
    )
    .join("");

  const html = shell(
    lang === "es" ? "Pago confirmado" : "Payment confirmed",
    `<p style="font-size:14px;color:#111827;margin:0 0 12px;">${esc(greeting)}</p>
<p style="font-size:14px;color:#374151;margin:0 0 18px;">${esc(intro)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row(lang === "es" ? "Tipo de pedido" : "Order type", label)}
${row(lang === "es" ? "Número de pedido" : "Order number", d.orderId)}
${d.partnerNumber ? row(lang === "es" ? "Número de socio" : "Partner number", d.partnerNumber) : ""}
${d.clientReference ? row(lang === "es" ? "Referencia" : "Reference", d.clientReference) : ""}
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px solid #E5E7EB;">
${itemRows}
<tr><td style="padding:10px 0 0;font-size:14px;font-weight:bold;color:#111827;border-top:1px solid #E5E7EB;">Total</td>
<td style="padding:10px 0 0;font-size:14px;font-weight:bold;color:#111827;text-align:right;border-top:1px solid #E5E7EB;">${esc(money(d.totalCents))}</td></tr>
</table>
<p style="font-size:12px;color:#6B7280;margin-top:16px;">${esc(laborNote)}</p>
<p style="font-size:13px;color:#374151;margin:14px 0 0;">${esc(SITE.phone)} · ${esc(SITE.email)}</p>`,
    intro,
  );

  const text = `${greeting}

${intro}

${lang === "es" ? "Tipo de pedido" : "Order type"}: ${label}
${lang === "es" ? "Número de pedido" : "Order number"}: ${d.orderId}

${d.items.map((i) => `${i.name} x${i.quantity} — ${money(i.unitPriceCents * i.quantity)}`).join("\n")}

Total: ${money(d.totalCents)}

${laborNote}

${SITE.phone} · ${SITE.email}

— VYNTEX`;

  return { subject, html, text };
}

// ---------------- Phase 5 — partner term lifecycle ----------------

export interface PartnerExpiringEmailData {
  contactName: string;
  partnerNumber: string;
  expiresAt: string;
  portalUrl: string;
  language: Lang;
}

export function partnerExpiringEmail(d: PartnerExpiringEmailData): EmailContent {
  const lang = d.language;
  const date = new Date(d.expiresAt).toLocaleDateString(
    lang === "es" ? "es-US" : "en-US",
    { year: "numeric", month: "long", day: "numeric" },
  );

  const subject =
    lang === "es"
      ? `Tu acceso de socio VYNTEX vence el ${date}`
      : `Your VYNTEX partner access expires ${date}`;
  const greeting = lang === "es" ? `Hola ${d.contactName},` : `Hi ${d.contactName},`;
  const intro =
    lang === "es"
      ? `Tu estatus de Revendedor Autorizado (${d.partnerNumber}) vence el ${date}. Renueva tu activación anual para mantener el acceso a la librería mayorista confidencial.`
      : `Your Authorized Reseller status (${d.partnerNumber}) expires on ${date}. Renew your annual activation to keep access to the confidential wholesale library.`;
  const note =
    lang === "es"
      ? "Si el acceso vence, el precio mayorista se bloquea hasta que renueves. Tus pedidos y tu acuerdo firmado permanecen disponibles."
      : "If your access lapses, wholesale pricing locks until you renew. Your orders and signed agreement remain available.";

  const html = shell(
    lang === "es" ? "Renovación próxima" : "Renewal coming up",
    `<p style="font-size:14px;color:#111827;margin:0 0 12px;">${esc(greeting)}</p>
<p style="font-size:14px;color:#374151;margin:0 0 18px;">${esc(intro)}</p>
<p style="margin:0 0 18px;"><a href="${esc(d.portalUrl)}" style="display:inline-block;background:#0EA5E9;color:#050714;font-weight:bold;font-size:13px;text-decoration:none;padding:11px 20px;border-radius:8px;">${esc(lang === "es" ? "Renovar acceso" : "Renew access")}</a></p>
<p style="font-size:12px;color:#6B7280;margin:0 0 18px;">${esc(note)}</p>
<p style="font-size:13px;color:#374151;margin:0;">${esc(SITE.phone)} · ${esc(SITE.email)}</p>`,
    intro,
  );

  const text = `${greeting}

${intro}

${d.portalUrl}

${note}

${SITE.phone} · ${SITE.email}

— VYNTEX`;

  return { subject, html, text };
}

export interface PartnerExpiredEmailData {
  contactName: string;
  partnerNumber: string;
  portalUrl: string;
  language: Lang;
}

export function partnerExpiredEmail(d: PartnerExpiredEmailData): EmailContent {
  const lang = d.language;
  const subject =
    lang === "es"
      ? `Tu acceso de socio VYNTEX ha vencido (${d.partnerNumber})`
      : `Your VYNTEX partner access has expired (${d.partnerNumber})`;
  const greeting = lang === "es" ? `Hola ${d.contactName},` : `Hi ${d.contactName},`;
  const intro =
    lang === "es"
      ? "Tu periodo anual terminó y el acceso al precio mayorista confidencial está bloqueado. Puedes restaurarlo en cualquier momento renovando tu activación anual."
      : "Your annual term has ended and access to confidential wholesale pricing is now locked. You can restore it at any time by renewing your annual activation.";
  const note =
    lang === "es"
      ? "Tu acuerdo firmado y tu historial de pedidos siguen disponibles en tu portal. Las obligaciones de confidencialidad continúan vigentes."
      : "Your signed agreement and order history remain available in your portal. Confidentiality obligations remain in force.";

  const html = shell(
    lang === "es" ? "Acceso vencido" : "Access expired",
    `<p style="font-size:14px;color:#111827;margin:0 0 12px;">${esc(greeting)}</p>
<p style="font-size:14px;color:#374151;margin:0 0 18px;">${esc(intro)}</p>
<p style="margin:0 0 18px;"><a href="${esc(d.portalUrl)}" style="display:inline-block;background:#0EA5E9;color:#050714;font-weight:bold;font-size:13px;text-decoration:none;padding:11px 20px;border-radius:8px;">${esc(lang === "es" ? "Renovar acceso" : "Renew access")}</a></p>
<p style="font-size:12px;color:#6B7280;margin:0 0 18px;">${esc(note)}</p>
<p style="font-size:13px;color:#374151;margin:0;">${esc(SITE.phone)} · ${esc(SITE.email)}</p>`,
    intro,
  );

  const text = `${greeting}

${intro}

${d.portalUrl}

${note}

${SITE.phone} · ${SITE.email}

— VYNTEX`;

  return { subject, html, text };
}
