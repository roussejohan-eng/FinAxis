import type {
  ExpenseProjection,
  FinancingResult,
  IncomeStatementResult,
  IncomeStatementYear,
  Project,
  RevenueProjection,
} from "./types";
import { CORPORATE_TAX_RATE_REDUCED, CORPORATE_TAX_RATE_STANDARD, CORPORATE_TAX_THRESHOLD } from "./types";
import { round2 } from "./revenues";

/**
 * Impôt sur les sociétés simplifié : 15 % jusqu'à 42 500 € de résultat
 * imposable, puis 25 % au-delà. Aucun report en avant des déficits n'est
 * modélisé (hypothèse documentée dans la note méthodologique).
 */
export function computeCorporateTax(taxableResult: number): number {
  if (taxableResult <= 0) return 0;
  if (taxableResult <= CORPORATE_TAX_THRESHOLD) {
    return round2(taxableResult * CORPORATE_TAX_RATE_REDUCED);
  }
  const reducedPart = CORPORATE_TAX_THRESHOLD * CORPORATE_TAX_RATE_REDUCED;
  const standardPart = (taxableResult - CORPORATE_TAX_THRESHOLD) * CORPORATE_TAX_RATE_STANDARD;
  return round2(reducedPart + standardPart);
}

/** Dotation aux amortissements de l'année N (1, 2 ou 3) pour les investissements du plan de financement. */
function annualDepreciation(project: Project, year: 1 | 2 | 3): number {
  return round2(
    project.investments.reduce((sum, inv) => {
      if (inv.amortizationYears <= 0) return sum;
      return inv.amortizationYears >= year ? sum + inv.amountHT / inv.amortizationYears : sum;
    }, 0)
  );
}

export function computeIncomeStatement(
  project: Project,
  revenue: RevenueProjection,
  expenses: ExpenseProjection,
  financing: FinancingResult
): IncomeStatementResult {
  const revenueByYear = { 1: revenue.totalYear1, 2: revenue.totalYear2, 3: revenue.totalYear3 } as const;

  const years: IncomeStatementYear[] = [1, 2, 3].map((year) => {
    const y = year as 1 | 2 | 3;
    const yearRevenue = revenueByYear[y];

    // Les charges variables suivent proportionnellement le CA de l'année.
    const variableExpenses =
      year === 1
        ? expenses.totalVariableYear1
        : round2(
            expenses.totalVariableYear1 * (revenue.totalYear1 > 0 ? yearRevenue / revenue.totalYear1 : 1)
          );

    const contributionMargin = round2(yearRevenue - variableExpenses);
    const fixedExpenses = round2(expenses.totalFixedYear1 + annualDepreciation(project, y));
    const operatingResult = round2(contributionMargin - fixedExpenses);
    const interest = financing.yearlyInterest.find((i) => i.year === y)?.interest ?? 0;
    const resultBeforeTax = round2(operatingResult - interest);
    const corporateTax = computeCorporateTax(resultBeforeTax);
    const netResult = round2(resultBeforeTax - corporateTax);

    return {
      year: y,
      revenue: round2(yearRevenue),
      variableExpenses,
      contributionMargin,
      fixedExpenses,
      operatingResult,
      interest,
      resultBeforeTax,
      corporateTax,
      netResult,
    };
  });

  const depreciationYear1Monthly = annualDepreciation(project, 1) / 12;
  const monthlyYear1 = Array.from({ length: 12 }, (_, i) => {
    const rev = revenue.totalMonthlyYear1[i];
    const variableExpenses = expenses.variableMonthlyYear1[i];
    const contributionMargin = round2(rev - variableExpenses);
    const fixedExpenses = round2(expenses.totalFixedMonthly + depreciationYear1Monthly);
    const operatingResult = round2(contributionMargin - fixedExpenses);
    return {
      month: i + 1,
      revenue: rev,
      variableExpenses,
      contributionMargin,
      fixedExpenses,
      operatingResult,
    };
  });

  const year1 = years[0];
  const grossMarginRate = year1.revenue > 0 ? round4(year1.contributionMargin / year1.revenue) : 0;
  const netMarginRate = year1.revenue > 0 ? round4(year1.netResult / year1.revenue) : 0;
  const expenseToRevenueRatio =
    year1.revenue > 0 ? round4((year1.variableExpenses + year1.fixedExpenses) / year1.revenue) : 0;

  return { years, monthlyYear1, grossMarginRate, netMarginRate, expenseToRevenueRatio };
}

function round4(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}
