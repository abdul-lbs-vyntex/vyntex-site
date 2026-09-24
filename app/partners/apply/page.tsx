import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { SITE, SECTION_IDS } from "@/lib/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import GlowCard from "@/components/ui/GlowCard";
import ResellerApplicationForm from "@/components/reseller/ResellerApplicationForm";
import ProgramTerms from "@/components/reseller/ProgramTerms";

export const metadata: Metadata = {
  title: "Authorized Reseller Program — Apply",
  description:
    "Apply to the VYNTEX Authorized Reseller Program. Approved partners offer websites, AI automation, CRM systems, branding, and social media to their own clients while VYNTEX handles technical delivery. Bilingual English and Spanish. Northfield, NJ.",
  alternates: { canonical: "/partners/apply" },
  openGraph: {
    title: "VYNTEX Authorized Reseller Program",
    description:
      "Approved partners resell VYNTEX services under their own client relationship. $199 annual activation. Agreement and approval required.",
    url: `${SITE.url}/partners/apply`,
    type: "website",
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: "VYNTEX" }],
  },
  robots: { index: true, follow: true },
};

/**
 * PUBLIC page. Contains the program terms and the application form.
 *
 * It contains NO wholesale pricing, no partner list, no partner numbers, and no
 * authorization logic. The only figures shown are the activation fee and the
 * minimum resale count — both of which are public terms of the program, stated
 * in the reseller agreement itself.
 */
export default function ResellerApplyPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="pt-[72px]">
        <section className="py-16 sm:py-20">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-vx-blue">
                Authorized Reseller Program
              </span>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight text-vx-ink sm:text-4xl">
                Extend what you can offer your clients
              </h1>
              <p className="mt-4 text-vx-muted sm:text-lg">
                Approved partners offer VYNTEX websites, AI automation, CRM systems,
                branding, and social media under their own client relationship, while
                VYNTEX handles the technical delivery.
              </p>
            </div>

            <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.25fr] lg:items-start">
              <div className="flex flex-col gap-6 lg:sticky lg:top-24">
                <ProgramTerms />

                <GlowCard className="p-6">
                  <h2 className="text-sm font-semibold text-vx-ink">
                    Questions before you apply?
                  </h2>
                  <p className="mt-2 text-sm text-vx-muted">
                    Call or text {SITE.phone}, or email{" "}
                    {SITE.email}. We answer in English or Spanish.
                  </p>
                  <a
                    href={`/#${SECTION_IDS.contact}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-vx-blue hover:text-vx-cyan"
                  >
                    Contact VYNTEX
                    <ArrowRight size={15} aria-hidden />
                  </a>
                </GlowCard>
              </div>

              <GlowCard as="section" className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-vx-ink">
                  Apply to the Authorized Reseller Program
                </h2>
                <p className="mt-2 text-sm text-vx-muted">
                  Applying does not grant access or pricing. Every application is
                  reviewed manually.
                </p>
                <div className="mt-7">
                  <ResellerApplicationForm />
                </div>
              </GlowCard>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
