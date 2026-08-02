"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "password" | "magic";

function mapError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("rate limit")) {
    return "Trop d'emails envoyés. Utilise le mot de passe, ou réessaie dans 1 heure.";
  }
  if (m.includes("invalid login")) {
    return "Email ou mot de passe incorrect.";
  }
  if (m.includes("already registered") || m.includes("user already")) {
    return "Ce compte existe déjà. Connecte-toi avec ton mot de passe.";
  }
  if (m.includes("password")) {
    return "Le mot de passe doit faire au moins 6 caractères.";
  }
  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || password.length < 6) {
      setError("Email valide et mot de passe (6 caractères min.) requis.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) {
          setError(mapError(signUpError.message));
          return;
        }
        // Sur certains projets, la confirmation email est requise
        setSent(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError(mapError(signInError.message));
          return;
        }
        router.push("/discover");
        router.refresh();
      }
    } catch {
      setError("Erreur de connexion. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagic(e: React.FormEvent) {
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
        setError(mapError(authError.message));
        return;
      }

      setSent(true);
    } catch {
      setError("Impossible d'envoyer l'email. Réessaie plus tard.");
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
            {isSignUp ? "Créer un compte" : "Connexion"}
          </h1>
          <p className="text-white/50 text-sm">Accès réservé aux membres</p>
        </div>

        <div className="glass rounded-3xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <span className="text-emerald-400 text-2xl">✓</span>
              </div>
              <h2 className="font-semibold text-xl mb-2">Compte créé</h2>
              <p className="text-white/60 text-sm mb-6">
                Si la confirmation email est activée, vérifie ta boîte mail.
                Sinon, reconnecte-toi avec ton mot de passe.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setIsSignUp(false);
                  setMode("password");
                }}
                className="text-sm text-[#C5A46E] hover:underline"
              >
                Se connecter
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-6 p-1 rounded-2xl bg-white/5">
                <button
                  type="button"
                  onClick={() => setMode("password")}
                  className={`flex-1 text-sm py-2 rounded-xl transition ${
                    mode === "password"
                      ? "bg-[#C5A46E] text-[#111] font-semibold"
                      : "text-white/50"
                  }`}
                >
                  Mot de passe
                </button>
                <button
                  type="button"
                  onClick={() => setMode("magic")}
                  className={`flex-1 text-sm py-2 rounded-xl transition ${
                    mode === "magic"
                      ? "bg-[#C5A46E] text-[#111] font-semibold"
                      : "text-white/50"
                  }`}
                >
                  Lien email
                </button>
              </div>

              <form
                onSubmit={mode === "password" ? handlePassword : handleMagic}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs text-white/60 block mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    required
                    className="w-full bg-white/5 border border-white/15 focus:border-[#C5A46E]/60 rounded-2xl px-4 py-3.5 text-sm outline-none transition"
                  />
                </div>

                {mode === "password" && (
                  <div>
                    <label className="text-xs text-white/60 block mb-1.5">Mot de passe</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full bg-white/5 border border-white/15 focus:border-[#C5A46E]/60 rounded-2xl px-4 py-3.5 text-sm outline-none transition"
                    />
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 rounded-2xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="luxury-btn w-full bg-[#C5A46E] hover:bg-[#B38B5A] text-[#111111] py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60"
                >
                  {loading
                    ? "Chargement..."
                    : mode === "magic"
                      ? "Recevoir le lien"
                      : isSignUp
                        ? "Créer mon compte"
                        : "Se connecter"}
                </button>
              </form>

              {mode === "password" && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="w-full text-center text-sm text-white/50 mt-4 hover:text-[#C5A46E] transition"
                >
                  {isSignUp
                    ? "Déjà un compte ? Se connecter"
                    : "Pas de compte ? Créer un compte"}
                </button>
              )}
            </>
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
