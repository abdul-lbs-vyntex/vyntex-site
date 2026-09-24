import type { Metadata } from "next";
import ServicesHub from "@/components/marketing/ServicesHub";

export const metadata: Metadata = {
  title: "Services | VYNTEX",
  description:
    "Explore VYNTEX website development, AI automation, CRM, chatbot, branding, and digital marketing services. Bilingual English and Spanish. Book a free 30-minute consultation to find the right package.",
  alternates: { canonical: "/services" },
};

export default function Page() {
  return <ServicesHub />;
}
