import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-12 max-w-2xl mx-auto">
      <Link href="/" className="text-sm text-[#C5A46E] mb-8 inline-block">← Accueil</Link>
      <h1 className="heading-serif text-4xl mb-6">Confidentialité</h1>
      <div className="space-y-4 text-white/60 text-sm leading-relaxed">
        <p>
          Flare24 est conçu pour la discrétion. Nous collectons uniquement les données
          nécessaires au fonctionnement du service (compte, abonnement, vérification).
        </p>
        <p>
          Les messages et contenus sensibles sont destinés à être chiffrés.
          Les Flares expirent automatiquement.
        </p>
        <p>
          Tu peux demander la suppression de ton compte à tout moment via le profil
          ou par contact.
        </p>
        <p className="text-white/40 text-xs pt-4">
          Document provisoire — à finaliser avec un conseil juridique avant mise en production publique.
        </p>
      </div>
    </div>
  );
}
