import { NextResponse } from "next/server";
import { createCheckoutSchema } from "@/lib/validation/checkout";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth";
import { getPartnerAccess } from "@/lib/reseller";
import { resolveOrder, type ResolvedOrder } from "@/lib/orders";
import { createPaymentLink, isSquareConfigured } from "@/lib/square";
import { limiters } from "@/lib/rate-limit";
import { getClientIp, checkSpam } from "@/lib/request";
import { SITE } from "@/lib/site";
import { notifyFormSubmit } from "@/lib/formsubmit";

export const runtime = "nodejs";

type Result =
  | { ok: true; orderId: string; url: string }
  | { ok: false; code: string };

function json(body: Result, status = 200) {
  return NextResponse.json(body, { status });
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || SITE.url).replace(/\/$/, "");
}

/**
 * LEGACY PARTNER CHECKOUT (Square). Public direct orders are rejected (410).
 * Scheduled for replacement when the partner program moves to the
 * revenue-share model and Square is removed.
 *
 * Creates an order and returns a Square-hosted checkout URL.
 *
 * SECURITY INVARIANTS ENFORCED HERE:
 *  1. The client never sends a price. `resolveOrder` reads lib/pricing.ts and
 *     that is the amount charged. Full stop.
 *  2. Reseller activation requires an APPROVED partner with a SIGNED agreement.
 *     Renewal requires an active-or-expired partner. Wholesale orders require
 *     a fully ACTIVE partner. All checked server-side against the database.
 *  3. The order is created with status 'pending'. Only the signature-verified
 *     Square webhook may ever set it to 'paid'.
 *  4. Quote-only tiers ("$2,000+") are rejected — we will not auto-charge a
 *     starting price.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request.headers);

  if (!isSquareConfigured()) {
    console.error("[checkout] Square is not configured.");
    return json({ ok: false, code: "payments_unavailable" }, 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "validation" }, 400);
  }

  const raw = body as Record<string, unknown>;
  const spam = checkSpam({
    honeypot: raw.honeypot,
    startedAt: raw.startedAt,
    message: typeof raw.notes === "string" ? raw.notes : "",
    minSeconds: 3,
  });
  if (spam.spam) return json({ ok: false, code: "spam" }, 400);

  const parsed = createCheckoutSchema.safeParse(body);
  if (!parsed.success) return json({ ok: false, code: "validation" }, 400);
  const input = parsed.data;

  // Public direct checkout is RETIRED. Services are quoted after a free
  // consultation and billed through Stripe (invoices / payment links sent by
  // VYNTEX). This route no longer takes payment from the public; only the
  // legacy partner flows below remain until the partner program is rebuilt.
  if (input.orderType === "direct") {
    return json({ ok: false, code: "direct_checkout_retired" }, 410);
  }

  const user = await getUser();

  // Rate limit by user when signed in, otherwise by IP.
  const rlKey = user ? `user:${user.id}` : `ip:${ip}`;
  const limiter =
    input.orderType === "partner_wholesale"
      ? limiters.partnerOrder()
      : limiters.checkoutCreate();
  const rl = await limiter.limit(rlKey);
  if (!rl.success) return json({ ok: false, code: "rate_limited" }, 429);

  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("[checkout] Supabase admin not configured.");
    return json({ ok: false, code: "server" }, 500);
  }

  // ---- Authorization per order type -------------------------------------
  let partnerId: string | null = null;
  let customerEmail = "";
  let customerName: string | null = null;
  let clientReference: string | null = null;
  let notes: string | null = null;

  {
    // Every remaining order type requires a signed-in partner.
    if (!user) return json({ ok: false, code: "session" }, 401);

    const access = await getPartnerAccess(user);
    const partner = access.partner;
    if (!partner) return json({ ok: false, code: "not_a_partner" }, 403);

    if (input.orderType === "reseller_activation") {
      // Must be approved AND have signed the agreement. Nothing else qualifies.
      if (access.state !== "signed_unpaid") {
        return json({ ok: false, code: "activation_not_available" }, 403);
      }
    } else if (input.orderType === "reseller_renewal") {
      if (access.state !== "active" && access.state !== "expired") {
        return json({ ok: false, code: "renewal_not_available" }, 403);
      }
    } else if (input.orderType === "partner_wholesale") {
      // Wholesale ordering is gated on the exact same flag as wholesale pricing.
      if (!access.canViewWholesale) {
        return json({ ok: false, code: "partner_not_active" }, 403);
      }
      clientReference = input.clientReference;
      notes = input.notes || null;
    }

    partnerId = partner.id;
    customerEmail = partner.email;
    customerName = partner.contact_name;
  }

  // ---- Authoritative pricing (server-side, from lib/pricing.ts) ----------
  const serviceKey =
    input.orderType === "partner_wholesale"
      ? input.serviceKey
      : undefined;

  const resolved = resolveOrder({ orderType: input.orderType, serviceKey });
  if (!resolved.ok) return json({ ok: false, code: resolved.code }, 400);
  const order: ResolvedOrder = resolved.order;

  // ---- Persist the order as PENDING -------------------------------------
  const { data: orderRow, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      partner_id: partnerId,
      customer_email: customerEmail,
      customer_name: customerName,
      order_type: order.orderType,
      status: "pending",
      subtotal: order.subtotalCents,
      tax: order.taxCents,
      total: order.totalCents,
      currency: order.currency,
      client_reference: clientReference,
      notes,
      language: input.language,
    })
    .select("id")
    .single();

  if (orderError || !orderRow) {
    console.error("[checkout] order insert failed:", orderError?.message);
    return json({ ok: false, code: "server" }, 500);
  }

  const orderId = orderRow.id as string;

  const itemRows = order.items.map((item) => ({
    order_id: orderId,
    service_key: item.serviceKey,
    service_name_snapshot: item.serviceNameSnapshot,
    unit_price: item.unitPriceCents,
    quantity: item.quantity,
    billing_type: item.billingType,
    metadata: item.metadata,
  }));

  const { error: itemsError } = await admin.from("order_items").insert(itemRows);
  if (itemsError) {
    console.error("[checkout] order items insert failed:", itemsError.message);
    return json({ ok: false, code: "server" }, 500);
  }

  // ---- Square-hosted payment link ---------------------------------------
  const link = await createPaymentLink({
    orderId,
    name: order.checkoutLabel,
    amountCents: order.totalCents,
    buyerEmail: customerEmail || undefined,
    redirectUrl: `${siteUrl()}/checkout/success?order=${orderId}`,
  });

  if (!link.ok) {
    await admin.from("orders").update({ status: "failed" }).eq("id", orderId);
    return json({ ok: false, code: "payment_link_failed" }, 502);
  }

  await admin
    .from("orders")
    .update({
      square_payment_link_id: link.paymentLinkId,
      square_order_id: link.squareOrderId,
    })
    .eq("id", orderId);

  // For an activation/renewal, open the renewal record now; the webhook marks
  // it paid. This gives us a durable record of the attempt either way.
  if (
    order.orderType === "reseller_activation" ||
    order.orderType === "reseller_renewal"
  ) {
    if (partnerId) {
      await admin.from("partner_renewals").insert({
        partner_id: partnerId,
        renewal_year: new Date().getUTCFullYear(),
        payment_order_id: orderId,
        amount: order.totalCents,
        status: "pending",
      });
    }
  }

  const formSubmit = await notifyFormSubmit({
    formName: "Checkout / Order Submission",
    subject: `New VYNTEX ${order.orderType.replaceAll("_", " ")} order created`,
    replyTo: customerEmail || undefined,
    fields: {
      "Order ID": orderId,
      "Order Type": order.orderType,
      "Customer Name": customerName,
      "Customer Email": customerEmail,
      "Partner ID": partnerId,
      "Client Reference": clientReference,
      "Service Items": order.items.map((item) => item.serviceNameSnapshot),
      "Total (cents)": order.totalCents,
      Currency: order.currency,
      Language: input.language,
      Status: "pending Square confirmation",
    },
  });
  if (!formSubmit.ok) {
    console.error("[checkout] FormSubmit notification failed:", formSubmit.error);
  }

  return json({ ok: true, orderId, url: link.url });
}
