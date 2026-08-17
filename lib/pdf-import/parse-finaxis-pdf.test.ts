import { describe, expect, it } from "vitest";
import type { PdfPageText } from "./extract-text";
import { looksLikeFinAxisPdf, parseFinAxisPdf } from "./parse-finaxis-pdf";

// Extrait tel quel (pdf.js) d'un PDF FinAxis réellement généré pour le
// projet "Nova Conseil" (voir lib/pdf/document.tsx) — sert de fixture de
// non-régression pour le parseur, indépendamment du rendu PDF lui-même.
const NOVA_CONSEIL_PAGES: PdfPageText[] = [
  {
    pageNumber: 1,
    items: [
      "Fin",
      "xis",
      "Comprendre, prévoir, réussir.",
      "Dossier financier prévisionnel",
      "Nova Conseil",
      "Secteur d'activité : Services",
      "Statut juridique envisagé : SASU",
      "Date de démarrage prévue : 01 janvier 2026",
      "Généré le 15 août 2026 avec FinAxis",
    ],
  },
  {
    pageNumber: 4,
    items: [
      "Fin",
      "xis",
      "Nova Conseil",
      "Page 4",
      "FinAxis · Document confidentiel · 15 août 2026",
      "Page 4 sur 12",
      "Hypothèses du projet",
      "Secteur d'activité : Services",
      "Statut juridique : SASU",
      "Date de démarrage : 01 janvier 2026",
      "Trésorerie de départ : 8 000 €",
      "Profil de saisonnalité : B2B / SaaS",
      "Sources de revenus",
      "Nom",
      "Prix HT",
      "Volume M1",
      "Volume M12",
      "Type",
      "Abonnement Standard",
      "49 €",
      "5",
      "80",
      "Récurrent",
      "Prestations de conseil",
      "900 €",
      "1",
      "5",
      "Ponctuel",
      "Setup fee",
      "300 €",
      "1",
      "4",
      "Ponctuel",
      "Charges fixes",
      "Nom",
      "Montant mensuel",
      "Catégorie",
      "Loyer bureaux",
      "800 €",
      "Loyer",
      "Salaires",
      "4 200 €",
      "Salaires",
      "Logiciels SaaS",
      "320 €",
      "Logiciels",
      "Marketing",
      "600 €",
      "Marketing",
      "Comptabilité",
      "180 €",
      "Comptabilité",
      "Assurance RC Pro",
      "90 €",
      "Assurances",
      "Charges variables",
      "Nom",
      "Mode",
      "Valeur",
      "Catégorie",
      "Hébergement cloud",
      "% du CA",
      "6 %",
      "Logiciels",
      "Frais de dossier",
      "Montant × volume",
      "3 €",
      "Autre",
      "Investissements",
      "Nom",
      "Montant HT",
      "Amortissement",
      "Matériel informatique",
      "6 000 €",
      "3 ans",
      "Frais de création",
      "1 200 €",
      "1 an",
      "Dépôt de garantie",
      "1 600 €",
      "3 ans",
    ],
  },
  {
    pageNumber: 9,
    items: [
      "Fin",
      "xis",
      "Nova Conseil",
      "Page 9",
      "FinAxis · Document confidentiel · 15 août 2026",
      "Page 9 sur 12",
      "Plan de financement",
      "Besoins",
      "Investissements",
      "8 800 €",
      "Besoin en fonds de roulement",
      "6 672 €",
      "Trésorerie de départ",
      "8 000 €",
      "Total besoins",
      "23 472 €",
      "Ressources",
      "Apport personnel",
      "8 000 €",
      "Prêt d'honneur",
      "5 000 €",
      "Emprunt bancaire",
      "12 000 €",
      "Subventions",
      "2 000 €",
      "Total ressources",
      "27 000 €",
      "Tableau d'amortissement de l'emprunt bancaire",
      "Conditions de l'emprunt : taux annuel 3,8 %, durée 60 mois.",
      "Période",
      "Capital restant dû",
      "Échéance",
      "Capital remboursé",
      "Intérêts",
      "Capital en fin",
    ],
  },
];

describe("FinAxis PDF detection", () => {
  it("recognizes a FinAxis-generated PDF from the cover page", () => {
    expect(looksLikeFinAxisPdf(NOVA_CONSEIL_PAGES)).toBe(true);
  });

  it("rejects a PDF that doesn't match the FinAxis cover", () => {
    expect(looksLikeFinAxisPdf([{ pageNumber: 1, items: ["Some other document", "with random text"] }])).toBe(
      false
    );
  });
});

describe("FinAxis PDF parser", () => {
  it("recovers project info, revenues, charges, investments and financing", () => {
    const { data, warnings } = parseFinAxisPdf(NOVA_CONSEIL_PAGES);

    expect(data.name).toBe("Nova Conseil");
    expect(data.sector).toBe("Services");
    expect(data.legalStatus).toBe("SASU");
    expect(data.startDate).toBe("2026-01-01");
    expect(data.initialCash).toBe(8000);
    expect(data.seasonality).toBe("b2b-saas");

    expect(data.revenueSources).toHaveLength(3);
    expect(data.revenueSources[0]).toMatchObject({
      name: "Abonnement Standard",
      unitPrice: 49,
      volumeM1: 5,
      volumeM12: 80,
      type: "recurrent",
    });
    expect(data.revenueSources[2].type).toBe("ponctuel");

    expect(data.fixedExpenses).toHaveLength(6);
    expect(data.fixedExpenses[1]).toMatchObject({ name: "Salaires", monthlyAmount: 4200, category: "Salaires" });

    expect(data.variableExpenses).toHaveLength(2);
    expect(data.variableExpenses[0]).toMatchObject({ mode: "percent", percentOfRevenue: 6 });
    expect(data.variableExpenses[1]).toMatchObject({ mode: "unit", unitCost: 3 });

    expect(data.investments).toHaveLength(3);
    expect(data.investments[0]).toMatchObject({ name: "Matériel informatique", amountHT: 6000, amortizationYears: 3 });
    expect(data.investments[1].amortizationYears).toBe(1);

    expect(data.financing).toMatchObject({
      personalContribution: 8000,
      honorLoan: 5000,
      subsidies: 2000,
      bankLoan: { amount: 12000, annualRate: 3.8, months: 60 },
    });

    // Ce document de démonstration n'a pas un plan de financement équilibré
    // (investissements 8 800 € vs ressources 27 000 €, le surplus couvrant le
    // BFR et la trésorerie de départ) : l'avertissement correspondant doit
    // apparaître, avec les bons montants.
    expect(warnings.some((w) => w.includes("8800") && w.includes("27000"))).toBe(true);
  });
});
