/**
 * Trust score Flare24 — échelle 1 à 5 (jamais un faux 0–100).
 *
 * Objectif : signal discret de fiabilité, pas un classement marketing.
 *
 * Formule (somme plafonnée à 5) :
 *   base          2
 * + email vérifié +1   (compte confirmé / badge vérifié)
 * + profil complet +1  (ville renseignée + au moins 1 flare ou activité)
 * + ancienneté     +1  (compte > 7 jours)  [si date fournie]
 * − signalements   −1  par report (min 1)
 *
 * Résultat final : entier entre 1 et 5.
 */

export type TrustInput = {
  verified?: boolean;
  hasCity?: boolean;
  hasActivity?: boolean;
  accountAgeDays?: number;
  reportCount?: number;
};

export function computeTrust(input: TrustInput = {}): number {
  let score = 2; // base honnête pour tout nouveau compte

  if (input.verified) score += 1;
  if (input.hasCity && input.hasActivity) score += 1;
  if ((input.accountAgeDays ?? 0) >= 7) score += 1;

  const reports = Math.max(0, input.reportCount ?? 0);
  score -= reports;

  return Math.min(5, Math.max(1, Math.round(score)));
}

export function formatTrust(score: number): string {
  const n = score > 5 ? Math.min(5, Math.max(1, Math.round(score / 20))) : score;
  return `${n}/5`;
}

/** Texte court pour l’UI (Discover / Profil). */
export const TRUST_EXPLAIN_SHORT =
  "Trust 1–5 : fiabilité estimée (vérif, profil, ancienneté, signalements). Pas un classement de popularité.";

export const TRUST_EXPLAIN_LINES = [
  "2 de base pour tout le monde",
  "+1 si compte / profil vérifié",
  "+1 si ville + activité (Flare ou message)",
  "+1 si compte de plus de 7 jours",
  "−1 par signalement (minimum 1)",
  "Résultat affiché : x/5",
] as const;
