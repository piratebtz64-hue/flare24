/**
 * Trust Flare24 — formule exacte
 *
 *   T = clamp( 2 + V + P + A + H − R , 1 , 5 )
 *
 * où :
 *   V = 1 si verified, sinon 0
 *   P = 1 si profil utilisable (ville + activité Flare), sinon 0
 *   A = 1 si accountAgeDays ≥ 7, sinon 0
 *   H = historique d'échanges (0, 1 ou 2) — voir ci-dessous
 *   R = min(reportCount, 4)  // plafonné pour ne pas écraser tout
 *
 * Historique H :
 *   messagesSent = nombre de messages envoyés par l'utilisateur
 *   conversations = nombre de conversations distinctes
 *   H = 0 si messagesSent < 3
 *   H = 1 si messagesSent ≥ 3 et conversations ≥ 1
 *   H = 2 si messagesSent ≥ 10 et conversations ≥ 2
 *
 * clamp(x,1,5) = max(1, min(5, round(x)))
 *
 * Affichage : "T/5"
 */

export type TrustInput = {
  verified?: boolean;
  hasCity?: boolean;
  hasActivity?: boolean;
  accountAgeDays?: number;
  reportCount?: number;
  /** Messages envoyés (historique). */
  messagesSent?: number;
  /** Conversations distinctes. */
  conversations?: number;
};

export function historyBonus(messagesSent = 0, conversations = 0): number {
  if (messagesSent >= 10 && conversations >= 2) return 2;
  if (messagesSent >= 3 && conversations >= 1) return 1;
  return 0;
}

export function computeTrust(input: TrustInput = {}): number {
  const V = input.verified ? 1 : 0;
  const P = input.hasCity && input.hasActivity ? 1 : 0;
  const A = (input.accountAgeDays ?? 0) >= 7 ? 1 : 0;
  const H = historyBonus(input.messagesSent ?? 0, input.conversations ?? 0);
  const R = Math.min(Math.max(0, input.reportCount ?? 0), 4);

  const raw = 2 + V + P + A + H - R;
  return Math.min(5, Math.max(1, Math.round(raw)));
}

export function formatTrust(score: number): string {
  const n = score > 5 ? Math.min(5, Math.max(1, Math.round(score / 20))) : score;
  return `${n}/5`;
}

/** Formule affichée telle quelle dans l’UI. */
export const TRUST_FORMULA =
  "T = clamp(2 + V + P + A + H − R, 1, 5)";

export const TRUST_EXPLAIN_SHORT =
  "Trust 1–5 : fiabilité (vérif, profil, ancienneté, historique d’échanges, signalements). Pas un score de popularité.";

export const TRUST_EXPLAIN_LINES = [
  "Formule : T = clamp(2 + V + P + A + H − R, 1, 5)",
  "V = 1 si vérifié",
  "P = 1 si ville + activité Flare",
  "A = 1 si compte ≥ 7 jours",
  "H = 0 / 1 / 2 selon l’historique d’échanges",
  "  · H=1 si ≥ 3 messages et ≥ 1 conversation",
  "  · H=2 si ≥ 10 messages et ≥ 2 conversations",
  "R = nombre de signalements (max 4)",
  "Résultat affiché : T/5",
] as const;
