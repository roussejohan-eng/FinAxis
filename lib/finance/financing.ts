import type { AmortizationRow, ExpenseProjection, FinancingResult, Project } from "./types";
import { round2 } from "./revenues";

/**
 * Mensualité d'un emprunt (formule PMT), amortissement constant.
 * r: taux mensuel (décimal), n: nombre de mensualités, principal: capital emprunté.
 */
export function computeMonthlyPayment(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return round2(principal / months);
  const payment = (principal * r) / (1 - Math.pow(1 + r, -months));
  return round2(payment);
}

/** Tableau d'amortissement complet d'un emprunt bancaire. */
export function computeAmortizationSchedule(
  principal: number,
  annualRatePct: number,
  months: number
): AmortizationRow[] {
  if (principal <= 0 || months <= 0) return [];
  const r = annualRatePct / 100 / 12;
  const payment = computeMonthlyPayment(principal, annualRatePct, months);
  const rows: AmortizationRow[] = [];
  let remaining = principal;

  for (let period = 1; period <= months; period++) {
    const interest = round2(remaining * r);
    // Sur la dernière échéance, on solde le capital restant pour éviter les écarts d'arrondi.
    const isLast = period === months;
    let principalPortion = isLast ? remaining : round2(payment - interest);
    if (principalPortion > remaining) principalPortion = remaining;
    const end = round2(remaining - principalPortion);

    rows.push({
      period,
      remainingCapitalStart: round2(remaining),
      payment: isLast ? round2(principalPortion + interest) : payment,
      principal: principalPortion,
      interest,
      remainingCapitalEnd: Math.max(end, 0),
    });

    remaining = end;
  }

  return rows;
}

/**
 * Plan de financement (besoins / ressources) + tableau d'amortissement
 * de l'emprunt bancaire éventuel.
 */
export function computeFinancingPlan(project: Project, expenses: ExpenseProjection): FinancingResult {
  const investmentsTotal = round2(project.investments.reduce((sum, i) => sum + i.amountHT, 0));

  // BFR estimé à un mois de charges d'exploitation (fixes + variables moyennes),
  // hypothèse simplificatrice documentée dans la note méthodologique.
  const avgVariableMonthly = expenses.totalVariableYear1 / 12;
  const workingCapital = round2(expenses.totalFixedMonthly + avgVariableMonthly);

  const initialCash = round2(project.initialCash);
  const needsTotal = round2(investmentsTotal + workingCapital + initialCash);

  const { personalContribution, honorLoan, bankLoan, subsidies } = project.financing;
  const resourcesTotal = round2(personalContribution + honorLoan + bankLoan.amount + subsidies);

  const amortizationSchedule = computeAmortizationSchedule(
    bankLoan.amount,
    bankLoan.annualRate,
    bankLoan.months
  );
  const monthlyPayment = computeMonthlyPayment(bankLoan.amount, bankLoan.annualRate, bankLoan.months);

  const yearlyInterest: FinancingResult["yearlyInterest"] = [1, 2, 3].map((year) => {
    const start = (year - 1) * 12;
    const rows = amortizationSchedule.slice(start, start + 12);
    return {
      year: year as 1 | 2 | 3,
      interest: round2(rows.reduce((sum, r) => sum + r.interest, 0)),
      principal: round2(rows.reduce((sum, r) => sum + r.principal, 0)),
    };
  });

  return {
    needs: {
      investments: investmentsTotal,
      workingCapital,
      initialCash,
      total: needsTotal,
    },
    resources: {
      personalContribution: round2(personalContribution),
      honorLoan: round2(honorLoan),
      bankLoan: round2(bankLoan.amount),
      subsidies: round2(subsidies),
      total: resourcesTotal,
    },
    gap: round2(resourcesTotal - needsTotal),
    amortizationSchedule,
    monthlyPayment,
    totalInterestYear1: yearlyInterest[0].interest,
    yearlyInterest,
  };
}
