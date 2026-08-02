import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AuthHashCatcher } from "@/components/AuthHashCatcher";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flare24 — Rencontres discrètes Pays Basque",
  description:
    "Cercle privé pour adultes. Flares temporaires, près de toi. Discrétion totale.",
  applicationName: "Flare24",
  appleWebApp: {
    capable: true,
    title: "Flare24",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-[#0A0A0A] text-[#F5F5F5] antialiased">
        <AuthHashCatcher />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
