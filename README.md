# Senior Resident

A reasoning coach that sits beside your question bank and walks you to the answer one decision at a time.

- `index.html` landing page, pricing, install
- `app/` the coach (web app, and the page the extension shows in its side panel)
- `extension/senior-resident/` Chrome extension (Manifest V3), zipped as `extension/senior-resident.zip`
- `supabase/` database schema, the `resident` coach function and the `sr-stripe` webhook
- `config.js` prices, free allowance, Stripe links and the billing switch

## Turning on payments

1. Supabase SQL editor: run `supabase/senior-resident.sql`.
2. Supabase Edge Functions: deploy `resident` and `sr-stripe`, both with JWT verification off. Secrets: `ANTHROPIC_API_KEY`, `BILLING_LIVE=true`, `STRIPE_WEBHOOK_SECRET`.
3. Stripe: create a Pro product with a monthly and a yearly price, make a Payment Link for each, and add a webhook to `.../functions/v1/sr-stripe` for `checkout.session.completed`, `customer.subscription.updated` and `customer.subscription.deleted`.
4. `config.js`: paste the two links (and the customer portal link), set `BILLING_LIVE: true`.

Until then everyone has full access and Upgrade collects a waitlist.
