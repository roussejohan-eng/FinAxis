"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardSection } from "@/components/dashboard/section";
import { MoneyCell } from "@/components/dashboard/money-cell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ProjectResults } from "@/lib/finance";
import { formatEUR } from "@/lib/finance/format";

export function CashFlowSection({ results }: { results: ProjectResults }) {
  const { cashFlow } = results;
  const values = cashFlow.months.map((m) => m.cumulativeCash);
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const gradientOffset = max === min ? 0 : max / (max - min);

  return (
    <DashboardSection id="tresorerie" title="Trésorerie" description="Budget de trésorerie mensuel — année 1.">
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mois</TableHead>
              <TableHead className="text-right">Encaissements TTC</TableHead>
              <TableHead className="text-right">Décaissements TTC</TableHead>
              <TableHead className="text-right">TVA nette</TableHead>
              <TableHead className="text-right">Flux net</TableHead>
              <TableHead className="text-right">Trésorerie cumulée</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cashFlow.months.map((m, i) => (
              <TableRow key={m.month} className={i % 2 === 1 ? "bg-muted/50" : undefined}>
                <TableCell>{m.label}</TableCell>
                <MoneyCell value={m.cashIn} highlight />
                <MoneyCell value={-m.cashOut} />
                <MoneyCell value={-m.netVat} />
                <MoneyCell value={m.netFlow} highlight />
                <MoneyCell value={m.cumulativeCash} bold highlight />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        <p className="text-sm font-semibold text-navy-700">Trésorerie cumulée</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={cashFlow.months} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={gradientOffset} stopColor="#1282A2" stopOpacity={0.35} />
                  <stop offset={gradientOffset} stopColor="#DC2626" stopOpacity={0.35} />
                </linearGradient>
                <linearGradient id="cashStroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={gradientOffset} stopColor="#1282A2" />
                  <stop offset={gradientOffset} stopColor="#DC2626" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E2E4E8" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={48} />
              <Tooltip formatter={(value) => formatEUR(Number(value ?? 0))} />
              <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="cumulativeCash"
                name="Trésorerie cumulée"
                stroke="url(#cashStroke)"
                fill="url(#cashGradient)"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardSection>
  );
}
