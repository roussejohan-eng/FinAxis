import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer mon dossier financier",
  description: "Parcours guidé en 5 étapes pour générer votre prévisionnel, votre trésorerie et votre plan de financement.",
  robots: { index: false, follow: false },
};

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
