"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addFlare } from "@/lib/store";
import { trackFlareCreated } from "@/lib/analytics";

const CITIES = ["Bayonne", "Biarritz", "Anglet", "Bidart", "Saint-Jean-de-Luz"];
const PRESETS = [
  "Ce soir · discret",
  "Maintenant · urgent",
  "Soirée · découverte",
  "Après-midi · calme",
];

export default function CreateFlarePage() {
  const router = useRouter();
  const [city, setCity] = useState("Bayonne");
  const [intent, setIntent] = useState("");
  const [tag, setTag] = useState("Privé");
  const [duration, setDuration] = useState("2h");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("flare24_city");
    if (saved && CITIES.includes(saved)) setCity(saved);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = intent.trim();
    if (text.length < 3) {
      setError("Décris un peu ce que tu cherches (3 caractères min.).");
      return;
    }
    setError(null);
    addFlare({
      city,
      intent: text,
      tag,
      expires: duration,
    });
    trackFlareCreated(city, duration);
    setDone(true);
  }

  if (done) {
    return (
      <div className="px-5 py-8 pb-28 text-center pt-16">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <span className="text-emerald-400 text-3xl">✓</span>
        </div>
        <h1 className="heading-serif text-3xl mb-3">Flare allumé</h1>
        <p className="text-white/50 text-sm mb-8 max-w-sm mx-auto">
          Visible pendant {duration}. Les membres près de {city} peuvent répondre.
        </p>
        <button
          onClick={() => router.push("/discover")}
          className="luxury-btn min-h-[48px] bg-[#C5A46E] text-[#111] px-8 py-3 rounded-2xl text-sm font-semibold"
        >
          Voir les Flares
        </button>
      </div>
    );
  }

  return (
    <div className="px-5 py-8 pb-28">
      <h1 className="heading-serif text-4xl tracking-tight mb-2">Allumer un Flare</h1>
      <p className="text-white/50 text-sm mb-6">
        Simple. Discret. Ça expire tout seul.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs text-white/60 block mb-2">Ville</label>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCity(c);
                  localStorage.setItem("flare24_city", c);
                }}
                className={`min-h-[40px] px-3 rounded-full text-xs transition ${
                  city === c
                    ? "bg-[#C5A46E] text-[#111] font-semibold"
                    : "bg-white/5 text-white/60 border border-white/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-white/60 block mb-2">Raccourcis</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setIntent(p)}
                className="min-h-[40px] px-3 rounded-full text-xs bg-white/5 text-white/70 border border-white/10"
              >
                {p}
              </button>
            ))}
          </div>
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Ou écris librement…"
            rows={3}
            required
            className="w-full bg-white/5 border border-white/15 focus:border-[#C5A46E]/60 rounded-2xl px-4 py-3.5 text-sm outline-none resize-none"
          />
        </div>

        <div>
          <label className="text-xs text-white/60 block mb-2">Contexte</label>
          <div className="flex flex-wrap gap-2">
            {["Privé", "Hôtel", "Appartement", "Bar d'abord"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={`min-h-[40px] px-3 rounded-full text-xs transition ${
                  tag === t
                    ? "bg-[#C5A46E] text-[#111] font-semibold"
                    : "bg-white/5 text-white/60 border border-white/10"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-white/60 block mb-2">Durée</label>
          <div className="grid grid-cols-4 gap-2">
            {["1h", "2h", "4h", "Ce soir"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`min-h-[44px] rounded-2xl text-sm transition ${
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

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 rounded-2xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="luxury-btn w-full min-h-[52px] bg-[#C5A46E] hover:bg-[#B38B5A] text-[#111] py-4 rounded-3xl font-semibold"
        >
          Allumer le Flare
        </button>
      </form>
    </div>
  );
}
