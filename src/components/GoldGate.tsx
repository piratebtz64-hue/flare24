"use client";

import Link from "next/link";

export function GoldGate({
  title = "Réservé aux membres Gold",
  subtitle = "Pour répondre, allumer un Flare ou chatter : passe Gold.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="glass rounded-3xl p-8 border border-[#C5A46E]/30 text-center">
      <div className="text-xs tracking-[2px] text-[#C5A46E] font-semibold mb-3">
        FLARE24 GOLD
      </div>
      <h2 className="heading-serif text-2xl mb-3">{title}</h2>
      <p className="text-white/55 text-sm mb-6 max-w-sm mx-auto">{subtitle}</p>
      <Link
        href="/pricing"
        className="inline-flex min-h-[48px] items-center justify-center px-8 rounded-2xl bg-[#C5A46E] text-[#111] text-sm font-semibold"
      >
        Passer Gold — 4,99 €/mois
      </Link>
      <p className="text-xs text-white/35 mt-4">
        Les 50 premiers inscrits : 1 mois offert (on t’active manuellement).
      </p>
    </div>
  );
}
