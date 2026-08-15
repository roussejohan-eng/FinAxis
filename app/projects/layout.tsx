import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes projets",
  description: "Vos dossiers financiers sauvegardés dans ce navigateur.",
  robots: { index: false, follow: false },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
