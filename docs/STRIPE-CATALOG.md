# Stripe → Website Service Catalog

The website's service cards are read from **Stripe Products**. Prices are never
read or shown — every card leads to a free consultation. Edit a product in
Stripe and the site updates within seconds (webhook), or within 1 hour at worst.

## One-time setup

1. **Restricted key** — Stripe Dashboard → Developers → API keys → *Create
   restricted key*. Permission: **Products: Read**. Everything else: None.
   Create it in the same mode (live / test) where your products exist.
2. **Webhook** — Developers → Webhooks → *Add endpoint*
   - URL: `https://vyntexusa.com/api/stripe/webhook`
   - Events: `product.created`, `product.updated`, `product.deleted`
   - Copy the signing secret.
3. **Vercel** → Project → Settings → Environment Variables (Production):
   - `STRIPE_CATALOG_KEY` = the restricted key (`rk_live_…`)
   - `STRIPE_WEBHOOK_SECRET` = the signing secret (`whsec_…`)
   Redeploy once.
4. **Locally** — put the same two values in `.env.local`, then run
   `npm run stripe:audit`.

## Tagging a product (Stripe → Product → edit)

| Field | Purpose | Example |
|---|---|---|
| Name | English name | AI Front Desk |
| Description | English description | Bilingual AI receptionist that answers every call. |
| Marketing features | English feature list, one per line | Answers 24/7 |
| `vx_show` | publish switch | `true` |
| `vx_category` | section tab | `packages` · `websites` · `ai-tools` · `crm` · `branding` · `social` · `consulting` |
| `vx_slug` | unique id, lowercase-with-hyphens | `ai-front-desk` |
| `vx_order` | sort within its tab (optional, lower first) | `10` |
| `vx_name_es` | Spanish name | Recepción con IA |
| `vx_desc_es` | Spanish description | Recepcionista bilingüe con IA que contesta cada llamada. |
| `vx_features_es` | Spanish features, separated by `\|`, same order and count as English | `Atiende 24/7 \| Agenda citas` |
| `vx_featured` | "Recommended" badge (optional) | `true` |

## Rules the site enforces

- **Opt-in.** No `vx_show = true` → hidden. Deposit, balance, and service-fee
  products stay off the site automatically.
- **Bilingual parity.** Missing Spanish, or EN/ES feature counts that differ →
  excluded from BOTH languages.
- **No prices.** Any text containing `$` + digits, `USD`, or `/mo`/`/mes` →
  excluded.
- **Unique slugs.** A duplicate `vx_slug` → the second product is excluded.

`npm run stripe:audit` lists every product that is published, hidden, or
excluded — and exactly what to fix. It exits non-zero if anything is broken.

## Test the webhook locally

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
