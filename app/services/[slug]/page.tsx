import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetail from "@/components/marketing/ServiceDetail";
import { getService, serviceSlugs } from "@/lib/marketing-content";

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService("en", slug);
  return service
    ? {
        title: `${service.shortTitle} | VYNTEX`,
        description: service.summary,
        alternates: { canonical: `/services/${slug}` },
      }
    : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getService("en", slug)) notFound();
  return <ServiceDetail slug={slug} />;
}
