import type { ExpenseProjection, Project, RevenueProjection, VatResult } from "./types";
import { MONTH_LABELS, VAT_RATE } from "./types";
import { round2 } from "./revenues";

/**
 * Budget de TVA mensuel Année 1 : TVA collectée sur les ventes, TVA
 * déductible sur les achats (charges + investissements du mois 1), TVA
 * nette à reverser, avec report du crédit de TVA au(x) mois suivant(s)
 * lorsque la TVA déductible dépasse la TVA collectée.
 */
export function computeVatBudget(
  project: Project,
  revenue: RevenueProjection,
  expenses: ExpenseProjection
): VatResult {
  const investmentsMonth1 = project.investments.reduce((sum, inv) => sum + inv.amountHT, 0);

  let runningCredit = 0;
  const months = Array.from({ length: 12 }, (_, i) => {
    const collected = round2(revenue.totalMonthlyYear1[i] * VAT_RATE);
    const purchasesHT =
      expenses.variableMonthlyYear1[i] + expenses.totalFixedMonthly + (i === 0 ? investmentsMonth1 : 0);
    const deductible = round2(purchasesHT * VAT_RATE);

    const net = round2(collected - deductible - runningCredit);
    const netDue = Math.max(net, 0);
    runningCredit = net < 0 ? round2(-net) : 0;

    return {
      month: i + 1,
      label: MONTH_LABELS[i],
      collected,
      deductible,
      netDue,
      creditCarriedForward: runningCredit,
    };
  });

  return { months };
}
