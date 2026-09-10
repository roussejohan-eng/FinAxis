"use client";

import Link from "next/link";
import { FolderKanban, Pencil } from "lucide-react";
import { Logo } from "@/components/logo";
import { useScrollSpy } from "@/lib/hooks/use-scroll-spy";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "synthese", label: "Synthèse" },
  { id: "compte-de-resultat", label: "Compte de résultat" },
  { id: "tresorerie", label: "Trésorerie" },
  { id: "tva", label: "TVA" },
  { id: "plan-de-financement", label: "Financement" },
  { id: "seuil-de-rentabilite", label: "Seuil de rentabilité" },
];

export function DashboardMobileBar({ projectId }: { projectId: string }) {
  const activeId = useScrollSpy(NAV_ITEMS.map((item) => item.id));

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
        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                isActive ? "bg-turquoise-500 text-white" : "bg-white/10 text-white/80"
              )}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
