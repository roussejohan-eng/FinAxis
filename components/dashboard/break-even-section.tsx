"use client";

import { DashboardSection } from "@/components/dashboard/section";
import type { ProjectResults } from "@/lib/finance";
import { formatEUR } from "@/lib/finance/format";

export function BreakEvenSection({ results }: { results: ProjectResults }) {
  const { breakEven } = results;

  return (
    <DashboardSection
      id="seuil-de-rentabilite"
      title="Seuil de rentabilité"
      description="Le chiffre d'affaires à partir duquel votre activité devient rentable, année par année."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {breakEven.years.map((year) => (
          <div
            key={year.year}
            className="rounded-lg border border-border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-turquoise-200 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-navy-700">Année {year.year}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Seuil</dt>
                <dd className="font-semibold text-navy-700">{formatEUR(year.breakEvenRevenue)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Point mort</dt>
                <dd className="font-semibold text-navy-700">{Math.round(year.breakEvenDays)} jours</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Équivalent MRR</dt>
                <dd className="font-semibold text-navy-700">{formatEUR(year.mrrEquivalent)}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs italic text-muted-foreground">
        Le seuil de rentabilité est le chiffre d&apos;affaires à partir duquel votre activité couvre
        toutes ses charges.
      </p>
    </DashboardSection>
  );
}
