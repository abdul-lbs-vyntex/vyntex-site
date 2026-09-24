"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { SITE, CONTACT_HREFS, LEGAL_LINKS } from "@/lib/site";
import Container from "@/components/ui/Container";
import LanguageToggle from "@/components/ui/LanguageToggle";
import Button from "@/components/ui/Button";
import { openConsultation } from "@/components/BookConsultation";

export default function Footer({ showCta = true }: { showCta?: boolean }) {
  const { t, lang } = useLang();
  const year = new Date().getFullYear();

  const words = lang === "es" ? {
    services: "Servicios",
    company: "Empresa",
    contact: "Contacto",
    ctaTitle: "¿Listo para simplificar su negocio?",
    ctaBody: "Comience con una consulta clara y sin presión.",
    cta: "Reservar Consulta",
  } : {
    services: "Services",
    company: "Company",
    contact: "Contact",
    ctaTitle: "Ready to simplify your business?",
    ctaBody: "Start with a clear, no-pressure consultation.",
    cta: "Book Consultation",
  };

  return (
    <footer className="border-t border-vx-line bg-vx-bg2/70">
      <Container className="py-12 sm:py-14">
        {showCta ? (
          <div className="mb-10 flex flex-col gap-5 rounded-2xl border border-vx-blue/25 bg-vx-blue/[0.06] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="text-2xl font-bold">{words.ctaTitle}</h2>
              <p className="mt-2 text-sm text-vx-muted">{words.ctaBody}</p>
            </div>
            <Button onClick={openConsultation}>{words.cta}<ArrowRight size={17}/></Button>
          </div>
        ) : null}

        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5" aria-label={SITE.name}>
              <Image src="/vyntex-mark.png" alt="" width={52} height={45} className="h-11 w-auto" />
              <span className="text-xl font-bold tracking-tight vx-grad-text">VYNTEX</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-vx-muted">{t.footer.tagline}</p>
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-vx-silver"><MapPin size={15}/>{SITE.address.locality}, {SITE.address.region} {SITE.address.postalCode}</p>
            <div className="mt-4"><LanguageToggle /></div>
          </div>

          <nav aria-label={words.services}>
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-vx-blue">{words.services}</h2>
            <ul className="mt-4 space-y-2 text-sm text-vx-muted">
              <li><Link href="/services/crm-systems" className="hover:text-vx-ink">CRM Systems</Link></li>
              <li><Link href="/services/ai-automation" className="hover:text-vx-ink">Automation & AI</Link></li>
              <li><Link href="/services/web-development" className="hover:text-vx-ink">Web Development</Link></li>
              <li><Link href="/services/digital-marketing" className="hover:text-vx-ink">Marketing</Link></li>
            </ul>
          </nav>

          <nav aria-label={words.company}>
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-vx-blue">{words.company}</h2>
            <ul className="mt-4 space-y-2 text-sm text-vx-muted">
              <li><Link href="/industries" className="hover:text-vx-ink">Industries</Link></li>
              <li><Link href="/partners" className="hover:text-vx-ink">Partners</Link></li>
              <li><Link href="/about" className="hover:text-vx-ink">About</Link></li>
              <li><Link href="/contact" className="hover:text-vx-ink">Contact</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-vx-blue">{words.contact}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href={CONTACT_HREFS.email} className="inline-flex items-center gap-2 text-vx-silver hover:text-vx-ink"><Mail size={15}/>{SITE.email}</a></li>
              <li><a href={CONTACT_HREFS.phone} className="inline-flex items-center gap-2 text-vx-silver hover:text-vx-ink"><Phone size={15}/>{SITE.phone}</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-vx-line pt-6">
          <p className="max-w-3xl text-xs leading-relaxed text-vx-muted">{t.footer.laborNote}</p>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-vx-muted">© {year} {SITE.name}. {t.footer.rights}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-vx-muted">{LEGAL_LINKS.map((l)=><li key={l.key}><Link href={l.href} className="hover:text-vx-ink">{t.footer.legal[l.key]}</Link></li>)}</ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
