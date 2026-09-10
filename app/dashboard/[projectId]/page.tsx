"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProjectsStore } from "@/store/projects-store";
import { computeProjectResults } from "@/lib/finance";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardMobileBar } from "@/components/dashboard/mobile-bar";
import { SynthesisSection } from "@/components/dashboard/synthesis-section";
import { IncomeStatementSection } from "@/components/dashboard/income-statement-section";
import { CashFlowSection } from "@/components/dashboard/cash-flow-section";
import { VatSection } from "@/components/dashboard/vat-section";
import { FinancingSection } from "@/components/dashboard/financing-section";
import { BreakEvenSection } from "@/components/dashboard/break-even-section";
import { DashboardActionBar } from "@/components/dashboard/action-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const project = useProjectsStore((s) => s.getProject(projectId));
  const hasHydrated = useProjectsStore((s) => s.hasHydrated);

  const results = useMemo(() => (project ? computeProjectResults(project) : null), [project]);

  // Les projets ne vivent que dans le localStorage du navigateur : tant que
  // le store ne s'est pas réhydraté côté client, on affiche un état neutre
  // identique au rendu serveur (au lieu de "Projet introuvable" à tort),
  // pour éviter tout flash de contenu et toute erreur d'hydratation React.
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen bg-white" aria-hidden>
        <div className="hidden w-60 shrink-0 flex-col gap-6 bg-navy-900 p-6 lg:flex">
          <Skeleton className="h-8 w-28 bg-white/10" />
          <Skeleton className="h-10 w-full bg-white/10" />
          <div className="mt-4 flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full bg-white/10" />
            ))}
          </div>
        </div>
        <div className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!project || !results) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted px-4 text-center">
        <h1 className="text-xl font-semibold text-navy-700">Projet introuvable</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ce dossier n&apos;existe pas ou plus dans votre navigateur. Créez un nouveau projet pour
          générer votre dossier financier.
        </p>
        <Button asChild>
          <Link href="/wizard/nouveau-projet">Créer un projet</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <DashboardSidebar projectId={project.id} projectName={project.name} startDate={project.startDate} />

      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardMobileBar projectId={project.id} />

        <div className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <SynthesisSection results={results} />
          <IncomeStatementSection results={results} />
          <CashFlowSection results={results} />
          <VatSection results={results} />
          <FinancingSection results={results} />
          <BreakEvenSection results={results} />
        </div>

        <DashboardActionBar project={project} results={results} />
      </div>
    </div>
  );
}
