import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-12 max-w-2xl mx-auto">
      <Link href="/" className="text-sm text-[#C5A46E] mb-8 inline-block">← Accueil</Link>
      <h1 className="heading-serif text-4xl mb-6">Confidentialité</h1>
      <div className="space-y-4 text-white/60 text-sm leading-relaxed">
        <p>
          Flare24 est conçu pour la discrétion. Nous collectons uniquement les données
          nécessaires au fonctionnement du service : compte, abonnement et vérification.
        </p>
        <p>
          Les messages et contenus sensibles sont traités avec un niveau de protection élevé.
          Les Flares expirent automatiquement.
        </p>
        <p>
          Tu peux demander la suppression de ton compte à tout moment depuis ton profil
          ou par e-mail.
        </p>
      </div>
    </div>
  );
}
