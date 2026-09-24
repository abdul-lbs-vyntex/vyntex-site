import { describe, expect, it } from "vitest";
import {
  buildCatalog,
  parseStripeProduct,
  type CatalogProductInput,
} from "@/lib/stripe/parse";

function product(overrides: Partial<CatalogProductInput> = {}): CatalogProductInput {
  return {
    id: "prod_test",
    active: true,
    name: "AI Front Desk",
    description: "Bilingual AI receptionist that answers every call.",
    marketing_features: [{ name: "Answers 24/7" }, { name: "Books appointments" }],
    metadata: {
      vx_show: "true",
      vx_category: "ai-tools",
      vx_slug: "ai-front-desk",
      vx_order: "10",
      vx_name_es: "Recepción con IA",
      vx_desc_es: "Recepcionista bilingüe con IA que contesta cada llamada.",
      vx_features_es: "Atiende 24/7 | Agenda citas",
    },
    ...overrides,
  };
}

describe("Stripe catalog parsing", () => {
  it("publishes a fully tagged, bilingual product", () => {
    const result = parseStripeProduct(product());
    expect(result.status).toBe("published");
    if (result.status !== "published") return;
    expect(result.service.name).toEqual({ en: "AI Front Desk", es: "Recepción con IA" });
    expect(result.service.features.es).toEqual(["Atiende 24/7", "Agenda citas"]);
    expect(result.service.order).toBe(10);
  });

  it("hides products that are not opted in (deposits, fees, internal items)", () => {
    const { metadata } = product();
    expect(parseStripeProduct(product({ metadata: { ...metadata, vx_show: "" } })).status).toBe("hidden");
    const noShow: Record<string, string> = { ...metadata };
    delete noShow.vx_show;
    expect(parseStripeProduct(product({ metadata: noShow })).status).toBe("hidden");
    expect(parseStripeProduct(product({ active: false })).status).toBe("hidden");
  });

  it("excludes a product whose Spanish is missing (parity is all-or-nothing)", () => {
    const metadata: Record<string, string> = { ...product().metadata };
    delete metadata.vx_name_es;
    const result = parseStripeProduct(product({ metadata }));
    expect(result.status).toBe("invalid");
  });

  it("excludes a product whose EN/ES feature counts differ", () => {
    const metadata = { ...product().metadata, vx_features_es: "Atiende 24/7" };
    const result = parseStripeProduct(product({ metadata }));
    expect(result.status).toBe("invalid");
    if (result.status === "invalid") {
      expect(result.product.issues.join(" ")).toMatch(/2 EN .* 1 ES/);
    }
  });

  it("rejects copy that contains a price", () => {
    expect(parseStripeProduct(product({ description: "Only $497 to start." })).status).toBe("invalid");
    const metadata = { ...product().metadata, vx_desc_es: "Solo 149 USD al mes." };
    expect(parseStripeProduct(product({ metadata })).status).toBe("invalid");
    expect(
      parseStripeProduct(product({ marketing_features: [{ name: "Care plan $99/mo" }, { name: "x" }] }))
        .status,
    ).toBe("invalid");
  });

  it("rejects unknown categories and malformed slugs", () => {
    const base = product().metadata;
    expect(parseStripeProduct(product({ metadata: { ...base, vx_category: "hosting" } })).status).toBe("invalid");
    expect(parseStripeProduct(product({ metadata: { ...base, vx_slug: "AI Front Desk" } })).status).toBe("invalid");
  });

  it("drops duplicate slugs and sorts by category, then order", () => {
    const base = product().metadata;
    const build = buildCatalog([
      product({ id: "p1", metadata: { ...base, vx_category: "crm", vx_slug: "crm-a", vx_order: "2" } }),
      product({ id: "p2", metadata: { ...base, vx_category: "packages", vx_slug: "pkg", vx_order: "5" } }),
      product({ id: "p3", metadata: { ...base, vx_category: "crm", vx_slug: "crm-b", vx_order: "1" } }),
      product({ id: "p4", metadata: { ...base, vx_category: "crm", vx_slug: "crm-b" } }),
      product({ id: "p5", metadata: { ...base, vx_show: "false" } }),
    ]);
    expect(build.services.map((s) => s.id)).toEqual(["p2", "p3", "p1"]);
    expect(build.invalid.map((p) => p.productId)).toEqual(["p4"]);
    expect(build.hiddenCount).toBe(1);
  });

  it("never carries price data into the published shape", () => {
    const result = parseStripeProduct(product());
    expect(JSON.stringify(result)).not.toMatch(/price|amount|unit_amount/i);
  });
});
