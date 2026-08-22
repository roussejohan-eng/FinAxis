import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import type { Project } from "@/lib/finance/types";
import { computeProjectResults } from "@/lib/finance";
import { buildProjectWorkbook } from "./generate";
import { SECTOR_TEMPLATES, buildSectorTemplateWorkbook, type SectorTemplateId } from "./sector-templates";
import { readProjectFromHypSheet } from "./project-sheet-layout";

function sampleProject(): Project {
  return {
    id: "roundtrip",
    name: "Lavage de pierres tombales",
    sector: "Artisanat",
    legalStatus: "Micro-entreprise",
    startDate: "2026-03-01",
    initialCash: 1500,
    seasonality: "ete",
    revenueSources: [
      { id: "r1", name: "Nettoyage de pierre tombale", unitPrice: 90, volumeM1: 3, volumeM12: 14, type: "ponctuel" },
      { id: "r2", name: "Contrat d'entretien annuel", unitPrice: 150, volumeM1: 0, volumeM12: 6, type: "recurrent" },
    ],
    fixedExpenses: [
      { id: "f1", name: "Assurance véhicule", monthlyAmount: 90, category: "Assurances" },
      { id: "f2", name: "Comptable", monthlyAmount: 60, category: "Comptabilité" },
    ],
    variableExpenses: [
      { id: "v1", name: "Produits nettoyants", mode: "unit", unitCost: 8, category: "Autre" },
    ],
    investments: [{ id: "i1", name: "Nettoyeur haute pression", amountHT: 2200, amortizationYears: 4 }],
    financing: {
      personalContribution: 2200,
      honorLoan: 0,
      bankLoan: { amount: 0, annualRate: 0, months: 0 },
      subsidies: 0,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

const ALL_SHEETS = ["Guide", "Hyp", "Revenus", "CR", "Financement", "Tresorerie", "Seuil", "Suivi", "KPIs", "Synthese"];

describe("Excel import", () => {
  it.each(SECTOR_TEMPLATES.map((t) => t.id))(
    "produces a downloadable %s template with all 10 sheets, that round-trips with no warnings",
    (id: SectorTemplateId) => {
      const wb = buildSectorTemplateWorkbook(id);
      expect(wb.SheetNames).toEqual(ALL_SHEETS);

      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
      expect(buffer.length).toBeGreaterThan(1000);

      // Le fichier écrit puis relu (comme un utilisateur qui le télécharge et
      // le redépose tel quel) doit se relire à l'identique : c'est le test
      // qui aurait attrapé le bug de confusion sommaire/page de contenu du
      // côté import PDF si son équivalent Excel existait ici.
      const reloaded = XLSX.read(buffer, { type: "buffer" });
      const { data, warnings } = readProjectFromHypSheet(reloaded.Sheets["Hyp"]);

      expect(data.revenueSources.length).toBeGreaterThan(0);
      expect(data.fixedExpenses.length).toBeGreaterThan(0);
      expect(data.investments.length).toBeGreaterThan(0);

      // Seul avertissement attendu sur un modèle vierge : le nom est à saisir.
      expect(warnings.some((w) => w.toLowerCase().includes("nom du projet"))).toBe(true);
      expect(warnings.some((w) => w.includes("financement"))).toBe(false);
    }
  );

  it("round-trips a project through export -> re-read without data loss", () => {
    const project = sampleProject();
    const results = computeProjectResults(project);
    const wb = buildProjectWorkbook(project, results);
    const { data, warnings } = readProjectFromHypSheet(wb.Sheets["Hyp"]);

    expect(data.name).toBe(project.name);
    expect(data.sector).toBe(project.sector);
    expect(data.legalStatus).toBe(project.legalStatus);
    expect(data.startDate).toBe(project.startDate);
    expect(data.initialCash).toBe(project.initialCash);
    expect(data.seasonality).toBe(project.seasonality);

    expect(data.revenueSources).toHaveLength(2);
    expect(data.revenueSources[0].name).toBe("Nettoyage de pierre tombale");
    expect(data.revenueSources[0].unitPrice).toBe(90);
    expect(data.revenueSources[1].type).toBe("recurrent");

    expect(data.fixedExpenses).toHaveLength(2);
    expect(data.fixedExpenses[0].category).toBe("Assurances");

    expect(data.variableExpenses).toHaveLength(1);
    expect(data.variableExpenses[0].mode).toBe("unit");
    expect(data.variableExpenses[0].unitCost).toBe(8);

    expect(data.investments).toHaveLength(1);
    expect(data.investments[0].amortizationYears).toBe(4);

    expect(data.financing.personalContribution).toBe(2200);

    // Le plan de financement de ce projet est équilibré (2200 = 2200).
    expect(warnings.some((w) => w.includes("financement"))).toBe(false);
  });

  it("flags an unbalanced financing plan and an empty project name", () => {
    const project = sampleProject();
    project.name = "";
    project.financing.personalContribution = 500; // ne couvre plus l'investissement de 2200 €
    const results = computeProjectResults(project);
    const wb = buildProjectWorkbook(project, results);
    const { warnings } = readProjectFromHypSheet(wb.Sheets["Hyp"]);

    expect(warnings.some((w) => w.toLowerCase().includes("nom du projet"))).toBe(true);
    expect(warnings.some((w) => w.includes("financement"))).toBe(true);
  });
});
