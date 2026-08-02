"use client";

import { useEffect, useState } from "react";
import { getFlares, startConversation, type Flare } from "@/lib/store";

const seed: Flare[] = [
  {
    id: "f1",
    city: "Bayonne",
    intent: "Ce soir · discret",
    tag: "Hôtel",
    trust: 94,
    expires: "2h",
    verified: true,
  },
  {
    id: "f2",
    city: "Biarritz",
    intent: "Après-midi · intensité",
    tag: "Appartement",
    trust: 88,
    expires: "45min",
    verified: true,
  },
  {
    id: "f3",
    city: "Anglet",
    intent: "Soirée · découverte",
    tag: "Bar d'abord",
    trust: 91,
    expires: "3h",
    verified: true,
  },
  {
    id: "f4",
    city: "Saint-Jean-de-Luz",
    intent: "Maintenant · urgent",
    tag: "Privé",
    trust: 96,
    expires: "20min",
    verified: true,
  },
];

export default function DiscoverPage() {
  const [flares, setFlares] = useState<Flare[]>(seed);
  const [filter, setFilter] = useState("Tous");

  useEffect(() => {
    setFlares(getFlares());
  }, []);

  function respond(flare: Flare) {
    try {
      const convo = startConversation(flare);
      // Navigation forcée (plus fiable sur mobile que router.push)
      window.location.href = `/messages/${convo.id}`;
    } catch {
      window.location.href = "/messages";
    }
  }

  const filtered = flares.filter((f) => {
    if (filter === "Vérifiés") return f.verified;
    if (filter === "Ce soir") {
      return (
        f.intent.toLowerCase().includes("soir") ||
        f.expires.includes("h") ||
        f.expires.includes("min")
      );
    }
    return true;
  });

  return (
    <div className="px-5 py-8">
      <div className="mb-8">
        <h1 className="heading-serif text-4xl tracking-tight mb-2">Découvrir</h1>
        <p className="text-white/50 text-sm">Flares actives près de toi · Pays Basque</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 -mx-1 px-1">
        {["Tous", "Ce soir", "Vérifiés", "Proches"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition ${
              filter === f
                ? "bg-[#C5A46E] text-[#111]"
                : "bg-white/5 text-white/60 border border-white/10"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((flare) => (
          <article
            key={flare.id}
            className="glass rounded-3xl p-5 border border-white/5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{flare.city}</span>
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
              <div className="text-right">
                <div className="text-[#C5A46E] text-sm font-semibold">{flare.trust}</div>
                <div className="text-[10px] text-white/40">Trust</div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
                {flare.tag}
              </span>
              <span className="text-xs text-white/40">Expire dans {flare.expires}</span>
            </div>

            {!flare.mine && (
              <button
                type="button"
                onClick={() => respond(flare)}
                className="w-full bg-[#C5A46E] text-[#111111] py-3.5 rounded-2xl text-sm font-semibold active:scale-[0.98] transition"
              >
                Répondre au Flare
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
