/**
 * Trust Flare24 — formule (rééquilibrée, notes plus réalistes)
 *
 *   T = clamp( 1 + V + P + A + H − R , 1 , 5 )
 *
 * Base 1 (plus sévère) pour éviter que tout le monde soit à 5/5.
 *
 *   V = 1 si verified, sinon 0
 *   P = 1 si ville + activité Flare, sinon 0
 *   A = 1 si accountAgeDays ≥ 14 (2 semaines, plus exigeant)
 *   H = historique (0, 1 ou 2) — plus dur à atteindre
 *   R = min(reportCount, 4)
 *
 * Historique H :
 *   H = 0 si messagesSent < 5
 *   H = 1 si messagesSent ≥ 5 et conversations ≥ 2
 *   H = 2 si messagesSent ≥ 20 et conversations ≥ 4
 *
 * Objectif de distribution typique :
 *   2/5 débutant · 3/5 correct · 4/5 solide · 5/5 rare
 */

export type TrustInput = {
  verified?: boolean;
  hasCity?: boolean;
  hasActivity?: boolean;
  accountAgeDays?: number;
  reportCount?: number;
  messagesSent?: number;
  conversations?: number;
};

export function historyBonus(messagesSent = 0, conversations = 0): number {
  if (messagesSent >= 20 && conversations >= 4) return 2;
  if (messagesSent >= 5 && conversations >= 2) return 1;
  return 0;
}

export function computeTrust(input: TrustInput = {}): number {
  const V = input.verified ? 1 : 0;
  const P = input.hasCity && input.hasActivity ? 1 : 0;
  const A = (input.accountAgeDays ?? 0) >= 14 ? 1 : 0;
  const H = historyBonus(input.messagesSent ?? 0, input.conversations ?? 0);
  const R = Math.min(Math.max(0, input.reportCount ?? 0), 4);

  // Base 1 → max théorique sans reports = 1+1+1+1+2 = 6 → clamp 5 (rare)
  const raw = 1 + V + P + A + H - R;
  return Math.min(5, Math.max(1, Math.round(raw)));
}

export function formatTrust(score: number): string {
  const n = score > 5 ? Math.min(5, Math.max(1, Math.round(score / 20))) : score;
  return `${n}/5`;
}

export const TRUST_FORMULA =
  "T = clamp(1 + V + P + A + H − R, 1, 5)";

export const TRUST_EXPLAIN_SHORT =
  "Trust 1–5 : fiabilité réelle. 5/5 est rare. Pas un score de popularité.";

export const TRUST_EXPLAIN_LINES = [
  "Formule : T = clamp(1 + V + P + A + H − R, 1, 5)",
  "V = 1 si vérifié",
  "P = 1 si ville + activité Flare",
  "A = 1 si compte ≥ 14 jours",
  "H = 0 / 1 / 2 (historique d’échanges)",
  "  · H=1 si ≥ 5 messages et ≥ 2 conversations",
  "  · H=2 si ≥ 20 messages et ≥ 4 conversations",
  "R = signalements (max 4)",
  "Ex. H=0 + vérifié + profil → souvent 3/5",
  "5/5 = vérifié + profil + ancien + gros historique",
] as const;
