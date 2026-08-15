import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = "https://finaxis.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FinAxis — comprendre, prévoir, réussir",
    template: "%s · FinAxis",
  },
  description:
    "FinAxis génère votre prévisionnel, votre trésorerie et votre plan de financement en 30 minutes, dans un format harmonisé, exportable et validable par un expert-comptable partenaire.",
  keywords: [
    "prévisionnel financier",
    "business plan",
    "plan de financement",
    "budget de trésorerie",
    "dossier bancaire",
    "SaaS français",
  ],
  openGraph: {
    title: "FinAxis — comprendre, prévoir, réussir",
    description:
      "Le dossier financier que les banques attendent. Prévisionnel, trésorerie et plan de financement en 30 minutes.",
    url: siteUrl,
    siteName: "FinAxis",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FinAxis — comprendre, prévoir, réussir",
    description:
      "Le dossier financier que les banques attendent, généré en 30 minutes.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "FinAxis",
    url: siteUrl,
    slogan: "Comprendre, prévoir, réussir.",
    description:
      "Plateforme française qui aide les entrepreneurs, TPE/PME et incubateurs à produire des dossiers financiers prévisionnels de qualité bancaire.",
    areaServed: "FR",
  };

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
