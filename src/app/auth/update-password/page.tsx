"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sessionOk, setSessionOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function prepareSession() {
      try {
        // 1) Hash tokens from email link (implicit / older templates)
        if (typeof window !== "undefined" && window.location.hash) {
          const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const access_token = hash.get("access_token");
          const refresh_token = hash.get("refresh_token");
          const type = hash.get("type");

          if (access_token && refresh_token) {
            const { error: setErr } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (setErr) {
              setError("Lien expiré ou invalide. Demande un nouveau reset.");
              setChecking(false);
              return;
            }
            // Clean hash from URL
            window.history.replaceState(null, "", window.location.pathname);
            if (type && type !== "recovery") {
              // still allow password update if session exists
            }
          }
        }

        // 2) Query code (some configs land here with ?code=)
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exErr) {
            setError("Lien expiré ou déjà utilisé. Demande un nouveau reset.");
            setChecking(false);
            return;
          }
          window.history.replaceState(null, "", window.location.pathname);
        }

        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setError(
            "Session de reset absente. Rouvre le lien depuis l'email (ou redemande un reset)."
          );
          setSessionOk(false);
        } else {
          setSessionOk(true);
        }
      } catch {
        setError("Impossible de valider le lien de reset.");
      } finally {
        setChecking(false);
      }
    }

    void prepareSession();
  }, []);

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
        setError(
          updateError.message.includes("session")
            ? "Session expirée. Redemande un email de reset et utilise le lien tout de suite."
            : updateError.message
        );
        return;
      }

      setDone(true);
      setTimeout(() => {
        router.push("/login");
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
          {checking ? (
            <p className="text-center text-white/50 text-sm">Vérification du lien…</p>
          ) : done ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <span className="text-emerald-400 text-2xl">✓</span>
              </div>
              <h2 className="font-semibold text-xl mb-2">Mot de passe mis à jour</h2>
              <p className="text-white/60 text-sm">Tu peux te connecter.</p>
            </div>
          ) : !sessionOk ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-red-400 bg-red-500/10 rounded-2xl px-4 py-3">
                {error || "Lien invalide."}
              </p>
              <Link href="/login" className="text-sm text-[#C5A46E]">
                Retour à la connexion
              </Link>
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
                  placeholder="6 caractères minimum"
                  required
                  minLength={6}
                  autoComplete="new-password"
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
                  autoComplete="new-password"
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
