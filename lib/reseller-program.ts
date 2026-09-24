/**
 * Public reseller-program terms (from the reseller agreement).
 *
 * Split out of lib/pricing.ts so public pages (partners, chatbot, agreement
 * text) can show program terms WITHOUT importing the service price book.
 * lib/pricing.ts re-exports this for existing portal/server code.
 */
export const RESELLER_PROGRAM = {
  activationFee: "$199",
  activationPeriodKey: "perYear",
  minimumResalesPerYear: 4,
} as const;
