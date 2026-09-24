import { describe, expect, it } from "vitest";
import { AI_BLUEPRINT, SERVICE_GROUPS, SERVICES } from "@/lib/services-catalog";

/**
 * The public catalog must never show prices or payment structure, and must be
 * complete in both languages (the site never mixes languages on one screen).
 */

// Frequency of work ("3 change requests per month") is fine; money and terms are not.
const PRICE_OR_TERMS =
  /\$\s?\d|\/\s?(mo|mes)\b|\bmonth to month\b|\bmes a mes\b|\bquoted per\b|\bcotizad[oa]\b|\bbilled at\b|\bcobrados? a costo\b|\bminimum term\b|\bplazo m[ií]nimo\b|\b12-month\b|\b12 meses\b|\binstallments?\b|\bcuotas de\b|\bsetup fee\b|\bdeposit to start\b/i;

function allText(): string[] {
  const out: string[] = [];
  for (const g of SERVICE_GROUPS) out.push(g.label.en, g.label.es, g.note.en, g.note.es);
  for (const s of SERVICES) {
    for (const lang of ["en", "es"] as const) {
      out.push(s.name[lang], s.line[lang], s.bestFor[lang], s.readyIn[lang]);
      out.push(...s.includes[lang], ...s.excludes[lang]);
    }
  }
  for (const lang of ["en", "es"] as const) {
    out.push(AI_BLUEPRINT.name[lang], AI_BLUEPRINT.line[lang], ...AI_BLUEPRINT.includes[lang]);
  }
  return out;
}

describe("public service catalog", () => {
  it("contains no prices, fees, terms, or custom quotes", () => {
    const offenders = allText().filter((text) => PRICE_OR_TERMS.test(text));
    expect(offenders).toEqual([]);
  });

  it("has English and Spanish for every field, with matching list lengths", () => {
    for (const s of SERVICES) {
      for (const field of ["name", "line", "bestFor", "readyIn"] as const) {
        expect(s[field].en.trim(), `${s.id}.${field}.en`).not.toBe("");
        expect(s[field].es.trim(), `${s.id}.${field}.es`).not.toBe("");
      }
      expect(s.includes.es.length, `${s.id} includes`).toBe(s.includes.en.length);
      expect(s.excludes.es.length, `${s.id} excludes`).toBe(s.excludes.en.length);
    }
    expect(AI_BLUEPRINT.includes.es.length).toBe(AI_BLUEPRINT.includes.en.length);
  });

  it("never lists a service fee, deposit, or domain add-on as a service", () => {
    const names = SERVICES.map((s) => s.name.en.toLowerCase());
    expect(names.some((n) => /service fee|deposit|balance|domain/.test(n))).toBe(false);
  });

  it("has unique ids and every service belongs to a known group", () => {
    const ids = SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const groups = new Set(SERVICE_GROUPS.map((g) => g.id));
    for (const s of SERVICES) expect(groups.has(s.group), s.id).toBe(true);
  });

  it("carries all 17 Command Center services", () => {
    expect(SERVICES).toHaveLength(17);
  });
});
