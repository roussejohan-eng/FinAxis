import { describe, expect, it } from "vitest";
import type { PdfPageText } from "./extract-text";
import { parseGenericPdf } from "./parse-generic-pdf";

describe("generic PDF fallback parser", () => {
  it("extracts a handful of recognizable amounts and flags the rest as manual", () => {
    const pages: PdfPageText[] = [
      {
        pageNumber: 1,
        items: [
          "Business plan — Lavage de pierres tombales",
          "Notre chiffre d'affaires prévisionnel est estimé à 24 000 € pour la première année.",
          "L'apport personnel du porteur de projet s'élève à 3 000 €.",
          "Un emprunt bancaire de 5 000 € complète le financement.",
        ],
      },
    ];

    const { data, warnings } = parseGenericPdf(pages);

    expect(data.revenueSources).toHaveLength(1);
    expect(data.revenueSources[0].unitPrice).toBe(2000); // 24 000 / 12
    expect(data.financing.personalContribution).toBe(3000);
    expect(data.financing.bankLoan.amount).toBe(5000);
    expect(data.fixedExpenses).toHaveLength(0);
    expect(data.investments).toHaveLength(0);

    expect(warnings.length).toBeGreaterThan(3);
    expect(warnings[0]).toContain("ne provient pas de FinAxis");
  });

  it("returns an empty-but-valid draft and clear warnings when nothing is recognizable", () => {
    const pages: PdfPageText[] = [{ pageNumber: 1, items: ["Un document sans aucun montant reconnaissable."] }];
    const { data, warnings } = parseGenericPdf(pages);

    expect(data.revenueSources).toHaveLength(0);
    expect(data.initialCash).toBe(0);
    expect(warnings.some((w) => w.includes("Aucun chiffre d'affaires"))).toBe(true);
  });
});
