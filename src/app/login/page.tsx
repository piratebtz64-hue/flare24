"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  trackForgotPassword,
  trackLoginSuccess,
  trackSignupStarted,
} from "@/lib/analytics";

type Mode = "password" | "magic" | "forgot";

function mapError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("rate limit") || m.includes("email rate")) {
    return "Trop d'emails envoyés. Utilise le mot de passe, ou réessaie dans 1 h.";
  }
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (m.includes("already registered") || m.includes("user already")) {
    return "Ce compte existe déjà. Connecte-toi avec ton mot de passe.";
  }
  if (m.includes("password") && m.includes("6")) {
    return "Le mot de passe doit faire au moins 6 caractères.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Problème réseau. Vérifie ta connexion et réessaie.";
  }
  return "Une erreur est survenue. Réessaie dans un instant.";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ageOk, setAgeOk] = useState(false);

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || password.length < 6) {
      setError("Email valide et mot de passe (6 caractères min.) requis.");
      return;
    }
    if (isSignUp && !ageOk) {
      setError("Tu dois confirmer avoir 18 ans ou plus.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      if (isSignUp) {
        trackSignupStarted();
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
        trackLoginSuccess("password");
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
    if (!email.includes("@")) {
      setError("Entre une adresse email valide.");
      return;
    }

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

      trackLoginSuccess("magic");
      setSent(true);
    } catch {
      setError("Impossible d'envoyer l'email. Réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Entre une adresse email valide.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/update-password`,
        }
      );

      if (resetError) {
        setError(mapError(resetError.message));
        return;
      }

      trackForgotPassword();
      setResetSent(true);
    } catch {
      setError("Impossible d'envoyer l'email. Réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  }

  const title =
    mode === "forgot"
      ? "Mot de passe oublié"
      : isSignUp
        ? "Créer un compte"
        : "Connexion";

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C5A46E] to-[#A67C52] flex items-center justify-center">
              <span className="text-[#0A0A0A] font-bold text-lg">F</span>
            </div>
            <span className="heading-serif text-2xl">Flare24</span>
          </Link>
          <h1 className="heading-serif text-3xl tracking-tight mb-2">{title}</h1>
          <p className="text-white/50 text-sm">
            {mode === "forgot"
              ? "On t'envoie un lien pour en choisir un nouveau"
              : "Cercle discret · Pays Basque · 18+"}
          </p>
        </div>

        <div className="glass rounded-3xl p-8">
          {resetSent ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <span className="text-emerald-400 text-2xl">✓</span>
              </div>
              <h2 className="font-semibold text-xl mb-2">Email envoyé</h2>
              <p className="text-white/60 text-sm mb-6">
                Si un compte existe pour {email}, tu recevras un lien. Vérifie
                aussi les spams.
              </p>
              <button
                onClick={() => {
                  setResetSent(false);
                  setMode("password");
                  setIsSignUp(false);
                }}
                className="text-sm text-[#C5A46E]"
              >
                Retour à la connexion
              </button>
            </div>
          ) : sent ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <span className="text-emerald-400 text-2xl">✓</span>
              </div>
              <h2 className="font-semibold text-xl mb-2">C'est bon</h2>
              <p className="text-white/60 text-sm mb-6">
                {mode === "magic"
                  ? "Ouvre le lien reçu par email pour entrer."
                  : "Tu peux te connecter avec ton mot de passe. Vérifie ta boîte si un email de confirmation est demandé."}
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setIsSignUp(false);
                  setMode("password");
                }}
                className="text-sm text-[#C5A46E]"
              >
                Se connecter
              </button>
            </div>
          ) : (
            <>
              {mode === "password" && (
                <p className="text-xs text-white/40 mb-4 leading-relaxed">
                  {isSignUp
                    ? "Crée un compte avec email + mot de passe. Plus simple que le lien magique (moins de limites)."
                    : "Astuce : le mot de passe évite les blocages d'emails. Lien email = option secondaire."}
                </p>
              )}

              {mode !== "forgot" && (
                <div className="flex gap-2 mb-6 p-1 rounded-2xl bg-white/5">
                  <button
                    type="button"
                    onClick={() => setMode("password")}
                    className={`flex-1 text-sm py-2.5 rounded-xl transition ${
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
                    className={`flex-1 text-sm py-2.5 rounded-xl transition ${
                      mode === "magic"
                        ? "bg-[#C5A46E] text-[#111] font-semibold"
                        : "text-white/50"
                    }`}
                  >
                    Lien email
                  </button>
                </div>
              )}

              <form
                onSubmit={
                  mode === "forgot"
                    ? handleForgot
                    : mode === "magic"
                      ? handleMagic
                      : handlePassword
                }
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
                    autoComplete="email"
                    className="w-full bg-white/5 border border-white/15 focus:border-[#C5A46E]/60 rounded-2xl px-4 py-3.5 text-sm outline-none"
                  />
                </div>

                {mode === "password" && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-white/60">Mot de passe</label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode("forgot");
                            setError(null);
                          }}
                          className="text-xs text-[#C5A46E]"
                        >
                          Oublié ?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6 caractères minimum"
                      required
                      minLength={6}
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      className="w-full bg-white/5 border border-white/15 focus:border-[#C5A46E]/60 rounded-2xl px-4 py-3.5 text-sm outline-none"
                    />
                  </div>
                )}

                {mode === "password" && isSignUp && (
                  <label className="flex items-start gap-3 text-xs text-white/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ageOk}
                      onChange={(e) => setAgeOk(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>J'ai 18 ans ou plus. Contenu réservé aux adultes consentants.</span>
                  </label>
                )}

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 rounded-2xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="luxury-btn w-full min-h-[48px] bg-[#C5A46E] hover:bg-[#B38B5A] text-[#111111] py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-60"
                >
                  {loading
                    ? "Chargement..."
                    : mode === "forgot"
                      ? "Envoyer le lien"
                      : mode === "magic"
                        ? "Recevoir le lien"
                        : isSignUp
                          ? "Créer mon compte"
                          : "Se connecter"}
                </button>
              </form>

              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("password");
                    setError(null);
                  }}
                  className="w-full text-center text-sm text-white/50 mt-4"
                >
                  Retour à la connexion
                </button>
              )}

              {mode === "password" && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="w-full text-center text-sm text-white/50 mt-4"
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
          <Link href="/pricing" className="text-[#C5A46E]">
            Voir les tarifs Gold
          </Link>
          {" · "}
          <Link href="/legal/terms" className="hover:text-white/60">
            CGU
          </Link>
        </p>
      </div>
    </div>
  );
}
