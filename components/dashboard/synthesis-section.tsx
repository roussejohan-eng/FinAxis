"use client";

import { CircleDollarSign, Scale, TrendingUp, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardSection } from "@/components/dashboard/section";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MONTH_LABELS } from "@/lib/finance/types";
import type { ProjectResults } from "@/lib/finance";
import { formatEUR, formatPercent } from "@/lib/finance/format";

// Palette cyclique pour les sources de revenus dans le graphique empilé —
// dérivée de la palette de marque (turquoise/marine), pas de couleurs
// génériques de librairie graphique.
const SOURCE_COLORS = ["#1282A2", "#001F54", "#2E9DB8", "#034078", "#0E6982", "#05183E"];

export function SynthesisSection({ results }: { results: ProjectResults }) {
  const { revenue, expenses, incomeStatement, cashFlow } = results;
  const year1 = incomeStatement.years[0];

  const firstMonth = revenue.totalMonthlyYear1[0];
  const lastMonth = revenue.totalMonthlyYear1[11];
  const variation = firstMonth > 0 ? (lastMonth - firstMonth) / firstMonth : 0;

  const totalCharges = year1.variableExpenses + year1.fixedExpenses;

  const barData = MONTH_LABELS.map((label, i) => ({
    month: label,
    ca: Math.round(revenue.totalMonthlyYear1[i]),
    charges: Math.round(expenses.variableMonthlyYear1[i] + expenses.totalFixedMonthly),
  }));

  const lineData = cashFlow.months.map((m) => ({ month: m.label, tresorerie: m.cumulativeCash }));

  const chargesMonthly = MONTH_LABELS.map(
    (_, i) => expenses.variableMonthlyYear1[i] + expenses.totalFixedMonthly
  );
  const cashMonthly = cashFlow.months.map((m) => m.cumulativeCash);
  const operatingResultMonthly = incomeStatement.monthlyYear1.map((m) => m.operatingResult);

  const sourceNames = revenue.bySourceMonthlyYear1.map(
    (s, i) => s.name || `Source ${i + 1}`
  );
  const revenueBySourceData = MONTH_LABELS.map((label, i) => {
    const row: Record<string, number | string> = { month: label };
    revenue.bySourceMonthlyYear1.forEach((s, si) => {
      row[sourceNames[si]] = Math.round(s.monthly[i]);
    });
    return row;
  });
  const hasRevenueBreakdown = revenue.bySourceMonthlyYear1.length > 0 && revenue.totalYear1 > 0;

  const categoryBreakdown = [...expenses.fixedByCategory]
    .filter((c) => c.monthly > 0)
    .sort((a, b) => b.monthly - a.monthly);
  const maxCategoryMonthly = Math.max(...categoryBreakdown.map((c) => c.monthly), 1);

  return (
    <DashboardSection id="synthese" title="Synthèse" description="Vue d'ensemble de l'année 1.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={TrendingUp}
          label="CA annuel Année 1"
          value={formatEUR(year1.revenue)}
          trend={{
            value: `${variation >= 0 ? "+" : ""}${formatPercent(variation)} vs M1`,
            positive: variation >= 0,
          }}
          sparklineData={revenue.totalMonthlyYear1}
        />
        <KpiCard
          icon={Scale}
          label="Résultat net Année 1"
          value={formatEUR(year1.netResult)}
          badge={{ label: year1.netResult >= 0 ? "Bénéficiaire" : "Déficitaire", positive: year1.netResult >= 0 }}
          sparklineData={operatingResultMonthly}
        />
        <KpiCard
          icon={Wallet}
          label="Trésorerie fin Année 1"
          value={formatEUR(cashFlow.endOfYearCash)}
          badge={{ label: cashFlow.endOfYearCash >= 0 ? "Positive" : "Négative", positive: cashFlow.endOfYearCash >= 0 }}
          sparklineData={cashMonthly}
        />
        <KpiCard
          icon={CircleDollarSign}
          label="Charges totales Année 1"
          value={formatEUR(totalCharges)}
          sparklineData={chargesMonthly}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-sm font-semibold text-navy-700">CA vs charges par mois</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E2E4E8" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={44} />
                <Tooltip formatter={(value) => formatEUR(Number(value ?? 0))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="ca" name="Chiffre d'affaires" fill="#1282A2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="charges" name="Charges" fill="#001F54" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-sm font-semibold text-navy-700">Trésorerie cumulée</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E2E4E8" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={44} />
                <Tooltip formatter={(value) => formatEUR(Number(value ?? 0))} />
                <Line type="monotone" dataKey="tresorerie" name="Trésorerie" stroke="#1282A2" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-sm font-semibold text-navy-700">Revenus par source, par mois</p>
          {hasRevenueBreakdown ? (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueBySourceData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#E2E4E8" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip formatter={(value) => formatEUR(Number(value ?? 0))} />
                  {sourceNames.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
                  {sourceNames.map((name, i) => (
                    <Bar
                      key={name}
                      dataKey={name}
                      stackId="revenue"
                      fill={SOURCE_COLORS[i % SOURCE_COLORS.length]}
                      radius={i === sourceNames.length - 1 ? [4, 4, 0, 0] : undefined}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-4 rounded-md bg-muted p-4 text-sm text-muted-foreground">
              Ajoutez une source de revenus pour voir sa répartition mensuelle.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-sm font-semibold text-navy-700">Répartition des charges fixes</p>
          {categoryBreakdown.length > 0 ? (
            <ul className="mt-5 flex flex-col gap-4">
              {categoryBreakdown.map((c) => (
                <li key={c.category}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-navy-700">{c.category}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatEUR(c.monthly)}
                      <span className="text-xs"> / mois</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-turquoise-500"
                      style={{ width: `${Math.max((c.monthly / maxCategoryMonthly) * 100, 3)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-md bg-muted p-4 text-sm text-muted-foreground">
              Ajoutez des charges fixes pour voir leur répartition par catégorie.
            </p>
          )}
        </div>
      </div>
    </DashboardSection>
  );
}
