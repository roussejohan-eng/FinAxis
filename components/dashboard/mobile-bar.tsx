"use client";

import Link from "next/link";
import { FolderKanban, Pencil } from "lucide-react";
import { Logo } from "@/components/logo";

const NAV_ITEMS = [
  { href: "#synthese", label: "Synthèse" },
  { href: "#compte-de-resultat", label: "Compte de résultat" },
  { href: "#tresorerie", label: "Trésorerie" },
  { href: "#tva", label: "TVA" },
  { href: "#plan-de-financement", label: "Financement" },
  { href: "#seuil-de-rentabilite", label: "Seuil de rentabilité" },
];

export function DashboardMobileBar({ projectId }: { projectId: string }) {
  return (
    <div className="sticky top-0 z-30 bg-navy-900 text-white lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Logo variant="light" className="h-7" />
        <div className="flex items-center gap-3">
          <Link href={`/wizard/nouveau-projet?edit=${projectId}`} aria-label="Modifier les hypothèses">
            <Pencil className="h-4.5 w-4.5" />
          </Link>
          <Link href="/projects" aria-label="Mes projets">
            <FolderKanban className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>
      <nav
        className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-2.5"
        aria-label="Sections du dossier"
      >
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="shrink-0 whitespace-nowrap rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
