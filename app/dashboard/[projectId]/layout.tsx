import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Synthèse, compte de résultat, trésorerie, TVA, plan de financement et seuil de rentabilité de votre projet.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
