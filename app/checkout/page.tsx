import { permanentRedirect } from "next/navigation";

/**
 * Public checkout is retired. VYNTEX no longer sells services from a public
 * price list: visitors book a free consultation and receive a written proposal,
 * then pay through a Stripe invoice or payment link. Old /checkout links (and
 * any bookmarked /checkout?service=... URLs) land on the services page.
 *
 * /checkout/success and /checkout/cancel remain for the legacy partner flow.
 */
export default function CheckoutRetired(): never {
  permanentRedirect("/services");
}
