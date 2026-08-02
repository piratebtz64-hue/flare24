"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setDone(true);
      setTimeout(() => {
        router.push("/discover");
        router.refresh();
      }, 1500);
    } catch {
      setError("Impossible de mettre à jour le mot de passe.");
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
          <h1 className="heading-serif text-3xl tracking-tight mb-2">
            Nouveau mot de passe
          </h1>
          <p className="text-white/50 text-sm">Choisis un mot de passe sécurisé</p>
        </div>

        <div className="glass rounded-3xl p-8">
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <span className="text-emerald-400 text-2xl">✓</span>
              </div>
              <h2 className="font-semibold text-xl mb-2">Mot de passe mis à jour</h2>
              <p className="text-white/60 text-sm">Redirection…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-white/60 block mb-1.5">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/15 focus:border-[#C5A46E]/60 rounded-2xl px-4 py-3.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 block mb-1.5">Confirmer</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/15 focus:border-[#C5A46E]/60 rounded-2xl px-4 py-3.5 text-sm outline-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 rounded-2xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="luxury-btn w-full bg-[#C5A46E] hover:bg-[#B38B5A] text-[#111] py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60"
              >
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
