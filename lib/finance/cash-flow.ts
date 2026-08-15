import type {
  AmortizationRow,
  CashFlowResult,
  ExpenseProjection,
  Project,
  RevenueProjection,
  VatResult,
} from "./types";
import { MONTH_LABELS, VAT_RATE } from "./types";
import { round2 } from "./revenues";

/**
 * Budget de trésorerie mensuel Année 1. Hypothèse simplificatrice : les
 * encaissements et décaissements interviennent le mois de la vente / de
 * l'achat (pas de décalage de règlement), documentée dans la note
 * méthodologique du PDF.
 */
export function computeCashFlow(
  project: Project,
  revenue: RevenueProjection,
  expenses: ExpenseProjection,
  vat: VatResult,
  amortizationSchedule: AmortizationRow[]
): CashFlowResult {
  const investmentsMonth1 = project.investments.reduce((sum, inv) => sum + inv.amountHT, 0);

  let cumulative = round2(project.initialCash);
  const months = Array.from({ length: 12 }, (_, i) => {
    const cashIn = round2(revenue.totalMonthlyYear1[i] * (1 + VAT_RATE));

    const purchasesHT =
      expenses.variableMonthlyYear1[i] + expenses.totalFixedMonthly + (i === 0 ? investmentsMonth1 : 0);
    const purchasesTTC = round2(purchasesHT * (1 + VAT_RATE));
    const loanPayment = amortizationSchedule[i]?.payment ?? 0;
    const cashOut = round2(purchasesTTC + loanPayment);

    const netVat = vat.months[i].netDue;
    const netFlow = round2(cashIn - cashOut - netVat);
    cumulative = round2(cumulative + netFlow);

    return {
      month: i + 1,
      label: MONTH_LABELS[i],
      cashIn,
      cashOut,
      netVat,
      netFlow,
      cumulativeCash: cumulative,
    };
  });

  return { months, endOfYearCash: months[11].cumulativeCash };
}
