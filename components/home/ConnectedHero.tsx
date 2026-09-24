"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Globe2,
  LayoutDashboard,
  MessageSquareText,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { openConsultation } from "@/components/BookConsultation";
import { useLang } from "@/context/LanguageContext";
import { motionTokens } from "@/components/home/motion";
import { useAdaptiveMotion } from "@/hooks/useAdaptiveMotion";

const copy = {
  en: {
    eyebrow: "CONNECTED BUSINESS SYSTEMS",
    title: "One Connected System for Your Entire Business",
    body: "VYNTEX connects your CRM, customer communication, scheduling, payments, automation, website, marketing, and reporting into one organized business system.",
    primary: "Book a Free Consultation",
    secondary: "View Services",
    labels: ["CRM", "Communication", "Scheduling", "Payments", "Automation", "Reporting"],
    dashboard: "Connected Operations",
    status: "Workflow active",
    lead: "New website inquiry",
    customer: "Customer record created",
    appointment: "Appointment confirmed",
    payment: "Payment recorded",
    outcomes: ["Fewer disconnected tools", "Less manual follow-up", "One complete customer history"],
  },
  es: {
    eyebrow: "SISTEMAS EMPRESARIALES CONECTADOS",
    title: "Un Sistema Conectado para Todo su Negocio",
    body: "VYNTEX conecta su CRM, comunicación con clientes, citas, pagos, automatización, sitio web, marketing y reportes en un sistema empresarial organizado.",
    primary: "Agenda tu Consulta Gratis",
    secondary: "Ver Servicios",
    labels: ["CRM", "Comunicación", "Citas", "Pagos", "Automatización", "Reportes"],
    dashboard: "Operaciones Conectadas",
    status: "Flujo activo",
    lead: "Nueva consulta web",
    customer: "Registro de cliente creado",
    appointment: "Cita confirmada",
    payment: "Pago registrado",
    outcomes: ["Menos herramientas desconectadas", "Menos seguimiento manual", "Un historial completo del cliente"],
  },
} as const;

const labelIcons = [Users, MessageSquareText, CalendarDays, CreditCard, Workflow, BarChart3] as const;

export default function ConnectedHero() {
  const { lang } = useLang();
  const c = copy[lang];
  const { prefersReducedMotion: reduceMotion, disableAmbientMotion } = useAdaptiveMotion();
  const visualRef = useRef<HTMLDivElement>(null);
  const inView = useInView(visualRef, { once: true, amount: 0.18 });

  return (
    <section id="home" className="vx-hero relative overflow-hidden pb-20 pt-[118px] sm:pb-24 sm:pt-[138px]">
      <div className="vx-hero-lightfield" aria-hidden="true">
        <span className="vx-lightstream vx-lightstream-a" />
        <span className="vx-lightstream vx-lightstream-b" />
        <span className="vx-lightstream vx-lightstream-c" />
      </div>

      <Container>
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: motionTokens.ease }}
            className="font-mono text-xs uppercase tracking-[0.24em] text-vx-cyan"
          >
            {c.eyebrow}
          </motion.p>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.75, delay: reduceMotion ? 0 : 0.06, ease: motionTokens.ease }}
            className="mx-auto mt-5 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.06em] sm:text-6xl lg:text-[4.9rem]"
          >
            {c.title}
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.18, ease: motionTokens.ease }}
            className="mx-auto mt-6 max-w-3xl text-base leading-7 text-vx-muted sm:text-lg sm:leading-8"
          >
            {c.body}
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.25, ease: motionTokens.ease }}
            className="mt-6 flex flex-wrap justify-center gap-2"
            aria-label={lang === "es" ? "Resultados principales" : "Primary outcomes"}
          >
            {c.outcomes.map((outcome, index) => (
              <motion.span
                key={outcome}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.28 + index * 0.07, duration: 0.35 }}
                className="vx-outcome-chip"
              >
                <CheckCircle2 size={13} aria-hidden="true" />
                {outcome}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.34, ease: motionTokens.ease }}
            className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"
          >
            <Button onClick={openConsultation} size="lg">
              {c.primary}<ArrowRight size={18} aria-hidden="true" />
            </Button>
            <Button href="/services" variant="secondary" size="lg">{c.secondary}</Button>
          </motion.div>
        </div>

        <motion.div
          ref={visualRef}
          initial={reduceMotion ? false : { opacity: 0, y: 50, scale: 0.965 }}
          animate={inView || reduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.965 }}
          transition={{ duration: 0.9, delay: reduceMotion ? 0 : 0.18, ease: motionTokens.ease }}
          className="vx-dashboard-wrap relative mx-auto mt-14 max-w-6xl"
        >
          <div className="vx-dashboard-beam vx-dashboard-beam-left" aria-hidden="true" />
          <div className="vx-dashboard-beam vx-dashboard-beam-right" aria-hidden="true" />

          <div className="vx-capability-row" aria-label={lang === "es" ? "Capacidades conectadas" : "Connected capabilities"}>
            {c.labels.map((label, index) => {
              const Icon = labelIcons[index]!;
              return (
                <motion.div
                  key={label}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  transition={{ duration: 0.38, delay: reduceMotion ? 0 : 0.42 + index * 0.07 }}
                  className="vx-capability-pill"
                >
                  <Icon size={15} aria-hidden="true" />
                  <span>{label}</span>
                </motion.div>
              );
            })}
          </div>

          <div className="vx-dashboard-shell">
            <div className="vx-dashboard-topbar">
              <div className="flex items-center gap-3">
                <span className="vx-dashboard-logo"><LayoutDashboard size={18} aria-hidden="true" /></span>
                <div>
                  <strong>{c.dashboard}</strong>
                  <small>{c.status}</small>
                </div>
              </div>
              <span className="vx-live-indicator"><i />LIVE</span>
            </div>

            <div className="vx-dashboard-grid">
              <aside className="vx-dashboard-sidebar" aria-hidden="true">
                {[LayoutDashboard, Users, CalendarDays, CreditCard, BarChart3].map((Icon, index) => (
                  <motion.span
                    key={index}
                    className={index === 0 ? "active" : ""}
                    animate={disableAmbientMotion ? undefined : index === 0 ? { boxShadow: ["0 0 0 rgba(34,211,238,0)", "0 0 24px rgba(34,211,238,.2)", "0 0 0 rgba(34,211,238,0)"] } : undefined}
                    transition={{ duration: 4, repeat: Infinity }}
                  ><Icon size={17} /></motion.span>
                ))}
              </aside>

              <div className="vx-dashboard-main">
                <div className="vx-metric-row">
                  {[c.lead, c.customer, c.appointment, c.payment].map((label, index) => (
                    <motion.div
                      key={label}
                      className="vx-metric-card"
                      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                      animate={inView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                      transition={{ duration: 0.42, delay: reduceMotion ? 0 : 0.65 + index * 0.11 }}
                    >
                      <span>{index === 0 ? <Globe2 size={15} /> : index === 1 ? <Users size={15} /> : index === 2 ? <CalendarDays size={15} /> : <CreditCard size={15} />}</span>
                      <small>{label}</small>
                      <CheckCircle2 size={14} className="text-vx-cyan" />
                    </motion.div>
                  ))}
                </div>

                <div className="vx-dashboard-content">
                  <div className="vx-flow-panel">
                    <div className="vx-panel-heading"><span>{lang === "es" ? "Flujo del cliente" : "Customer workflow"}</span><Workflow size={17} /></div>
                    <div className="vx-flow-track" aria-hidden="true">
                      {[Globe2, Users, BellRing, CalendarDays, FileText, CreditCard].map((Icon, index) => (
                        <div key={index} className="vx-flow-node-wrap">
                          <motion.span
                            className="vx-flow-node"
                            animate={disableAmbientMotion ? undefined : { borderColor: ["rgba(14,165,233,.18)", "rgba(34,211,238,.75)", "rgba(14,165,233,.18)"], boxShadow: ["0 0 0 rgba(34,211,238,0)", "0 0 22px rgba(34,211,238,.23)", "0 0 0 rgba(34,211,238,0)"] }}
                            transition={{ duration: 3.6, repeat: Infinity, delay: index * 0.42 }}
                          ><Icon size={17} /></motion.span>
                          {index < 5 ? <span className="vx-flow-line"><motion.i animate={disableAmbientMotion ? undefined : { x: ["-120%", "180%"] }} transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.35, ease: "linear" }} /></span> : null}
                        </div>
                      ))}
                    </div>
                    <div className="vx-activity-list">
                      {[c.lead, c.customer, c.appointment].map((item, index) => (
                        <motion.div key={item} initial={reduceMotion ? false : { opacity: 0, x: -10 }} animate={inView || reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }} transition={{ delay: reduceMotion ? 0 : 1.05 + index * 0.14 }}>
                          <span className="vx-activity-dot" /><span>{item}</span><small>{index === 0 ? "Now" : index === 1 ? "+1s" : "+2s"}</small>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="vx-insight-panel">
                    <div className="vx-panel-heading"><span>{lang === "es" ? "Visibilidad operativa" : "Operational visibility"}</span><TrendingUp size={17} /></div>
                    <svg viewBox="0 0 320 170" className="vx-chart" aria-hidden="true">
                      <defs>
                        <linearGradient id="vx-chart-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="#22d3ee" stopOpacity=".28" />
                          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M8 132 C44 126 46 88 83 102 S133 135 159 82 S214 96 239 52 S282 76 312 25 L312 165 L8 165 Z" fill="url(#vx-chart-fill)" />
                      <motion.path d="M8 132 C44 126 46 88 83 102 S133 135 159 82 S214 96 239 52 S282 76 312 25" fill="none" stroke="#22d3ee" strokeWidth="3" initial={reduceMotion ? false : { pathLength: 0 }} animate={inView || reduceMotion ? { pathLength: 1 } : { pathLength: 0 }} transition={{ duration: 1.4, delay: reduceMotion ? 0 : 1.05, ease: motionTokens.ease }} />
                    </svg>
                    <div className="vx-insight-tags"><span>CRM</span><span>{lang === "es" ? "Citas" : "Appointments"}</span><span>{lang === "es" ? "Pagos" : "Payments"}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
