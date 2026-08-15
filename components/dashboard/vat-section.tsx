"use client";

import { DashboardSection } from "@/components/dashboard/section";
import { MoneyCell } from "@/components/dashboard/money-cell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ProjectResults } from "@/lib/finance";

export function VatSection({ results }: { results: ProjectResults }) {
  const { vat } = results;

  return (
    <DashboardSection id="tva" title="Budget de TVA" description="TVA collectée, déductible et nette — année 1.">
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mois</TableHead>
              <TableHead className="text-right">TVA collectée</TableHead>
              <TableHead className="text-right">TVA déductible</TableHead>
              <TableHead className="text-right">TVA nette à reverser</TableHead>
              <TableHead className="text-right">Crédit reporté</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vat.months.map((m, i) => (
              <TableRow key={m.month} className={i % 2 === 1 ? "bg-muted/50" : undefined}>
                <TableCell>{m.label}</TableCell>
                <MoneyCell value={m.collected} />
                <MoneyCell value={m.deductible} />
                <MoneyCell value={m.netDue} bold />
                <MoneyCell value={m.creditCarriedForward} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardSection>
  );
}
