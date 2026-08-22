import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import type JSZip from "jszip";
import { computeProjectResults } from "@/lib/finance";
import type { Project } from "@/lib/finance/types";
import { buildWorkbookAndPlans as buildExportPlans } from "./generate";
import { buildWorkbookAndPlans as buildTemplatePlans } from "./sector-templates";
import { SECTOR_TEMPLATES } from "./sector-templates-meta";
import { polishWorkbook } from "./xlsx-polish";

function sampleProject(): Project {
  return {
    id: "polish-test",
    name: "Projet stylé",
    sector: "Tech / SaaS",
    legalStatus: "SASU",
    startDate: "2026-01-01",
    initialCash: 8000,
    seasonality: "b2b-saas",
    revenueSources: [
      { id: "r1", name: "Abonnement", unitPrice: 49, volumeM1: 5, volumeM12: 80, type: "recurrent" },
    ],
    fixedExpenses: [{ id: "f1", name: "Loyer", monthlyAmount: 800, category: "Loyer" }],
    variableExpenses: [{ id: "v1", name: "Hébergement", mode: "percent", percentOfRevenue: 8, category: "Logiciels" }],
    investments: [{ id: "i1", name: "Matériel", amountHT: 5000, amortizationYears: 3 }],
    financing: {
      personalContribution: 5000,
      honorLoan: 0,
      bankLoan: { amount: 0, annualRate: 0, months: 0 },
      subsidies: 0,
    },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

async function polish(wb: XLSX.WorkBook, plans: Parameters<typeof polishWorkbook>[1]): Promise<Uint8Array> {
  const raw = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  return polishWorkbook(new Uint8Array(raw), plans);
}

describe("full workbook polishing (export + sector templates)", () => {
  it("polishes the exported dossier: gridlines hidden on every sheet, values intact", async () => {
    const project = sampleProject();
    const results = computeProjectResults(project);
    const { wb, plans } = buildExportPlans(project, results);
    const polished = await polish(wb, plans);

    // Ne doit rien casser : les valeurs/formules doivent rester lisibles.
    const reread = XLSX.read(polished, { type: "array" });
    expect(reread.Sheets["CR"]["B4"].v).toBeCloseTo(results.incomeStatement.years[0].revenue, 2);
    expect(reread.Sheets["CR"]["B12"].f).toBeDefined();

    const zip = await (await import("jszip")).default.loadAsync(polished);
    for (const sheetName of wb.SheetNames) {
      const plan = plans.find((p) => p.sheetName === sheetName);
      if (!plan) continue;
      const sheetPath = await findSheetPath(zip, sheetName);
      const xml = await zip.file(sheetPath)!.async("string");
      expect(xml).toContain('showGridLines="0"');
    }

    // Le bandeau de titre CR doit être stylé (fond navy) et fusionné.
    const crXml = await zip.file(await findSheetPath(zip, "CR"))!.async("string");
    expect(crXml).toMatch(/<c r="A1"[^>]* s="\d+"/);
    const stylesXml = await zip.file("xl/styles.xml")!.async("string");
    expect(stylesXml).toContain('fgColor rgb="FF0F2A44"'); // navy
    expect(stylesXml).toContain('fgColor rgb="FFEAFBFC"'); // turquoise pâle (cellules d'entrée)
  });

  it.each(SECTOR_TEMPLATES.map((t) => t.id))(
    "polishes the %s sector template: Hyp input cells tinted, values intact",
    async (id) => {
      const { wb, plans } = buildTemplatePlans(id);
      const polished = await polish(wb, plans);

      const reread = XLSX.read(polished, { type: "array" });
      expect(reread.Sheets["CR"]["B4"].v).toBeGreaterThan(0);

      const zip = await (await import("jszip")).default.loadAsync(polished);
      const hypPath = await findSheetPath(zip, "Hyp");
      const hypXml = await zip.file(hypPath)!.async("string");
      expect(hypXml).toContain('showGridLines="0"');
      // Une cellule de saisie encore vierge (au-delà des 2 exemples, ex. 3e
      // source de revenus) doit malgré tout être teintée — c'est tout
      // l'intérêt du plan de style appliqué sur la plage complète.
      expect(hypXml).toMatch(/<c r="B20" s="\d+"\/>/);

      const guidePath = await findSheetPath(zip, "Guide");
      const guideXml = await zip.file(guidePath)!.async("string");
      expect(guideXml).toContain('showGridLines="0"');
      expect(guideXml).toMatch(/<c r="A1"[^>]* s="\d+"/);
    }
  );
});

async function findSheetPath(zip: JSZip, sheetName: string): Promise<string> {
  const workbookXml = await zip.file("xl/workbook.xml")!.async("string");
  const relsXml = await zip.file("xl/_rels/workbook.xml.rels")!.async("string");
  const sheetMatch = workbookXml.match(new RegExp(`<sheet name="${sheetName}"[^>]*r:id="([^"]+)"`));
  if (!sheetMatch) throw new Error(`feuille "${sheetName}" introuvable dans workbook.xml`);
  const relMatch = relsXml.match(new RegExp(`<Relationship Id="${sheetMatch[1]}"[^>]*Target="([^"]+)"`));
  if (!relMatch) throw new Error(`relation introuvable pour "${sheetName}"`);
  return `xl/${relMatch[1].replace(/^\.?\//, "")}`;
}
