import type { Project } from "./types";
import { computeRevenueProjection } from "./revenues";
import { computeExpenseProjection } from "./expenses";
import { computeIncomeStatement } from "./income-statement";
import { computeCashFlow } from "./cash-flow";
import { computeVatBudget } from "./vat";
import { computeFinancingPlan } from "./financing";
import { computeBreakEven } from "./break-even";

export * from "./types";
export * from "./revenues";
export * from "./expenses";
export * from "./income-statement";
export * from "./cash-flow";
export * from "./vat";
export * from "./financing";
export * from "./break-even";
export * from "./seasonality";
export * from "./format";

/** Calcule l'intégralité des résultats financiers d'un projet, en une passe. */
export function computeProjectResults(project: Project) {
  const revenue = computeRevenueProjection(project);
  const expenses = computeExpenseProjection(project, revenue);
  const financing = computeFinancingPlan(project, expenses);
  const incomeStatement = computeIncomeStatement(project, revenue, expenses, financing);
  const vat = computeVatBudget(project, revenue, expenses);
  const cashFlow = computeCashFlow(project, revenue, expenses, vat, financing.amortizationSchedule);
  const breakEven = computeBreakEven(project, expenses, incomeStatement);

  return { revenue, expenses, financing, incomeStatement, vat, cashFlow, breakEven };
}

export type ProjectResults = ReturnType<typeof computeProjectResults>;
