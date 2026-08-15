import type { BreakEvenResult, ExpenseProjection, IncomeStatementResult, Project } from "./types";
import { round2 } from "./revenues";

/**
 * Seuil de rentabilité (méthode des coûts variables) : charges fixes /
 * taux de marge sur coûts variables. Point mort : nombre de jours dans
 * l'année nécessaires pour atteindre ce seuil, au prorata du CA annuel.
 */
export function computeBreakEven(
  project: Project,
  expenses: ExpenseProjection,
  incomeStatement: IncomeStatementResult
): BreakEvenResult {
  const years = incomeStatement.years.map((year) => {
    const contributionMarginRate = year.revenue > 0 ? year.contributionMargin / year.revenue : 0;
    const breakEvenRevenue =
      contributionMarginRate > 0 ? round2(year.fixedExpenses / contributionMarginRate) : 0;

    const breakEvenDays =
      year.revenue > 0 && breakEvenRevenue > 0
        ? Math.min(round2((breakEvenRevenue / year.revenue) * 360), 360)
        : 0;

    const mrrEquivalent = round2(breakEvenRevenue / 12);
    const reached = breakEvenRevenue > 0 && year.revenue >= breakEvenRevenue;

    return {
      year: year.year,
      breakEvenRevenue,
      breakEvenDays,
      mrrEquivalent,
      reached,
    };
  });

  return { years };
}
