/** Promo lancement : 50 premiers comptes → 1 mois Gold (manuel / SQL). */

export const LAUNCH_LIMIT = 50;

export const LAUNCH_COPY = {
  badge: "Lancement",
  title: "50 premiers. Pas 51.",
  body: "Les 50 premiers comptes inscrits : 1 mois Gold offert. Ensuite, tarif normal 4,99 €/mois.",
  short: "50 premiers inscrits → 1 mois Gold offert",
  cta: "S'inscrire pour en profiter",
} as const;

/**
 * Compte approximatif des profils (auth requis).
 * Retourne null si impossible (anon / erreur).
 */
export async function countProfiles(
  fetchCount: () => Promise<number | null>
): Promise<number | null> {
  try {
    return await fetchCount();
  } catch {
    return null;
  }
}

export function launchSlotsLeft(memberCount: number | null): number | null {
  if (memberCount == null || Number.isNaN(memberCount)) return null;
  return Math.max(0, LAUNCH_LIMIT - memberCount);
}
