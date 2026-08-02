"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateFlarePage() {
  const router = useRouter();
  const [city, setCity] = useState("Bayonne");
  const [intent, setIntent] = useState("");
  const [duration, setDuration] = useState("2h");
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!intent.trim()) return;
    setDone(true);
  }

  if (done) {
    return (
      <div className="px-5 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <span className="text-emerald-400 text-3xl">✓</span>
        </div>
        <h1 className="heading-serif text-3xl mb-3">Flare allumé</h1>
        <p className="text-white/50 text-sm mb-8 max-w-sm mx-auto">
          Ton Flare est visible pendant {duration}. Les réponses arriveront dans Messages.
        </p>
        <button
          onClick={() => router.push("/discover")}
          className="luxury-btn bg-[#C5A46E] text-[#111] px-8 py-3 rounded-2xl text-sm font-semibold"
        >
          Voir les Flares
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 py-8">
      <h1 className="heading-serif text-4xl tracking-tight mb-2">Allumer un Flare</h1>
      <p className="text-white/50 text-sm mb-8">
        Dis ce que tu cherches. Ça expire tout seul.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs text-white/60 block mb-1.5">Ville</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3.5 text-sm outline-none"
          >
            {["Bayonne", "Biarritz", "Anglet", "Bidart", "Saint-Jean-de-Luz"].map(
              (c) => (
                <option key={c} value={c} className="bg-[#111]">
                  {c}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="text-xs text-white/60 block mb-1.5">Ce que tu cherches</label>
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Ex. Ce soir, discret, hôtel…"
            rows={3}
            required
            className="w-full bg-white/5 border border-white/15 focus:border-[#C5A46E]/60 rounded-2xl px-4 py-3.5 text-sm outline-none resize-none"
          />
        </div>

        <div>
          <label className="text-xs text-white/60 block mb-1.5">Durée</label>
          <div className="flex gap-2">
            {["1h", "2h", "4h", "Ce soir"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`flex-1 py-2.5 rounded-2xl text-sm transition ${
                  duration === d
                    ? "bg-[#C5A46E] text-[#111] font-semibold"
                    : "bg-white/5 text-white/60 border border-white/10"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="luxury-btn w-full bg-[#C5A46E] hover:bg-[#B38B5A] text-[#111] py-4 rounded-3xl font-semibold"
        >
          Allumer le Flare
        </button>
      </form>
    </div>
  );
}
