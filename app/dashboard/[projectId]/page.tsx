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

export default function DashboardPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const project = useProjectsStore((s) => s.getProject(projectId));

  const results = useMemo(() => (project ? computeProjectResults(project) : null), [project]);

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
