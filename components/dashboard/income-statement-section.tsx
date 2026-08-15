"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/section";
import { MoneyCell } from "@/components/dashboard/money-cell";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MONTH_LABELS } from "@/lib/finance/types";
import type { ProjectResults } from "@/lib/finance";
import { formatPercent } from "@/lib/finance/format";

export function IncomeStatementSection({ results }: { results: ProjectResults }) {
  const { incomeStatement } = results;
  const [expanded, setExpanded] = useState(false);
  const [y1, y2, y3] = incomeStatement.years;

  const rows: { label: string; key: keyof typeof y1; bold?: boolean; highlight?: boolean }[] = [
    { label: "Produits d'exploitation", key: "revenue" },
    { label: "Charges variables", key: "variableExpenses" },
    { label: "Marge sur coûts variables", key: "contributionMargin", bold: true },
    { label: "Charges fixes", key: "fixedExpenses" },
    { label: "Résultat d'exploitation", key: "operatingResult", bold: true, highlight: true },
    { label: "Intérêts d'emprunt", key: "interest" },
    { label: "Impôt sur les sociétés", key: "corporateTax" },
    { label: "Résultat net", key: "netResult", bold: true, highlight: true },
  ];

  return (
    <DashboardSection
      id="compte-de-resultat"
      title="Compte de résultat"
      description="Projection sur 3 ans, détail mensuel disponible pour l'année 1."
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Libellé</TableHead>
            <TableHead className="text-right">Année 1</TableHead>
            <TableHead className="text-right">Année 2</TableHead>
            <TableHead className="text-right">Année 3</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={row.label} className={i % 2 === 1 ? "bg-muted/50" : undefined}>
              <TableCell className={row.bold ? "font-semibold text-navy-700" : undefined}>{row.label}</TableCell>
              <MoneyCell value={y1[row.key] as number} bold={row.bold} highlight={row.highlight} />
              <MoneyCell value={y2[row.key] as number} bold={row.bold} highlight={row.highlight} />
              <MoneyCell value={y3[row.key] as number} bold={row.bold} highlight={row.highlight} />
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button variant="outline" size="sm" className="mt-4" onClick={() => setExpanded((e) => !e)}>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {expanded ? "Masquer le détail mensuel (année 1)" : "Voir le détail mensuel (année 1)"}
      </Button>

      {expanded && (
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Libellé</TableHead>
                {MONTH_LABELS.map((m) => (
                  <TableHead key={m} className="text-right">
                    {m}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>CA</TableCell>
                {incomeStatement.monthlyYear1.map((m) => (
                  <MoneyCell key={m.month} value={m.revenue} />
                ))}
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell>Charges variables</TableCell>
                {incomeStatement.monthlyYear1.map((m) => (
                  <MoneyCell key={m.month} value={m.variableExpenses} />
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Charges fixes</TableCell>
                {incomeStatement.monthlyYear1.map((m) => (
                  <MoneyCell key={m.month} value={m.fixedExpenses} />
                ))}
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-semibold text-navy-700">Résultat d&apos;exploitation</TableCell>
                {incomeStatement.monthlyYear1.map((m) => (
                  <MoneyCell key={m.month} value={m.operatingResult} bold highlight />
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-xs text-muted-foreground">Taux de marge brute</p>
          <p className="mt-1 text-lg font-semibold text-navy-700">
            {formatPercent(incomeStatement.grossMarginRate)}
          </p>
        </div>
        <div className="rounded-lg bg-muted p-4">
          <p className="text-xs text-muted-foreground">Marge nette</p>
          <p className="mt-1 text-lg font-semibold text-navy-700">
            {formatPercent(incomeStatement.netMarginRate)}
          </p>
        </div>
        <div className="rounded-lg bg-muted p-4">
          <p className="text-xs text-muted-foreground">Ratio charges / CA</p>
          <p className="mt-1 text-lg font-semibold text-navy-700">
            {formatPercent(incomeStatement.expenseToRevenueRatio)}
          </p>
        </div>
      </div>
    </DashboardSection>
  );
}
