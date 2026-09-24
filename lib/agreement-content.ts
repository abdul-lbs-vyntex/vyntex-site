/**
 * VYNTEX Authorized Reseller Agreement — CANONICAL TEXT.
 *
 * This is the single source for the agreement. It is used to (a) render the
 * on-screen agreement, (b) compute the SHA-256 hash stored with every
 * signature, and (c) generate the signed PDF. All three therefore always
 * describe exactly the same document.
 *
 * Version history
 * ---------------
 * 2.0 — Derived verbatim from the uploaded reseller agreement HTML (v1). Two
 *       corrections, no changes to business meaning:
 *         1. Contact details updated to the official ones (the legacy file
 *            carried a retired email and phone number).
 *         2. The English §8 now states that the English version controls. The
 *            legacy Spanish §8 already said this ("la versión en inglés
 *            prevalece") but the English text did not, leaving the two versions
 *            asymmetric. The clause is now present in both.
 *
 * NOTE: changing ANY character below changes the agreement hash. Bump
 * AGREEMENT_VERSION whenever the text changes, so previously signed records
 * remain verifiable against the text that was actually signed.
 */

import { SITE } from "@/lib/site";
import { RESELLER_PROGRAM } from "@/lib/reseller-program";

export const AGREEMENT_VERSION = "2.0";

export type AgreementLang = "en" | "es";

export interface AgreementSection {
  /** Numbered heading, e.g. "1. Authorized Reseller Status". */
  heading: string;
  /** One or more paragraphs. Plain text — no markup. */
  paragraphs: string[];
}

export interface AgreementDocument {
  title: string;
  subtitle: string;
  partiesLine: string;
  sections: AgreementSection[];
  /** Consent text the signer explicitly agrees to. Stored with the signature. */
  consentText: string;
  /** Attorney-review notice. Must never be removed. */
  disclaimer: string;
  labels: {
    version: string;
    signer: string;
    business: string;
    title: string;
    email: string;
    partnerNumber: string;
    signedAt: string;
    hash: string;
    signature: string;
    company: string;
    documentHeading: string;
  };
}

const CONTACT_LINE = `${SITE.email} · ${SITE.phone} · ${SITE.address.locality}, ${SITE.address.region} ${SITE.address.postalCode}`;
const FEE = RESELLER_PROGRAM.activationFee;
const MIN = RESELLER_PROGRAM.minimumResalesPerYear;

const english: AgreementDocument = {
  title: "VYNTEX — Authorized Reseller Agreement",
  subtitle: `Agreement version ${AGREEMENT_VERSION}`,
  partiesLine: `VYNTEX ("Company") — ${CONTACT_LINE}`,
  sections: [
    {
      heading: "1. Authorized Reseller Status",
      paragraphs: [
        "Company grants Reseller a non-exclusive, non-transferable right to resell Company's services (websites, AI tools, CRM systems, branding, social media, and related work) to Reseller's own clients, valid only while this Agreement is active and in good standing.",
      ],
    },
    {
      heading: "2. Activation Fee & Minimum Requirement",
      paragraphs: [
        `2.1 Reseller pays a ${FEE} activation fee per year to obtain and maintain authorized status and access to wholesale pricing.`,
        `2.2 Reseller must complete a minimum of ${MIN} (${MIN}) resales per twelve-month period to keep authorized status and wholesale pricing.`,
        "2.3 If the annual fee is not renewed, or the minimum is not met, Company may deactivate Reseller's access to wholesale pricing at any time, automatically or manually.",
      ],
    },
    {
      heading: "3. Pricing, Payment & No Undercutting",
      paragraphs: [
        "3.1 Reseller pays Company the wholesale (cost) price for each service. Reseller sets and collects its own price from its own client and keeps the difference.",
        "3.2 Reseller shall not advertise, list, or sell any Company service below Company's published retail price. Undercutting the public price is a material breach.",
        "3.3 Reseller is responsible for billing and collecting from its own clients. Company is paid by Reseller regardless of whether Reseller's client pays Reseller.",
      ],
    },
    {
      heading: "4. Scope of Services (Labor Only)",
      paragraphs: [
        "All prices cover Company's labor and creation only. They do not include third-party fees (hosting, domains, software or CRM licenses, email/SMS sending, ad spend, premium plugins, stock assets, or any service carrying its own monthly fee). Reseller must disclose this to its clients. Each service includes 30 days of support; changes after 30 days are billed hourly.",
      ],
    },
    {
      heading: "5. Non-Circumvention & Non-Solicitation",
      paragraphs: [
        "5.1 Reseller shall not solicit, divert, or contract directly with Company's known direct clients.",
        "5.2 Company shall not solicit or directly contract with Reseller's clients introduced under this Agreement.",
        "5.3 Reseller shall not reproduce, resell, or reverse-engineer Company's methods, tools, or systems outside this Agreement.",
      ],
    },
    {
      heading: "6. Confidentiality",
      paragraphs: [
        "Wholesale pricing, the reseller library, partner numbers, and Company methods are confidential. Reseller shall not publish, share, or disclose wholesale pricing to any third party or to the public.",
      ],
    },
    {
      heading: "7. Term, Deactivation & Termination",
      paragraphs: [
        "This Agreement runs for twelve (12) months and renews with each annual activation fee. Company may immediately suspend or terminate Reseller's access — and revoke the partner number — for non-payment, failure to meet the minimum, undercutting, non-circumvention breach, or disclosure of confidential pricing. Either party may end this Agreement with written notice; obligations in Sections 5 and 6 survive termination for two (2) years.",
      ],
    },
    {
      heading: "8. Independent Parties & Governing Law",
      paragraphs: [
        "The parties are independent contractors — not partners, employees, or a joint venture. Reseller has no authority to bind Company. This Agreement is governed by the laws of the State of New Jersey. No territory or exclusivity is granted unless stated in writing. The Spanish text of this Agreement is a courtesy translation; in the event of any conflict or inconsistency, the English version controls.",
      ],
    },
  ],
  consentText:
    "I have read the VYNTEX Authorized Reseller Agreement in full. I am authorized to sign on behalf of the business named above. I agree to be bound by this Agreement, and I consent to sign it electronically. I understand my typed name, the date and time, and technical information about this submission are recorded as evidence of this signature.",
  disclaimer:
    "This is a business template, not legal advice. Have it reviewed by a licensed attorney in your state before use.",
  labels: {
    version: "Agreement version",
    signer: "Signed by",
    business: "Legal business name",
    title: "Title",
    email: "Email",
    partnerNumber: "Partner number",
    signedAt: "Signed at",
    hash: "Agreement hash (SHA-256)",
    signature: "Electronic signature",
    company: "VYNTEX — Authorized Representative",
    documentHeading: "Signed Agreement Record",
  },
};

const spanish: AgreementDocument = {
  title: "VYNTEX — Acuerdo de Revendedor Autorizado",
  subtitle: `Versión del acuerdo ${AGREEMENT_VERSION}`,
  partiesLine: `VYNTEX ("la Compañía") — ${CONTACT_LINE}`,
  sections: [
    {
      heading: "1. Estatus de Revendedor Autorizado",
      paragraphs: [
        "La Compañía otorga al Revendedor el derecho no exclusivo e intransferible de revender los servicios de la Compañía (sitios web, herramientas de IA, sistemas CRM, imagen de marca, redes sociales y trabajo relacionado) a sus propios clientes, válido solo mientras este Acuerdo esté activo y al corriente.",
      ],
    },
    {
      heading: "2. Cuota de Activación y Requisito Mínimo",
      paragraphs: [
        `2.1 El Revendedor paga una cuota de activación de ${FEE} por año para obtener y mantener el estatus autorizado y el acceso al precio mayorista.`,
        `2.2 El Revendedor debe completar un mínimo de ${MIN} (${MIN}) reventas por periodo de doce meses para conservar el estatus y el precio mayorista.`,
        "2.3 Si no se renueva la cuota anual, o no se cumple el mínimo, la Compañía puede desactivar el acceso al precio mayorista en cualquier momento, de forma automática o manual.",
      ],
    },
    {
      heading: "3. Precios, Pago y Sin Descuentos por Debajo",
      paragraphs: [
        "3.1 El Revendedor paga a la Compañía el precio mayorista (costo) de cada servicio, fija y cobra su propio precio a su propio cliente, y se queda con la diferencia.",
        "3.2 El Revendedor no podrá anunciar, publicar ni vender ningún servicio de la Compañía por debajo del precio de venta al público publicado. Hacerlo es un incumplimiento grave.",
        "3.3 El Revendedor es responsable de facturar y cobrar a sus propios clientes. La Compañía cobra al Revendedor sin importar si el cliente del Revendedor le paga.",
      ],
    },
    {
      heading: "4. Alcance de los Servicios (Solo Mano de Obra)",
      paragraphs: [
        "Todos los precios cubren solo la mano de obra y creación de la Compañía. No incluyen cuotas de terceros (hosting, dominios, licencias de software o CRM, envío de correos/SMS, pauta publicitaria, plugins premium, imágenes de stock, ni ningún servicio con cuota mensual propia). El Revendedor debe informar esto a sus clientes. Cada servicio incluye 30 días de soporte; los cambios después de 30 días se cobran por hora.",
      ],
    },
    {
      heading: "5. No Circunvención y No Solicitación",
      paragraphs: [
        "5.1 El Revendedor no solicitará, desviará ni contratará directamente con los clientes directos conocidos de la Compañía.",
        "5.2 La Compañía no solicitará ni contratará directamente con los clientes del Revendedor presentados bajo este Acuerdo.",
        "5.3 El Revendedor no reproducirá, revenderá ni realizará ingeniería inversa de los métodos, herramientas o sistemas de la Compañía fuera de este Acuerdo.",
      ],
    },
    {
      heading: "6. Confidencialidad",
      paragraphs: [
        "El precio mayorista, la librería de revendedores, los números de socio y los métodos de la Compañía son confidenciales. El Revendedor no publicará, compartirá ni divulgará el precio mayorista a terceros ni al público.",
      ],
    },
    {
      heading: "7. Vigencia, Desactivación y Terminación",
      paragraphs: [
        "Este Acuerdo dura doce (12) meses y se renueva con cada cuota de activación anual. La Compañía puede suspender o terminar de inmediato el acceso del Revendedor — y revocar el número de socio — por falta de pago, incumplimiento del mínimo, vender por debajo del precio, violación de no circunvención o divulgación de precios confidenciales. Cualquiera de las partes puede terminar con aviso por escrito; las obligaciones de las Secciones 5 y 6 sobreviven la terminación por dos (2) años.",
      ],
    },
    {
      heading: "8. Partes Independientes y Ley Aplicable",
      paragraphs: [
        "Las partes son contratistas independientes — no socios, empleados ni empresa conjunta. El Revendedor no tiene autoridad para obligar a la Compañía. Este Acuerdo se rige por las leyes del Estado de Nueva Jersey. No se otorga territorio ni exclusividad salvo que se indique por escrito. El texto en español es una traducción de cortesía; en caso de conflicto, la versión en inglés prevalece.",
      ],
    },
  ],
  consentText:
    "He leído en su totalidad el Acuerdo de Revendedor Autorizado de VYNTEX. Estoy autorizado para firmar en nombre del negocio indicado arriba. Acepto quedar obligado por este Acuerdo y consiento en firmarlo electrónicamente. Entiendo que mi nombre escrito, la fecha y hora, e información técnica de este envío se registran como evidencia de esta firma.",
  disclaimer:
    "Esta es una plantilla comercial, no asesoría legal. Que la revise un abogado con licencia en su estado antes de usarla.",
  labels: {
    version: "Versión del acuerdo",
    signer: "Firmado por",
    business: "Nombre legal del negocio",
    title: "Cargo",
    email: "Correo electrónico",
    partnerNumber: "Número de socio",
    signedAt: "Firmado el",
    hash: "Hash del acuerdo (SHA-256)",
    signature: "Firma electrónica",
    company: "VYNTEX — Representante Autorizado",
    documentHeading: "Registro de Acuerdo Firmado",
  },
};

export const AGREEMENT: Record<AgreementLang, AgreementDocument> = {
  en: english,
  es: spanish,
};

/**
 * The exact string that gets hashed. Includes BOTH languages plus the version,
 * so the hash commits to the complete bilingual document that was presented.
 * Deterministic: no timestamps, no locale formatting.
 */
export function canonicalAgreementText(): string {
  const render = (doc: AgreementDocument): string =>
    [
      doc.title,
      doc.partiesLine,
      ...doc.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
      doc.consentText,
      doc.disclaimer,
    ].join("\n");

  return [
    `VYNTEX-RESELLER-AGREEMENT v${AGREEMENT_VERSION}`,
    render(english),
    render(spanish),
  ].join("\n---\n");
}
