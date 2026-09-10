"use client";

import Link from "next/link";
import {
  Banknote,
  FolderKanban,
  Gauge,
  LayoutDashboard,
  Pencil,
  Receipt,
  Target,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { AmbientGlow } from "@/components/ambient-glow";
import { formatDate } from "@/lib/finance/format";
import { useScrollSpy } from "@/lib/hooks/use-scroll-spy";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "synthese", label: "Synthèse", icon: LayoutDashboard },
  { id: "compte-de-resultat", label: "Compte de résultat", icon: Gauge },
  { id: "tresorerie", label: "Trésorerie", icon: Wallet },
  { id: "tva", label: "TVA", icon: Receipt },
  { id: "plan-de-financement", label: "Plan de financement", icon: Banknote },
  { id: "seuil-de-rentabilite", label: "Seuil de rentabilité", icon: Target },
];

export function DashboardSidebar({
  projectId,
  projectName,
  startDate,
}: {
  projectId: string;
  projectName: string;
  startDate: string;
}) {
  const activeId = useScrollSpy(NAV_ITEMS.map((item) => item.id));

  return (
    <aside className="relative hidden w-60 shrink-0 flex-col overflow-hidden bg-navy-900 text-white lg:flex">
      <AmbientGlow variant="dark" className="h-[420px]" />
      <div className="relative sticky top-0 flex h-screen flex-col">
        <div className="px-6 pt-6">
          <Link href="/" aria-label="FinAxis, accueil">
            <Logo variant="light" />
          </Link>
        </div>

        <div className="mt-8 px-6">
          <p className="truncate text-sm font-semibold text-white" title={projectName}>
            {projectName || "Projet sans nom"}
          </p>
          <p className="mt-0.5 text-xs text-white/50">Démarrage le {formatDate(startDate)}</p>
        </div>

        <nav className="mt-8 flex-1 space-y-1 px-3" aria-label="Sections du dossier">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:translate-x-0.5",
                  isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <span
                  className={cn(
                    "absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-turquoise-400 transition-opacity",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden
                />
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-turquoise-400" : "group-hover:text-turquoise-400"
                  )}
                  aria-hidden
                />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-white/10 p-4">
          <Link
            href={`/wizard/nouveau-projet?edit=${projectId}`}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Modifier les hypothèses
          </Link>
          <Link
            href="/projects"
            className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <FolderKanban className="h-4 w-4" aria-hidden />
            Mes projets
          </Link>
        </div>
      </div>
    </aside>
  );
}
