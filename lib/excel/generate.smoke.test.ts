import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import type { Project } from "@/lib/finance/types";
import { computeProjectResults } from "@/lib/finance";
import { buildProjectWorkbook } from "./generate";

function sampleProject(): Project {
  return {
    id: "smoke-test",
    name: "Projet fumée",
    sector: "Tech / SaaS",
    legalStatus: "SASU",
    startDate: "2026-01-01",
    initialCash: 8000,
    seasonality: "b2b-saas",
    revenueSources: [
      { id: "r1", name: "Abonnement", unitPrice: 49, volumeM1: 5, volumeM12: 80, type: "recurrent" },
      { id: "r2", name: "Setup fee", unitPrice: 300, volumeM1: 1, volumeM12: 4, type: "ponctuel" },
    ],
    fixedExpenses: [
      { id: "f1", name: "Loyer", monthlyAmount: 800, category: "Loyer" },
      { id: "f2", name: "Salaires", monthlyAmount: 3000, category: "Salaires" },
    ],
    variableExpenses: [
      { id: "v1", name: "Hébergement", mode: "percent", percentOfRevenue: 8, category: "Logiciels" },
      { id: "v2", name: "Frais de dossier", mode: "unit", unitCost: 2, category: "Autre" },
    ],
    investments: [{ id: "i1", name: "Matériel", amountHT: 5000, amortizationYears: 3 }],
    financing: {
      personalContribution: 4000,
      honorLoan: 3000,
      bankLoan: { amount: 6800, annualRate: 3.5, months: 48 },
      subsidies: 0,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("Excel workbook generation", () => {
  it("builds a workbook with the 8 expected sheets and writes without throwing", () => {
    const project = sampleProject();
    const results = computeProjectResults(project);
    const wb = buildProjectWorkbook(project, results);

    expect(wb.SheetNames).toEqual([
      "Guide",
      "Hyp",
      "Revenus",
      "CR",
      "Financement",
      "Tresorerie",
      "Seuil",
      "KPIs",
      "Suivi",
      "Synthese",
    ]);

    // Ne doit pas lever d'exception à l'écriture binaire.
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it("carries formulas (not static values) on computed cells", () => {
    const project = sampleProject();
    const results = computeProjectResults(project);
    const wb = buildProjectWorkbook(project, results);

    const cr = wb.Sheets["CR"];
    expect(cr["B4"]?.f).toBeDefined(); // Produits d'exploitation Année 1
    expect(cr["B12"]?.f).toBeDefined(); // Résultat net Année 1

    const revenus = wb.Sheets["Revenus"];
    expect(revenus["B4"]?.f).toContain("Hyp!");
  });

  // Régression : une cellule de formule sans valeur en cache (`v`) est
  // silencieusement supprimée par SheetJS à l'écriture binaire — le
  // classeur s'ouvrait donc avec des onglets calculés vides jusqu'à un
  // recalcul manuel. Ce test écrit réellement le classeur puis le relit,
  // comme un utilisateur qui télécharge le fichier et le rouvre.
  it("survives a real write -> read round-trip with correct cached values, not just in-memory", () => {
    const project = sampleProject();
    const results = computeProjectResults(project);
    const wb = buildProjectWorkbook(project, results);
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
    const reloaded = XLSX.read(buffer, { type: "buffer" });

    const cr = reloaded.Sheets["CR"];
    expect(cr["B4"]).toBeDefined();
    expect(cr["B4"].f).toBeDefined();
    expect(cr["B4"].v).toBeCloseTo(results.incomeStatement.years[0].revenue, 2);
    expect(cr["B12"].v).toBeCloseTo(results.incomeStatement.years[0].netResult, 2);
    expect(cr["D12"].v).toBeCloseTo(results.incomeStatement.years[2].netResult, 2);

    const tresorerie = reloaded.Sheets["Tresorerie"];
    expect(tresorerie["F15"].v).toBeCloseTo(results.cashFlow.endOfYearCash, 2);

    const financement = reloaded.Sheets["Financement"];
    expect(financement["B20"].v).toBeCloseTo(project.financing.bankLoan.amount, 2);

    const suivi = reloaded.Sheets["Suivi"];
    expect(suivi["B7"].v).toBeCloseTo(results.revenue.totalMonthlyYear1[0], 2);
  });
});
