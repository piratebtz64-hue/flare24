# Flare24

L'espace privé pour les rencontres intenses.

## Site en ligne

**https://flare24.vercel.app**

## Stack

- Next.js 15
- Tailwind CSS
- Stripe (Billing + Identity)
- Supabase (Auth + DB)

## Développement local

```bash
npm install
cp .env.example .env.local
# Remplir les clés Stripe + Supabase
npm run dev
```

## Stripe déjà configuré

- Produit : `prod_UzmW9bUsQNIazk` (Flare24 Gold)
- Prix : `price_1TzoHtCv958zyEcwhnLfsIrW` (4,99 € / mois)
- Payment Link : https://buy.stripe.com/fZu28q9sHdQpeZO11r93y01

## Prochaines étapes

1. Brancher Supabase Auth (magic link)
2. Configurer les webhooks Stripe
3. Construire Discover / Flares / Chat
