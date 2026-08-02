/**
 * Accès Gold.
 * - Fondateur : accès permanent sans paiement (whitelist).
 * - Plus tard : statut Stripe / Supabase user_metadata.gold.
 */

const FOUNDER_EMAILS = [
  "piratebtz64@gmail.com",
] as const;

export function isFounderEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const n = email.trim().toLowerCase();
  return FOUNDER_EMAILS.some((e) => e === n);
}

/**
 * Gold actif ?
 * Fondateur = toujours true.
 * Sinon : metadata / flag local (abonnement Stripe à brancher).
 */
export function isGoldMember(
  email: string | null | undefined,
  opts?: { stripeActive?: boolean; metaGold?: boolean }
): boolean {
  if (isFounderEmail(email)) return true;
  if (opts?.stripeActive) return true;
  if (opts?.metaGold) return true;
  return false;
}

export function goldLabel(
  email: string | null | undefined,
  opts?: { stripeActive?: boolean; metaGold?: boolean }
): string {
  if (isFounderEmail(email)) return "Gold · Fondateur";
  if (isGoldMember(email, opts)) return "Gold";
  return "Gold à activer";
}
