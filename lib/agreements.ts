import "server-only";
import { createHash } from "crypto";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { SITE } from "@/lib/site";
import {
  AGREEMENT,
  AGREEMENT_VERSION,
  canonicalAgreementText,
  type AgreementLang,
} from "@/lib/agreement-content";

/**
 * Agreement hashing, signed-record PDF generation, and storage. SERVER ONLY.
 *
 * WHAT THIS IS: a typed-name electronic signature with a tamper-evident audit
 * trail — the exact text signed is committed to by a SHA-256 hash, and the
 * signer, timestamp, salted IP hash, user agent, and consent text are all
 * recorded as immutable audit events.
 *
 * WHAT THIS IS NOT: a certificate-based e-signature service. We do not claim
 * DocuSign equivalency anywhere in the UI, and the attorney-review disclaimer
 * from the source agreement is preserved verbatim in both languages.
 */

export const AGREEMENT_BUCKET = "agreements";

/** SHA-256 of the canonical bilingual agreement text for the current version. */
export function agreementHash(): string {
  return createHash("sha256").update(canonicalAgreementText(), "utf8").digest("hex");
}

export interface SignedAgreementData {
  agreementId: string;
  partnerNumber: string;
  version: string;
  hash: string;
  language: AgreementLang;
  signedName: string;
  signedBusinessName: string;
  signedTitle: string;
  signedEmail: string;
  signedAt: string; // ISO
  consentText: string;
}

// ---------------------------------------------------------------------------
// PDF generation
// ---------------------------------------------------------------------------

/**
 * pdf-lib's StandardFonts use WinAnsi encoding. Spanish accents are covered,
 * but typographic dashes/quotes are not always safe across viewers, so we
 * normalize them. Any remaining character outside Latin-1 is dropped rather
 * than throwing mid-render.
 */
function sanitize(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00B7/g, "-")
    .replace(/\u2026/g, "...")
    // eslint-disable-next-line no-control-regex
    .replace(/[^\u0000-\u00FF]/g, "");
}

const PAGE_WIDTH = 612; // US Letter
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

interface Cursor {
  page: PDFPage;
  y: number;
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = sanitize(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length > 0 ? lines : [""];
}

export async function generateAgreementPdf(
  data: SignedAgreementData,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`VYNTEX Authorized Reseller Agreement ${data.version}`);
  pdf.setSubject(`Signed by ${data.signedName} (${data.partnerNumber})`);
  pdf.setProducer("VYNTEX");
  pdf.setCreator("VYNTEX");

  const body = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const ink = rgb(0.07, 0.09, 0.12);
  const muted = rgb(0.42, 0.45, 0.52);
  const accent = rgb(0.05, 0.42, 0.63);

  const cursor: Cursor = { page: pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]), y: PAGE_HEIGHT - MARGIN };

  const newPage = () => {
    cursor.page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    cursor.y = PAGE_HEIGHT - MARGIN;
  };

  const write = (
    text: string,
    opts: { font?: PDFFont; size?: number; color?: typeof ink; gap?: number } = {},
  ) => {
    const font = opts.font ?? body;
    const size = opts.size ?? 9.5;
    const color = opts.color ?? ink;
    const leading = size * 1.42;

    for (const line of wrap(text, font, size, CONTENT_WIDTH)) {
      if (cursor.y - leading < MARGIN) newPage();
      cursor.page.drawText(line, { x: MARGIN, y: cursor.y - size, size, font, color });
      cursor.y -= leading;
    }
    cursor.y -= opts.gap ?? 4;
  };

  const rule = () => {
    if (cursor.y - 12 < MARGIN) newPage();
    cursor.page.drawLine({
      start: { x: MARGIN, y: cursor.y },
      end: { x: PAGE_WIDTH - MARGIN, y: cursor.y },
      thickness: 0.6,
      color: rgb(0.85, 0.87, 0.9),
    });
    cursor.y -= 12;
  };

  // --- Header -------------------------------------------------------------
  write("VYNTEX", { font: bold, size: 17, color: accent, gap: 1 });
  write("AI Automation - Web Development - Digital Technology", {
    size: 8,
    color: muted,
    gap: 8,
  });

  const doc = AGREEMENT[data.language];
  const en = AGREEMENT.en;

  write(en.title, { font: bold, size: 13, gap: 2 });
  write(en.partiesLine, { size: 8.5, color: muted, gap: 8 });
  rule();

  // --- Signature block (front and centre — this IS the record) -------------
  write(doc.labels.documentHeading, { font: bold, size: 11, color: accent, gap: 6 });

  const facts: [string, string][] = [
    [doc.labels.partnerNumber, data.partnerNumber],
    [doc.labels.signer, data.signedName],
    [doc.labels.business, data.signedBusinessName],
    [doc.labels.title, data.signedTitle],
    [doc.labels.email, data.signedEmail],
    [doc.labels.signedAt, new Date(data.signedAt).toUTCString()],
    [doc.labels.version, data.version],
    [doc.labels.hash, data.hash],
  ];

  for (const [label, value] of facts) {
    const size = 9;
    const leading = size * 1.5;
    if (cursor.y - leading < MARGIN) newPage();
    cursor.page.drawText(sanitize(`${label}:`), {
      x: MARGIN,
      y: cursor.y - size,
      size,
      font: bold,
      color: muted,
    });
    // The hash is long: render it in a smaller size so it never clips.
    const valueSize = value.length > 52 ? 7 : size;
    cursor.page.drawText(sanitize(value), {
      x: MARGIN + 150,
      y: cursor.y - size,
      size: valueSize,
      font: body,
      color: ink,
    });
    cursor.y -= leading;
  }

  cursor.y -= 6;
  write(doc.labels.signature, { font: bold, size: 9, color: muted, gap: 2 });
  write(`/s/ ${data.signedName}`, { font: italic, size: 13, gap: 8 });

  write(data.consentText, { size: 8, color: muted, gap: 10 });
  rule();

  // --- Full agreement text, both languages --------------------------------
  for (const lang of ["en", "es"] as AgreementLang[]) {
    const d = AGREEMENT[lang];
    write(lang === "en" ? "English" : "Espanol (traduccion de cortesia)", {
      font: bold,
      size: 11,
      color: accent,
      gap: 6,
    });
    write(d.title, { font: bold, size: 10, gap: 2 });
    write(d.partiesLine, { size: 8, color: muted, gap: 8 });

    for (const section of d.sections) {
      write(section.heading, { font: bold, size: 9.5, gap: 2 });
      for (const paragraph of section.paragraphs) {
        write(paragraph, { size: 9, gap: 5 });
      }
    }

    write(d.disclaimer, { font: italic, size: 8, color: muted, gap: 12 });
    if (lang === "en") rule();
  }

  // --- Footer on every page -----------------------------------------------
  const pages = pdf.getPages();
  pages.forEach((page, index) => {
    page.drawText(
      sanitize(
        `VYNTEX - ${SITE.email} - ${SITE.phone} - ${SITE.address.locality}, ${SITE.address.region} ${SITE.address.postalCode}   |   Agreement ${data.version}   |   Page ${index + 1} of ${pages.length}`,
      ),
      { x: MARGIN, y: 28, size: 7, font: body, color: muted },
    );
  });

  return pdf.save();
}

// ---------------------------------------------------------------------------
// Storage (private bucket — no public URLs, ever)
// ---------------------------------------------------------------------------

export function agreementPath(partnerId: string, agreementId: string): string {
  return `${partnerId}/${agreementId}-v${AGREEMENT_VERSION}.pdf`;
}

export type StoreResult = { ok: true; path: string } | { ok: false; error: string };

export async function storeAgreementPdf(input: {
  partnerId: string;
  agreementId: string;
  bytes: Uint8Array;
}): Promise<StoreResult> {
  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, error: "Storage is not configured." };

  const path = agreementPath(input.partnerId, input.agreementId);
  // Uint8Array -> ArrayBuffer for the storage client.
  const buffer = input.bytes.slice().buffer;

  const { error } = await admin.storage.from(AGREEMENT_BUCKET).upload(path, buffer, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, path };
}

/**
 * Short-lived signed URL for a stored agreement. The bucket is private, so this
 * is the only way to read it, and the link expires. Callers MUST verify the
 * requester owns the agreement before calling this.
 */
export async function signedAgreementUrl(
  path: string,
  expiresInSeconds = 300,
): Promise<string | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const { data, error } = await admin.storage
    .from(AGREEMENT_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data) return null;
  return data.signedUrl;
}
