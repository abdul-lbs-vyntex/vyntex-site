import type { Metadata } from "next";
import ServicesHub from "@/components/marketing/ServicesHub";
import { getServiceCatalog } from "@/lib/stripe/catalog";

export const metadata: Metadata = {
  title: "Services | VYNTEX",
  description:
    "Explore VYNTEX website development, AI automation, CRM, chatbot, branding, and digital marketing services. Bilingual English and Spanish. Book a free consultation for a quote.",
  alternates: { canonical: "/services" },
};

// Catalog is synced from Stripe; the webhook refreshes it instantly, this is the backstop.
export const revalidate = 3600;

export default async function Page() {
  const catalog = await getServiceCatalog();
  return <ServicesHub catalog={catalog} />;
}
