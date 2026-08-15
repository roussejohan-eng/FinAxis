import type { ExpenseProjection, FixedExpenseCategory, Project, RevenueProjection } from "./types";
import { round2 } from "./revenues";

/**
 * Agrège les charges fixes (constantes chaque mois) et variables
 * (fonction du CA ou du volume mensuel) sur l'Année 1.
 */
export function computeExpenseProjection(
  project: Project,
  revenue: RevenueProjection
): ExpenseProjection {
  const totalFixedMonthly = round2(
    project.fixedExpenses.reduce((sum, e) => sum + e.monthlyAmount, 0)
  );
  const totalFixedYear1 = round2(totalFixedMonthly * 12);

  const variableMonthlyYear1 = Array.from({ length: 12 }, (_, i) => {
    const monthTotal = project.variableExpenses.reduce((sum, expense) => {
      if (expense.mode === "percent") {
        const pct = (expense.percentOfRevenue ?? 0) / 100;
        return sum + revenue.totalMonthlyYear1[i] * pct;
      }
      const unitCost = expense.unitCost ?? 0;
      return sum + unitCost * revenue.totalVolumeMonthlyYear1[i];
    }, 0);
    return round2(monthTotal);
  });

  const totalVariableYear1 = round2(variableMonthlyYear1.reduce((a, b) => a + b, 0));

  const categoryMap = new Map<FixedExpenseCategory, number>();
  for (const expense of project.fixedExpenses) {
    categoryMap.set(expense.category, (categoryMap.get(expense.category) ?? 0) + expense.monthlyAmount);
  }
  const fixedByCategory = Array.from(categoryMap.entries()).map(([category, monthly]) => ({
    category,
    monthly: round2(monthly),
  }));

  const ratioFixedToVariable = totalVariableYear1 > 0 ? round2(totalFixedYear1 / totalVariableYear1) : 0;

  return {
    totalFixedMonthly,
    totalFixedYear1,
    variableMonthlyYear1,
    totalVariableYear1,
    fixedByCategory,
    ratioFixedToVariable,
  };
}
