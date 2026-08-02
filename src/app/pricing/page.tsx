"use client";

import { useEffect } from "react";
import Link from "next/link";
import { trackGoldView } from "@/lib/analytics";

export default function PricingPage() {
  useEffect(() => {
    trackGoldView();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <nav className="border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#C5A46E] to-[#A67C52] flex items-center justify-center">
              <span className="text-[#0A0A0A] font-bold text-lg">F</span>
            </div>
            <span className="heading-serif text-2xl tracking-tight">Flare24</span>
          </Link>
          <Link href="/login" className="text-sm text-white/70 hover:text-white">
            Se connecter
          </Link>
        </div>
      </nav>

      <section className="max-w-xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="text-xs tracking-[2px] text-[#C5A46E] font-semibold mb-4">
          FLARE24 GOLD
        </div>
        <h1 className="heading-serif text-5xl tracking-tight mb-4">Accès membre</h1>
        <p className="text-white/60 mb-10">
          Pour voir les Flares, en allumer, et répondre.
          Simple. Résiliable quand tu veux.
        </p>

        <div className="glass rounded-[2rem] p-10 border border-[#C5A46E]/25 text-left">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-semibold text-[#C5A46E]">4,99 €</span>
            <span className="text-white/50">/ mois</span>
          </div>
          <p className="text-xs text-white/40 mb-6">Moins qu’un verre. Accès complet.</p>

          <ul className="space-y-3 text-sm text-white/80 mb-8">
            <li className="flex items-center gap-3">
              <span className="text-[#C5A46E]">✓</span> Voir les Flares actifs près de toi
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#C5A46E]">✓</span> Allumer tes propres Flares
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#C5A46E]">✓</span> Répondre et chatter en privé
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#C5A46E]">✓</span> Profil discret, résiliation libre
            </li>
          </ul>

          <a
            href="https://buy.stripe.com/fZu28q9sHdQpeZO11r93y01"
            className="luxury-btn block w-full text-center bg-[#C5A46E] hover:bg-[#B38B5A] text-[#111111] py-4 rounded-3xl font-semibold"
          >
            S'abonner — 4,99 €/mois
          </a>

          <p className="text-xs text-white/40 text-center mt-4">
            Paiement sécurisé Stripe. Annulation à tout moment.
          </p>
        </div>

        <p className="text-sm text-white/40 mt-8">
          Déjà membre ?{" "}
          <Link href="/login" className="text-[#C5A46E] hover:underline">
            Se connecter
          </Link>
        </p>
      </section>
    </div>
  );
}
