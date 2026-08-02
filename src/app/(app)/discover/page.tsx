"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getFlares, type Flare } from "@/lib/store";
import { trackFilter, trackFlareRespond } from "@/lib/analytics";
import {
  formatTrust,
  TRUST_EXPLAIN_LINES,
  TRUST_EXPLAIN_SHORT,
} from "@/lib/trust";

const FILTERS = ["Tous", "Ce soir", "Vérifiés", "Proches"] as const;
type Filter = (typeof FILTERS)[number];

const LOCAL_CITIES = ["Bayonne", "Anglet", "Biarritz", "Bidart"];

export default function DiscoverPage() {
  const [filter, setFilter] = useState<Filter>("Tous");
  const [flares, setFlares] = useState<Flare[]>([]);
  const [ready, setReady] = useState(false);
  const [showTrustInfo, setShowTrustInfo] = useState(false);

  useEffect(() => {
    setFlares(getFlares());
    setReady(true);
  }, []);

  const filtered = useMemo(() => {
    return flares.filter((f) => {
      if (filter === "Vérifiés") return f.verified;
      if (filter === "Ce soir") {
        const t = `${f.intent} ${f.expires}`.toLowerCase();
        return (
          t.includes("soir") ||
          t.includes("maintenant") ||
          t.includes("urgent") ||
          /\d+h|\d+min/.test(t)
        );
      }
      if (filter === "Proches") {
        return LOCAL_CITIES.some(
          (c) => f.city.toLowerCase() === c.toLowerCase()
        );
      }
      return true;
    });
  }, [flares, filter]);

  function onFilter(f: Filter) {
    setFilter(f);
    if (f !== "Tous") trackFilter(f);
  }

  return (
    <div className="px-5 py-8 pb-28">
      <div className="mb-6">
        <h1 className="heading-serif text-4xl tracking-tight mb-2">Découvrir</h1>
        <p className="text-white/50 text-sm">
          Flares près de toi · Pays Basque
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-3 -mx-1 px-1 scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onFilter(f)}
            className={`shrink-0 min-h-[44px] px-5 rounded-full text-sm font-medium transition active:scale-[0.98] ${
              filter === f
                ? "bg-[#C5A46E] text-[#111]"
                : "bg-white/5 text-white/60 border border-white/10"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowTrustInfo((v) => !v)}
        className="mb-4 text-left text-xs text-white/40 hover:text-white/60"
      >
        Trust = note /5 · {showTrustInfo ? "masquer" : "comment ça marche ?"}
      </button>

      {showTrustInfo && (
        <div className="glass rounded-2xl p-4 mb-5 border border-white/10 text-xs text-white/60 space-y-2">
          <p className="text-white/80">{TRUST_EXPLAIN_SHORT}</p>
          <ul className="list-disc pl-4 space-y-1">
            {TRUST_EXPLAIN_LINES.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {!ready ? (
        <p className="text-center text-white/40 text-sm py-16">Chargement…</p>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center">
          <p className="text-white/60 text-sm mb-4">
            Aucun Flare pour ce filtre.
          </p>
          <button
            type="button"
            onClick={() => onFilter("Tous")}
            className="text-sm text-[#C5A46E]"
          >
            Voir tous
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((flare) => (
            <article
              key={flare.id}
              className="glass rounded-3xl p-5 border border-white/5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-base">{flare.city}</span>
                    {flare.verified && (
                      <span className="text-[10px] uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                        Vérifié
                      </span>
                    )}
                    {flare.mine && (
                      <span className="text-[10px] uppercase tracking-wider text-[#C5A46E] bg-[#C5A46E]/10 px-2 py-0.5 rounded-full">
                        Toi
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm">{flare.intent}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[#C5A46E] text-sm font-semibold">
                    {formatTrust(flare.trust)}
                  </div>
                  <div className="text-[10px] text-white/40">Trust</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 gap-2">
                <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                  {flare.tag}
                </span>
                <span className="text-xs text-white/40">
                  Expire · {flare.expires}
                </span>
              </div>

              <Link
                href={`/messages/${flare.id}?city=${encodeURIComponent(flare.city)}&intent=${encodeURIComponent(flare.intent)}`}
                onClick={() => trackFlareRespond(flare.city)}
                className="block w-full text-center min-h-[48px] leading-[48px] bg-[#C5A46E] text-[#111111] rounded-2xl text-sm font-semibold active:opacity-80"
              >
                Répondre au Flare
              </Link>
            </article>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/create"
          className="inline-flex min-h-[48px] items-center justify-center px-6 rounded-2xl border border-[#C5A46E]/40 text-[#C5A46E] text-sm font-medium"
        >
          + Allumer un Flare
        </Link>
      </div>
    </div>
  );
}
