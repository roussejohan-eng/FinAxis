import { describe, expect, it } from "vitest";
import type { Project } from "./types";
import { computeRevenueProjection, interpolateVolume, round2 } from "./revenues";
import { computeExpenseProjection } from "./expenses";
import { computeCorporateTax, computeIncomeStatement } from "./income-statement";
import { computeVatBudget } from "./vat";
import { computeCashFlow } from "./cash-flow";
import { computeAmortizationSchedule, computeFinancingPlan, computeMonthlyPayment } from "./financing";
import { computeBreakEven } from "./break-even";
import { SEASONALITY_COEFFICIENTS } from "./seasonality";

function buildProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "test-project",
    name: "Projet test",
    sector: "Services",
    legalStatus: "SASU",
    startDate: "2026-01-01",
    initialCash: 5000,
    seasonality: "stable",
    revenueSources: [
      { id: "r1", name: "Abonnement", unitPrice: 100, volumeM1: 10, volumeM12: 50, type: "recurrent" },
    ],
    fixedExpenses: [{ id: "f1", name: "Loyer", monthlyAmount: 1000, category: "Loyer" }],
    variableExpenses: [{ id: "v1", name: "Hébergement", mode: "percent", percentOfRevenue: 10, category: "Logiciels" }],
    investments: [{ id: "i1", name: "Matériel", amountHT: 6000, amortizationYears: 3 }],
    financing: {
      personalContribution: 5000,
      honorLoan: 0,
      bankLoan: { amount: 10000, annualRate: 4.8, months: 60 },
      subsidies: 0,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("revenues", () => {
  it("interpolates linearly between M1 and M12", () => {
    expect(interpolateVolume(10, 50, 1)).toBe(10);
    expect(interpolateVolume(10, 50, 12)).toBe(50);
    expect(round2(interpolateVolume(10, 50, 6))).toBeCloseTo(28.18, 1);
  });

  it("keeps a stable seasonality profile revenue-neutral", () => {
    const project = buildProject();
    const revenue = computeRevenueProjection(project);
    const flatMonth = 10 * 100; // volume(1) * prix
    expect(revenue.totalMonthlyYear1[0]).toBeCloseTo(flatMonth, 5);
  });

  it("applies year 2 (+30%) and year 3 (+25%) growth to annual revenue", () => {
    const project = buildProject();
    const revenue = computeRevenueProjection(project);
    expect(revenue.totalYear2).toBeCloseTo(revenue.totalYear1 * 1.3, 2);
    expect(revenue.totalYear3).toBeCloseTo(revenue.totalYear2 * 1.25, 2);
  });

  it("every seasonality profile averages to a coefficient of 1 over 12 months", () => {
    for (const profile of Object.values(SEASONALITY_COEFFICIENTS)) {
      const avg = profile.reduce((a, b) => a + b, 0) / 12;
      expect(avg).toBeCloseTo(1, 2);
    }
  });
});

describe("corporate tax (IS simplifié)", () => {
  it("applies 0 tax to a null or negative result", () => {
    expect(computeCorporateTax(0)).toBe(0);
    expect(computeCorporateTax(-5000)).toBe(0);
  });

  it("applies 15% below the 42 500 € threshold", () => {
    expect(computeCorporateTax(20000)).toBe(3000);
  });

  it("applies exactly 15% at the 42 500 € threshold", () => {
    expect(computeCorporateTax(42500)).toBeCloseTo(6375, 2);
  });

  it("applies 15% then 25% straddling the 42 500 € threshold", () => {
    // 42 500 * 0.15 + 7 500 * 0.25 = 6 375 + 1 875 = 8 250
    expect(computeCorporateTax(50000)).toBeCloseTo(8250, 2);
  });
});

describe("loan amortization (PMT)", () => {
  it("computes a monthly payment consistent with the standard PMT formula", () => {
    const payment = computeMonthlyPayment(10000, 4.8, 60);
    // r = 0.048/12 = 0.004, n = 60 -> mensualité ~ 187.80
    expect(payment).toBeCloseTo(187.8, 1);
  });

  it("fully amortizes the loan: sum of principal repaid equals the borrowed amount", () => {
    const schedule = computeAmortizationSchedule(10000, 4.8, 60);
    const totalPrincipal = round2(schedule.reduce((sum, row) => sum + row.principal, 0));
    expect(totalPrincipal).toBeCloseTo(10000, 1);
    expect(schedule[schedule.length - 1].remainingCapitalEnd).toBe(0);
  });

  it("handles a 0% loan by splitting principal evenly with no interest", () => {
    const schedule = computeAmortizationSchedule(1200, 0, 12);
    expect(schedule).toHaveLength(12);
    expect(schedule[0].interest).toBe(0);
    expect(schedule[0].principal).toBe(100);
  });

  it("returns an empty schedule when there is no loan", () => {
    expect(computeAmortizationSchedule(0, 4, 60)).toEqual([]);
  });
});

describe("VAT budget", () => {
  it("computes net VAT due and carries forward a credit when deductible exceeds collected", () => {
    const project = buildProject({
      revenueSources: [{ id: "r1", name: "Abo", unitPrice: 100, volumeM1: 1, volumeM12: 1, type: "recurrent" }],
      fixedExpenses: [{ id: "f1", name: "Loyer", monthlyAmount: 2000, category: "Loyer" }],
      variableExpenses: [],
      investments: [],
    });
    const revenue = computeRevenueProjection(project);
    const expenses = computeExpenseProjection(project, revenue);
    const vat = computeVatBudget(project, revenue, expenses);

    // Mois 1 : collectée = 100*0.2 = 20, déductible = 2000*0.2 = 400 -> crédit de 380
    expect(vat.months[0].collected).toBeCloseTo(20, 2);
    expect(vat.months[0].deductible).toBeCloseTo(400, 2);
    expect(vat.months[0].netDue).toBe(0);
    expect(vat.months[0].creditCarriedForward).toBeCloseTo(380, 2);

    // Mois 2 : même situation, le crédit s'accumule
    expect(vat.months[1].creditCarriedForward).toBeGreaterThan(vat.months[0].creditCarriedForward);
  });

  it("never lets net VAT due go negative", () => {
    const project = buildProject();
    const revenue = computeRevenueProjection(project);
    const expenses = computeExpenseProjection(project, revenue);
    const vat = computeVatBudget(project, revenue, expenses);
    for (const month of vat.months) {
      expect(month.netDue).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("break-even", () => {
  it("computes a break-even revenue consistent with fixed costs / contribution margin rate", () => {
    const project = buildProject();
    const revenue = computeRevenueProjection(project);
    const expenses = computeExpenseProjection(project, revenue);
    const financing = computeFinancingPlan(project, expenses);
    const incomeStatement = computeIncomeStatement(project, revenue, expenses, financing);
    const breakEven = computeBreakEven(project, expenses, incomeStatement);

    const year1 = incomeStatement.years[0];
    const rate = year1.contributionMargin / year1.revenue;
    const expected = year1.fixedExpenses / rate;
    expect(breakEven.years[0].breakEvenRevenue).toBeCloseTo(expected, 1);
    expect(breakEven.years[0].breakEvenDays).toBeGreaterThanOrEqual(0);
    expect(breakEven.years[0].breakEvenDays).toBeLessThanOrEqual(360);
  });
});

describe("cash flow", () => {
  it("starts cumulative treasury at the initial cash entered in the wizard", () => {
    const project = buildProject({ initialCash: 12345 });
    const revenue = computeRevenueProjection(project);
    const expenses = computeExpenseProjection(project, revenue);
    const financing = computeFinancingPlan(project, expenses);
    const vat = computeVatBudget(project, revenue, expenses);
    const cashFlow = computeCashFlow(project, revenue, expenses, vat, financing.amortizationSchedule);

    expect(cashFlow.months[0].cumulativeCash).toBeCloseTo(
      12345 + cashFlow.months[0].netFlow,
      2
    );
  });
});

describe("income statement", () => {
  it("keeps contribution margin equal to revenue minus variable expenses (year 1)", () => {
    const project = buildProject();
    const revenue = computeRevenueProjection(project);
    const expenses = computeExpenseProjection(project, revenue);
    const financing = computeFinancingPlan(project, expenses);
    const incomeStatement = computeIncomeStatement(project, revenue, expenses, financing);
    const year1 = incomeStatement.years[0];
    expect(round2(year1.revenue - year1.variableExpenses)).toBeCloseTo(year1.contributionMargin, 2);
  });
});
