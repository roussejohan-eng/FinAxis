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
import { formatDate } from "@/lib/finance/format";

const NAV_ITEMS = [
  { href: "#synthese", label: "Synthèse", icon: LayoutDashboard },
  { href: "#compte-de-resultat", label: "Compte de résultat", icon: Gauge },
  { href: "#tresorerie", label: "Trésorerie", icon: Wallet },
  { href: "#tva", label: "TVA", icon: Receipt },
  { href: "#plan-de-financement", label: "Plan de financement", icon: Banknote },
  { href: "#seuil-de-rentabilite", label: "Seuil de rentabilité", icon: Target },
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
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-navy-900 text-white lg:flex">
      <div className="sticky top-0 flex h-screen flex-col">
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
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </a>
          ))}
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
