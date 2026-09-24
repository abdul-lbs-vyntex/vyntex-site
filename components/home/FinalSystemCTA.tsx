"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Network } from "lucide-react";
import Container from "@/components/ui/Container";
import ScrollReveal from "@/components/home/ScrollReveal";
import Button from "@/components/ui/Button";
import { openConsultation } from "@/components/BookConsultation";
import { useLang } from "@/context/LanguageContext";

const copy = {
  en: { title: "Ready to Simplify Your Business?", body: "Stop managing disconnected tools. Let VYNTEX build a connected business system around your company.", button: "Book a Free Consultation" },
  es: { title: "¿Listo para Simplificar su Negocio?", body: "Deje de administrar herramientas desconectadas. Permita que VYNTEX cree un sistema empresarial conectado alrededor de su compañía.", button: "Agenda tu Consulta Gratis" },
} as const;

export default function FinalSystemCTA() {
  const { lang } = useLang();
  const c = copy[lang];
  const reduceMotion = useReducedMotion();
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="final-system-cta">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1100 320" aria-hidden><motion.path d="M0 85 C260 85 300 160 550 160 C800 160 840 85 1100 85 M0 245 C260 245 300 160 550 160 C800 160 840 245 1100 245" fill="none" stroke="#22d3ee" strokeOpacity="0.2" strokeWidth="2" initial={reduceMotion ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.2 }} viewport={{ once: true }} /></svg>
          <ScrollReveal className="relative z-10 mx-auto max-w-2xl text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-vx-blue/30 bg-vx-blue/10 text-vx-cyan"><Network size={23} aria-hidden /></span>
            <h2 className="mt-5 text-3xl font-bold tracking-[-0.045em] sm:text-5xl">{c.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-vx-muted">{c.body}</p>
            <div className="mt-7"><Button onClick={openConsultation} size="lg">{c.button}<ArrowRight size={18} aria-hidden /></Button></div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
