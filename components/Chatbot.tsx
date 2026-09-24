"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, X, ArrowLeft, Send, Bot } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { RESELLER_PROGRAM } from "@/lib/reseller-program";
import { SITE, SECTION_IDS } from "@/lib/site";
import { openConsultation } from "@/components/BookConsultation";

/**
 * VYNTEX Assistant.
 *
 * HONEST BY DESIGN. This is a deterministic assistant that answers from the
 * site's own published data (lib/site.ts, lib/translations.ts).
 * It is NOT a large language model, and it does not pretend to be one — the
 * disclosure at the top of the panel says exactly that.
 *
 * Why not wire an LLM in? Because an LLM that hallucinates a price, a timeline,
 * or a guarantee would be a liability. Service prices are NOT published on the
 * website — they are quoted after a consultation — so this assistant never
 * states one. It does not import the price book at all. For anything outside
 * its scope it hands the visitor to a human rather than guessing.
 */

type TopicKey =
  | "pricing"
  | "services"
  | "timeline"
  | "included"
  | "thirdParty"
  | "reseller"
  | "support"
  | "languages"
  | "contact";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  /** Rendered as a bulleted list under the message. */
  lines?: string[];
}

const TOPICS: TopicKey[] = [
  "pricing",
  "services",
  "timeline",
  "included",
  "thirdParty",
  "reseller",
  "support",
  "languages",
  "contact",
];

export default function Chatbot() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const counter = useRef(0);

  const c = t.chat;

  // ESC closes, and focus returns to the trigger — never stranded.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Keep the newest message in view.
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, typing]);

  /** Builds an answer. States no service prices — those are quoted after a consultation. */
  const answer = useCallback(
    (topic: TopicKey): { text: string; lines?: string[] } => {
      const es = lang === "es";
      switch (topic) {
        case "pricing":
          return {
            text: es
              ? "Cada negocio es diferente, así que cotizamos cada proyecto después de una consulta gratuita. Así funciona:"
              : "Every business is different, so we quote each project after a free consultation. Here is how it works:",
            lines: [
              es
                ? "Hablamos de tus objetivos, tus herramientas actuales y tu presupuesto"
                : "We talk through your goals, your current tools, and your budget",
              es
                ? "Recibes una propuesta por escrito con el alcance y el costo exacto antes de empezar"
                : "You get a written proposal with the exact scope and cost before anything starts",
              es
                ? "Las tarifas de plataformas de terceros se facturan por separado"
                : "Third-party platform fees are billed separately",
            ],
          };

        case "services":
          return {
            text: es ? "Esto es lo que construimos:" : "This is what we build:",
            lines: [
              es ? "Sitios web (básico, estándar, a medida)" : "Websites (basic, standard, custom)",
              es ? "Automatización con IA y chatbots" : "AI automation and chatbots",
              es ? "Sistemas CRM y embudos de venta" : "CRM systems and sales pipelines",
              es ? "Imagen de marca e identidad" : "Branding and identity",
              es ? "Redes sociales y marketing digital" : "Social media and digital marketing",
            ],
          };

        case "timeline":
          return {
            text: es
              ? "No publicamos plazos garantizados porque dependen del alcance y de qué tan rápido recibamos tu contenido. Lo que sí hacemos: te damos un plazo concreto por escrito antes de empezar, y respondemos en un día hábil. Agenda una consulta y te damos el plazo real de tu proyecto."
              : "We don't publish guaranteed timelines, because they depend on scope and how quickly we get your content. What we do commit to: a concrete written timeline before we start, and a reply within one business day. Book a consultation and we'll give you the real timeline for your project.",
          };

        case "included":
          return {
            text: es ? "Cada proyecto incluye:" : "Every project includes:",
            lines: [
              es
                ? "Una propuesta por escrito con el alcance antes de empezar"
                : "A written proposal with the scope before we start",
              es ? "Construcción y entrega técnica por VYNTEX" : "Build and technical delivery by VYNTEX",
              es ? "Servicio en inglés y español" : "Service in English and Spanish",
            ],
          };

        case "thirdParty":
          return {
            text: es
              ? "Nuestras cotizaciones cubren nuestro trabajo. NO incluyen:"
              : "Our quotes cover our work. They do NOT include:",
            lines: [
              es ? "Hosting y dominios" : "Hosting and domains",
              es ? "Licencias de software o CRM" : "Software or CRM licenses",
              es ? "Envío de correos y SMS" : "Email and SMS sending",
              es ? "Pauta publicitaria" : "Advertising spend",
              es ? "Plugins premium e imágenes de stock" : "Premium plugins and stock assets",
              es
                ? "Esos los cobra el proveedor directamente a ti. Te decimos el costo antes de empezar."
                : "Those are billed by the provider, directly to you. We tell you the cost before we start.",
            ],
          };

        case "reseller":
          return {
            text: es
              ? "El Programa de Revendedor Autorizado te permite ofrecer los servicios de VYNTEX a tus propios clientes:"
              : "The Authorized Reseller Program lets you offer VYNTEX services to your own clients:",
            lines: [
              es
                ? `Activación anual de ${RESELLER_PROGRAM.activationFee}`
                : `${RESELLER_PROGRAM.activationFee} annual activation`,
              es
                ? `Mínimo de ${RESELLER_PROGRAM.minimumResalesPerYear} reventas por periodo de 12 meses`
                : `Minimum of ${RESELLER_PROGRAM.minimumResalesPerYear} resales per 12-month period`,
              es
                ? "Se requiere aprobación y firmar el acuerdo"
                : "Approval and a signed agreement are required",
              es
                ? "El precio mayorista es confidencial y se abre tras la activación"
                : "Wholesale pricing is confidential and opens after activation",
              es
                ? "VYNTEX maneja la entrega técnica; tú manejas al cliente"
                : "VYNTEX handles technical delivery; you handle the client",
            ],
          };

        case "support":
          return {
            text: es
              ? "Tu propuesta por escrito indica el soporte incluido y cómo se manejan los cambios después de la entrega. Si tienes una pregunta sobre un proyecto activo, agenda una consulta o escríbenos."
              : "Your written proposal spells out the support included and how changes are handled after delivery. If you have a question about an active project, book a consultation or message us.",
          };

        case "languages":
          return {
            text: es
              ? `Sí. Todo lo que hacemos está disponible en inglés y español — la conversación, tu sitio, tus automatizaciones y tu soporte. Llámanos o escríbenos por WhatsApp al ${SITE.phone}.`
              : `Yes. Everything we do is available in English and Spanish — the conversation, your site, your automations, and your support. Call or WhatsApp us at ${SITE.phone}.`,
          };

        case "contact":
          return {
            text: es
              ? `Con gusto. Escríbenos a ${SITE.email}, llámanos o escríbenos por WhatsApp al ${SITE.phone}, o agenda una consulta gratuita abajo. Respondemos en un día hábil.`
              : `Happy to. Email ${SITE.email}, call or WhatsApp ${SITE.phone}, or book a free consultation below. We reply within one business day.`,
          };
      }
    },
    [lang],
  );

  const ask = (topic: TopicKey) => {
    const label = c.topics[topic];
    counter.current += 1;
    const userMsg: Message = { id: counter.current, from: "user", text: label };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    // A short, honest "typing" beat. Not fake latency for drama — just enough
    // that the answer doesn't teleport in and get missed by a screen reader.
    window.setTimeout(() => {
      const reply = answer(topic);
      counter.current += 1;
      setMessages((prev) => [
        ...prev,
        { id: counter.current, from: "bot", text: reply.text, lines: reply.lines },
      ]);
      setTyping(false);
    }, 450);
  };

  const reset = () => setMessages([]);

  return (
    <>
      {/* Launcher */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="vx-chat-panel"
        aria-label={open ? c.close : c.open}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-vx-blue to-vx-cyan text-vx-bg shadow-vx-glow transition-transform motion-safe:hover:scale-105 lg:bottom-8 lg:right-8"
      >
        {open ? <X size={22} aria-hidden /> : <MessageSquare size={22} aria-hidden />}
      </button>

      {/* Panel */}
      {open ? (
        <div
          id="vx-chat-panel"
          ref={panelRef}
          role="dialog"
          aria-label={c.title}
          className="fixed bottom-24 right-4 z-40 flex max-h-[min(560px,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-[rgba(14,165,233,0.25)] bg-vx-bg2 shadow-vx-glow motion-safe:animate-[fadeUp_180ms_ease-out] lg:bottom-28 lg:right-8"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[rgba(14,165,233,0.14)] bg-vx-bg3 px-4 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-vx-blue/30 bg-vx-bg text-vx-blue">
              <Bot size={17} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-vx-ink">{c.title}</p>
              <p className="truncate text-xs text-vx-muted">{c.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label={c.close}
              className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg text-vx-muted transition-colors hover:text-vx-ink"
            >
              <X size={16} aria-hidden />
            </button>
          </div>

          {/* Log */}
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            className="flex-1 overflow-y-auto px-4 py-4"
          >
            {/* Honest disclosure — shown before the first exchange, always. */}
            <p className="rounded-xl border border-[rgba(14,165,233,0.16)] bg-vx-bg px-3 py-2.5 text-xs leading-relaxed text-vx-silver-dim">
              {c.disclosure}
            </p>

            {messages.length === 0 ? (
              <p className="mt-4 text-sm text-vx-muted">{c.startPrompt}</p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {messages.map((m) =>
                  m.from === "user" ? (
                    <div key={m.id} className="flex justify-end">
                      <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-r from-vx-blue to-vx-cyan px-3.5 py-2 text-sm font-medium text-vx-bg">
                        {m.text}
                      </p>
                    </div>
                  ) : (
                    <div key={m.id} className="flex justify-start">
                      <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-[rgba(14,165,233,0.14)] bg-vx-bg px-3.5 py-2.5">
                        <p className="text-sm leading-relaxed text-vx-silver">
                          {m.text}
                        </p>
                        {m.lines ? (
                          <ul className="mt-2 flex flex-col gap-1.5">
                            {m.lines.map((line) => (
                              <li
                                key={line}
                                className="flex gap-2 text-sm text-vx-muted"
                              >
                                <span
                                  aria-hidden
                                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-vx-cyan"
                                />
                                {line}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  ),
                )}

                {typing ? (
                  <div className="flex justify-start">
                    <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-[rgba(14,165,233,0.14)] bg-vx-bg px-3.5 py-3">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-vx-blue motion-safe:animate-pulse"
                          style={{ animationDelay: `${i * 140}ms` }}
                        />
                      ))}
                      <span className="sr-only">…</span>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Topics / actions */}
          <div className="border-t border-[rgba(14,165,233,0.14)] bg-vx-bg3 px-4 py-3">
            {messages.length > 0 ? (
              <button
                type="button"
                onClick={reset}
                className="mb-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-vx-blue hover:text-vx-cyan"
              >
                <ArrowLeft size={13} aria-hidden />
                {c.backToTopics}
              </button>
            ) : null}

            <div className="flex flex-wrap gap-1.5">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => ask(topic)}
                  className="rounded-lg border border-[rgba(14,165,233,0.22)] bg-vx-bg px-2.5 py-1.5 text-xs text-vx-silver transition-colors hover:border-vx-blue hover:text-vx-blue"
                >
                  {c.topics[topic]}
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openConsultation();
                }}
                className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-vx-blue to-vx-cyan px-3 py-2 text-xs font-semibold text-vx-bg"
              >
                <Send size={13} aria-hidden />
                {c.bookCta}
              </button>
              <a
                href={`/#${SECTION_IDS.contact}`}
                onClick={() => setOpen(false)}
                className="inline-flex min-h-[40px] flex-1 items-center justify-center rounded-lg border border-[rgba(14,165,233,0.25)] px-3 py-2 text-xs font-medium text-vx-silver hover:border-vx-blue hover:text-vx-blue"
              >
                {c.humanCta}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
