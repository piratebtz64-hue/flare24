import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flare24 — L'espace privé pour les rencontres intenses",
  description: "Flare24 est un espace privé et sélectif pour des rencontres intenses, temporaires et discrètes. Membres vérifiés uniquement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-[#0A0A0A] text-[#F5F5F5] antialiased">
        {children}
      </body>
    </html>
  );
}
