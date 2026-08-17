import type { PdfPageText } from "./extract-text";
import type { ParseResult } from "@/lib/project-import-types";
import { parseFrenchNumber, uid } from "@/lib/project-import-types";

/**
 * Repère un montant en euros situé raisonnablement près (≤ 40 caractères)
 * d'un mot-clé, dans le texte joint du document. Best-effort uniquement :
 * un document PDF quelconque n'a pas de structure connue, contrairement à
 * un export FinAxis (voir parse-finaxis-pdf.ts) — c'est une extraction de
 * secours, pas une lecture fiable.
 */
function findAmountNear(text: string, keywords: string[]): number | null {
  // Normalise les apostrophes typographiques ("’") en apostrophes ASCII
  // pour que les mots-clés (écrits avec une apostrophe simple) matchent
  // quelle que soit celle utilisée dans le document source.
  const normalized = text.replace(/[’‘]/g, "'");
  for (const keyword of keywords) {
    const pattern = new RegExp(`${keyword}[^\\d€]{0,40}?(-?[\\d\\s]{1,3}(?:[\\s.]\\d{3})*(?:[,.]\\d+)?)\\s*€`, "i");
    const match = normalized.match(pattern);
    if (match) {
      const value = parseFrenchNumber(match[1]);
      if (value > 0) return value;
    }
  }
  return null;
}

/**
 * Parseur de secours pour un PDF qui n'a pas la structure d'un export
 * FinAxis (autre outil, document scanné avec couche de texte, business
 * plan rédigé à la main...). Ne tente de récupérer que quelques montants
 * clés explicitement annoncés par un mot-clé reconnaissable ; tout le
 * reste (charges détaillées, sources de revenus, investissements) doit
 * être complété manuellement — c'est annoncé clairement dans les
 * avertissements plutôt que deviné au hasard.
 */
export function parseGenericPdf(pages: PdfPageText[]): ParseResult {
  const warnings: string[] = [
    "Ce PDF ne provient pas de FinAxis : sa mise en page n'est pas connue, donc seuls quelques montants explicitement libellés ont pu être repérés. Complétez le reste manuellement dans les étapes suivantes.",
  ];

  const fullText = pages.map((p) => p.items.join(" ")).join(" ");

  const annualRevenue = findAmountNear(fullText, [
    "chiffre d'affaires",
    "CA prévisionnel",
    "CA annuel",
    "ventes annuelles",
  ]);
  const initialCash = findAmountNear(fullText, ["trésorerie de départ", "trésorerie initiale", "apport en trésorerie"]);
  const personalContribution = findAmountNear(fullText, ["apport personnel", "apport en fonds propres", "apport"]);
  const honorLoan = findAmountNear(fullText, ["prêt d'honneur"]);
  const bankLoanAmount = findAmountNear(fullText, ["emprunt bancaire", "prêt bancaire", "crédit bancaire"]);
  const subsidies = findAmountNear(fullText, ["subvention"]);

  if (annualRevenue) {
    warnings.push(
      `Un chiffre d'affaires annuel de ${Math.round(annualRevenue)} € a été détecté et placé dans une source de revenus unique « Chiffre d'affaires (à détailler) » — pensez à le répartir en vos véritables sources à l'étape 2.`
    );
  } else {
    warnings.push("Aucun chiffre d'affaires n'a pu être détecté — à saisir manuellement à l'étape 2.");
  }
  warnings.push("Les charges fixes et variables n'ont pas pu être extraites de ce document — à saisir à l'étape 3.");
  warnings.push("Les investissements n'ont pas pu être extraits de ce document — à saisir à l'étape 4.");

  return {
    data: {
      name: "",
      sector: "Autre",
      legalStatus: "Autre",
      startDate: new Date().toISOString().slice(0, 10),
      initialCash: initialCash ?? 0,
      seasonality: "stable",
      revenueSources: annualRevenue
        ? [
            {
              id: uid(),
              name: "Chiffre d'affaires (à détailler)",
              unitPrice: Math.round(annualRevenue / 12),
              volumeM1: 1,
              volumeM12: 1,
              type: "recurrent",
            },
          ]
        : [],
      fixedExpenses: [],
      variableExpenses: [],
      investments: [],
      financing: {
        personalContribution: personalContribution ?? 0,
        honorLoan: honorLoan ?? 0,
        bankLoan: { amount: bankLoanAmount ?? 0, annualRate: 0, months: bankLoanAmount ? 60 : 0 },
        subsidies: subsidies ?? 0,
      },
    },
    warnings,
  };
}
