"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Impossible d'envoyer l'email. Réessaie dans un instant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C5A46E] to-[#A67C52] flex items-center justify-center">
              <span className="text-[#0A0A0A] font-bold text-lg">F</span>
            </div>
            <span className="heading-serif text-2xl">Flare24</span>
          </Link>
          <h1 className="heading-serif text-3xl tracking-tight mb-2">Connexion</h1>
          <p className="text-white/50 text-sm">Accès réservé aux membres</p>
        </div>

        <div className="glass rounded-3xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <span className="text-emerald-400 text-2xl">✓</span>
              </div>
              <h2 className="font-semibold text-xl mb-2">Email envoyé</h2>
              <p className="text-white/60 text-sm mb-6">
                Vérifie ta boîte mail ({email}) et clique sur le lien pour te connecter.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-[#C5A46E] hover:underline"
              >
                Utiliser une autre adresse
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs text-white/60 block mb-1.5">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  required
                  className="w-full bg-white/5 border border-white/15 focus:border-[#C5A46E]/60 rounded-2xl px-4 py-3.5 text-sm outline-none transition"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 rounded-2xl px-4 py-3">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="luxury-btn w-full bg-[#C5A46E] hover:bg-[#B38B5A] text-[#111111] py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60"
              >
                {loading ? "Envoi..." : "Recevoir le lien de connexion"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          Pas encore membre ?{" "}
          <Link href="/pricing" className="text-[#C5A46E] hover:underline">
            Voir les tarifs
          </Link>
        </p>
      </div>
    </div>
  );
}
