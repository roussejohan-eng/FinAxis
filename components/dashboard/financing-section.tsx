"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/section";
import { MoneyCell } from "@/components/dashboard/money-cell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ProjectResults } from "@/lib/finance";
import { formatEUR } from "@/lib/finance/format";
import { cn } from "@/lib/utils";

export function FinancingSection({ results }: { results: ProjectResults }) {
  const { financing } = results;
  const isBalanced = Math.abs(financing.gap) < 1;

  return (
    <DashboardSection
      id="plan-de-financement"
      title="Plan de financement"
      description="Besoins et ressources au démarrage du projet."
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-border">
          <p className="border-b border-border bg-muted px-4 py-3 text-sm font-semibold text-navy-700">
            Besoins
          </p>
          <dl className="divide-y divide-border text-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-muted-foreground">Investissements</dt>
              <dd className="font-medium text-navy-700">{formatEUR(financing.needs.investments)}</dd>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-muted-foreground">Besoin en fonds de roulement (BFR)</dt>
              <dd className="font-medium text-navy-700">{formatEUR(financing.needs.workingCapital)}</dd>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-muted-foreground">Trésorerie de départ</dt>
              <dd className="font-medium text-navy-700">{formatEUR(financing.needs.initialCash)}</dd>
            </div>
            <div className="flex items-center justify-between px-4 py-3 font-semibold text-navy-700">
              <dt>Total besoins</dt>
              <dd>{formatEUR(financing.needs.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-border">
          <p className="border-b border-border bg-muted px-4 py-3 text-sm font-semibold text-navy-700">
            Ressources
          </p>
          <dl className="divide-y divide-border text-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-muted-foreground">Apport personnel</dt>
              <dd className="font-medium text-navy-700">{formatEUR(financing.resources.personalContribution)}</dd>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-muted-foreground">Prêt d&apos;honneur</dt>
              <dd className="font-medium text-navy-700">{formatEUR(financing.resources.honorLoan)}</dd>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-muted-foreground">Emprunt bancaire</dt>
              <dd className="font-medium text-navy-700">{formatEUR(financing.resources.bankLoan)}</dd>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-muted-foreground">Subventions</dt>
              <dd className="font-medium text-navy-700">{formatEUR(financing.resources.subsidies)}</dd>
            </div>
            <div className="flex items-center justify-between px-4 py-3 font-semibold text-navy-700">
              <dt>Total ressources</dt>
              <dd>{formatEUR(financing.resources.total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div
        className={cn(
          "mt-4 flex items-center gap-2 rounded-lg border p-4 text-sm",
          isBalanced ? "border-turquoise-200 bg-turquoise-50 text-navy-700" : "border-destructive/30 bg-destructive/5 text-navy-700"
        )}
      >
        {isBalanced ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-turquoise-600" aria-hidden />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" aria-hidden />
        )}
        Besoins = ressources : écart de {formatEUR(financing.gap)}
      </div>

      {financing.amortizationSchedule.length > 0 && (
        <div className="mt-8">
          <p className="text-sm font-semibold text-navy-700">
            Tableau d&apos;amortissement de l&apos;emprunt bancaire
          </p>
          <div className="mt-3 max-h-96 overflow-y-auto rounded-lg border border-border">
            <Table>
              <TableHeader className="sticky top-0">
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead className="text-right">Capital restant dû</TableHead>
                  <TableHead className="text-right">Échéance</TableHead>
                  <TableHead className="text-right">Capital remboursé</TableHead>
                  <TableHead className="text-right">Intérêts</TableHead>
                  <TableHead className="text-right">Capital en fin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financing.amortizationSchedule.map((row, i) => (
                  <TableRow key={row.period} className={i % 2 === 1 ? "bg-muted/50" : undefined}>
                    <TableCell>{row.period}</TableCell>
                    <MoneyCell value={row.remainingCapitalStart} />
                    <MoneyCell value={row.payment} />
                    <MoneyCell value={row.principal} />
                    <MoneyCell value={row.interest} />
                    <MoneyCell value={row.remainingCapitalEnd} />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </DashboardSection>
  );
}
