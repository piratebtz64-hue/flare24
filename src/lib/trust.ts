/**
 * Trust Flare24
 *
 *   T = clamp(1 + V + P + A + H − R, 1, 5)
 *
 * Base 1 pour éviter que tout le monde soit à 5/5.
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

  const raw = 1 + V + P + A + H - R;
  return Math.min(5, Math.max(1, Math.round(raw)));
}

/** Convertit un ancien score 0–100 ou un score déjà 1–5 vers 1–5. */
export function normalizeTrust(raw: number, verified = false): number {
  if (!Number.isFinite(raw)) return 2;
  if (raw > 5) {
    // legacy 0–100 → map approximatif vers 1–5
    if (raw >= 95) return verified ? 4 : 3;
    if (raw >= 90) return 3;
    if (raw >= 80) return 3;
    if (raw >= 70) return 2;
    return 2;
  }
  return Math.min(5, Math.max(1, Math.round(raw)));
}

export function formatTrust(score: number): string {
  return `${normalizeTrust(score)}/5`;
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
  "Notes typiques : 2/5 · 3/5 · 4/5 — 5/5 rare",
] as const;

/** Incrémente si on change le schéma Trust (force refresh client). */
export const TRUST_SCHEMA_VERSION = 3;
