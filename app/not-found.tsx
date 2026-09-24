import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { SITE, SECTION_IDS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * 404. A real page with real navigation — not a dead end. It stays useful in
 * both languages by relying on the site chrome rather than inventing new copy
 * that would need its own translations.
 */
export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main-content" className="pt-[72px]">
        <Container>
          <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
            <p className="font-mono text-6xl font-extrabold text-vx-blue sm:text-7xl">
              404
            </p>
            <div>
              <h1 className="text-2xl font-bold text-vx-ink sm:text-3xl">
                Page not found · Página no encontrada
              </h1>
              <p className="mx-auto mt-3 max-w-md text-vx-muted">
                The page you asked for does not exist. It may have moved, or the link
                may be mistyped.
                <br />
                <span className="text-vx-silver-dim">
                  La página que buscas no existe. Puede haberse movido o el enlace
                  puede estar mal escrito.
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button href="/" variant="primary">
                Home · Inicio
              </Button>
              <Button href={`/#${SECTION_IDS.services}`} variant="ghost">
                Services · Servicios
              </Button>
              <Button href={`/#${SECTION_IDS.contact}`} variant="ghost">
                Contact · Contacto
              </Button>
            </div>
            <p className="text-sm text-vx-silver-dim">
              <Link href={`mailto:${SITE.email}`} className="hover:text-vx-blue">
                {SITE.email}
              </Link>{" "}
              · {SITE.phone}
            </p>
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
