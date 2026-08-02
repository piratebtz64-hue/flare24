import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-12 max-w-2xl mx-auto">
      <Link href="/" className="text-sm text-[#C5A46E] mb-8 inline-block">← Accueil</Link>
      <h1 className="heading-serif text-4xl mb-6">Conditions d'utilisation</h1>
      <div className="space-y-4 text-white/60 text-sm leading-relaxed">
        <p>
          Flare24 est un service réservé aux adultes (18 ans et plus). Les membres
          s'engagent à un usage respectueux, consensuel et légal.
        </p>
        <p>
          Les faux profils, le harcèlement et tout contenu illégal sont interdits
          et entraînent l'exclusion du service.
        </p>
        <p>
          L'abonnement Gold est résiliable à tout moment via le portail Stripe.
        </p>
      </div>
    </div>
  );
}
