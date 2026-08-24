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
        />
        <KpiCard
          icon={Scale}
          label="Résultat net Année 1"
          value={formatEUR(year1.netResult)}
          badge={{ label: year1.netResult >= 0 ? "Bénéficiaire" : "Déficitaire", positive: year1.netResult >= 0 }}
        />
        <KpiCard
          icon={Wallet}
          label="Trésorerie fin Année 1"
          value={formatEUR(cashFlow.endOfYearCash)}
          badge={{ label: cashFlow.endOfYearCash >= 0 ? "Positive" : "Négative", positive: cashFlow.endOfYearCash >= 0 }}
        />
        <KpiCard icon={CircleDollarSign} label="Charges totales Année 1" value={formatEUR(totalCharges)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-sm font-semibold text-navy-700">CA vs charges par mois</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E9EE" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={44} />
                <Tooltip formatter={(value) => formatEUR(Number(value ?? 0))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="ca" name="Chiffre d'affaires" fill="#1FB6C1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="charges" name="Charges" fill="#0F2A44" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-sm font-semibold text-navy-700">Trésorerie cumulée</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E5E9EE" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={44} />
                <Tooltip formatter={(value) => formatEUR(Number(value ?? 0))} />
                <Line type="monotone" dataKey="tresorerie" name="Trésorerie" stroke="#1FB6C1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}
