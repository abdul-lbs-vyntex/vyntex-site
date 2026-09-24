import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import {
  AGREEMENT,
  AGREEMENT_VERSION,
  canonicalAgreementText,
} from "@/lib/agreement-content";
import { makeSignatureSchema } from "@/lib/validation/reseller";

/**
 * Agreement integrity.
 *
 * The SHA-256 hash stored with every signature commits to the exact text that
 * was signed. If the agreement text ever changes without a version bump, every
 * previously stored hash silently stops matching the document we would show —
 * which would destroy the evidentiary value of the whole audit trail.
 */

describe("agreement content", () => {
  it("is at version 2.0", () => {
    expect(AGREEMENT_VERSION).toBe("2.0");
  });

  it("contains all eight sections in BOTH languages", () => {
    expect(AGREEMENT.en.sections).toHaveLength(8);
    expect(AGREEMENT.es.sections).toHaveLength(8);
  });

  it("preserves the attorney-review disclaimer in both languages", () => {
    // Non-negotiable. Removing this would misrepresent a template as legal advice.
    expect(AGREEMENT.en.disclaimer).toContain("not legal advice");
    expect(AGREEMENT.en.disclaimer).toContain("licensed attorney");
    expect(AGREEMENT.es.disclaimer).toContain("no asesoría legal");
    expect(AGREEMENT.es.disclaimer).toContain("abogado con licencia");
  });

  it("states the English-controls clause in BOTH languages", () => {
    // The legacy agreement said this ONLY in Spanish, leaving the two versions
    // asymmetric. v2.0 fixed that. This test stops it regressing.
    const en8 = AGREEMENT.en.sections[7];
    const es8 = AGREEMENT.es.sections[7];
    expect(en8?.paragraphs.join(" ")).toContain("English version controls");
    expect(es8?.paragraphs.join(" ")).toContain("la versión en inglés prevalece");
  });

  it("carries the official contact details, not the retired ones", () => {
    const text = canonicalAgreementText();
    expect(text).toContain("info@vyntexusa.com");
    expect(text).toContain("609-780-3218");
    // 609-813-0633 / 609-322-7593 belong to Lion Business Services, not VYNTEX.
    expect(text).not.toContain("609-813-0633");
    expect(text).not.toContain("609-322-7593");
    // The legacy file's retired details must be gone.
    expect(text).not.toContain("info@vyntex.com ");
    expect(text).not.toContain("609-317-6692");
  });

  it("states the $199 fee and the four-resale minimum", () => {
    const text = canonicalAgreementText();
    expect(text).toContain("$199");
    expect(text).toMatch(/minimum of 4 \(4\) resales/i);
  });

  it("hashes deterministically — the same text always yields the same hash", () => {
    const a = createHash("sha256").update(canonicalAgreementText(), "utf8").digest("hex");
    const b = createHash("sha256").update(canonicalAgreementText(), "utf8").digest("hex");
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it("includes BOTH language versions in the hashed text", () => {
    // The hash must commit to the whole bilingual document that was presented,
    // not just the English half.
    const text = canonicalAgreementText();
    expect(text).toContain("Authorized Reseller Status");
    expect(text).toContain("Estatus de Revendedor Autorizado");
  });
});

describe("signature validation", () => {
  const schema = makeSignatureSchema();

  const valid = {
    fullLegalName: "Daysi Rodriguez",
    legalBusinessName: "Lion Business Services LLC",
    signerTitle: "Owner",
    email: "owner@example.com",
    typedSignature: "Daysi Rodriguez",
    agreementAccepted: true as const,
    signatureConsent: true as const,
    language: "en" as const,
  };

  it("accepts a correctly typed signature", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("REJECTS a typed signature that does not match the legal name", () => {
    // This is what makes the typed name a deliberate act rather than a stray
    // click on a checkbox.
    const result = schema.safeParse({ ...valid, typedSignature: "D. Rodriguez" });
    expect(result.success).toBe(false);
  });

  it("is tolerant of case and extra whitespace, but not of a different name", () => {
    expect(
      schema.safeParse({ ...valid, typedSignature: "  daysi   rodriguez " }).success,
    ).toBe(true);
    expect(
      schema.safeParse({ ...valid, typedSignature: "Someone Else" }).success,
    ).toBe(false);
  });

  it("requires BOTH the agreement checkbox and the e-signature consent", () => {
    expect(schema.safeParse({ ...valid, agreementAccepted: false }).success).toBe(false);
    expect(schema.safeParse({ ...valid, signatureConsent: false }).success).toBe(false);
  });
});
