/**
 * ============================================================================ique d’accès Gold Flare24
 * ================================
 *
 * Gold = true si AU MOINS une condition :
 *   1. Email dans FOUNDER_EMAILS (code) — accès permanent fondateur
 *   2. profiles.is_gold = true dans Supabase — whitelist / 50 premiers / admin
 *   3. opts.stripeActive — abonnement Stripe actif (webhook plus tard)
 *   4. opts.metaGold — user_metadata.gold (secours)
 *
 * Ce qui est BLOQUÉ si Gold = false :
 *   - Répondre à un Flare (Discover → bouton)
 *   - Allumer un Flare (/create)
 *   - Ouvrir / envoyer dans une conversation (/messages/[id])
 *
 * Ce qui reste OUVERT sans Gold :
 *   - Inscription / login
 *   - Voir la liste des Flares (Discover)
 *   - Profil, pricing, pages légales
 *
 * Activer quelqu’un (50 premiers) dans Supabase SQL :
 *   update public.profiles
 *   set is_gold = true
 *   where id = (
 *     select id from auth.users where email = 'email@exemple.com'
 *   );
 */

const FOUNDER_EMAILS = ["piratebtz64@gmail.com"] as const;

export function isFounderEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const n = email.trim().toLowerCase();
  return FOUNDER_EMAILS.some((e) => e === n);
}

export type GoldOpts = {
  /** profiles.is_gold depuis Supabase */
  dbGold?: boolean;
  /** Abonnement Stripe actif */
  stripeActive?: boolean;
  /** auth.user_metadata.gold */
  metaGold?: boolean;
};

export function isGoldMember(
  email: string | null | undefined,
  opts?: GoldOpts
): boolean {
  if (isFounderEmail(email)) return true;
  if (opts?.dbGold) return true;
  if (opts?.stripeActive) return true;
  if (opts?.metaGold) return true;
  return false;
}

export function goldLabel(
  email: string | null | undefined,
  opts?: GoldOpts
): string {
  if (isFounderEmail(email)) return "Gold · Fondateur";
  if (isGoldMember(email, opts)) return "Gold";
  return "Gold à activer";
}

export const GOLD_BLOCK_SUMMARY =
  "Sans Gold : voir les Flares OK. Répondre / créer / messager = bloqué → /pricing.";
