import type { PdfPageText } from "./extract-text";
import type { ParsedProjectData, ParseResult } from "@/lib/project-import-types";
import { matchOption, parseFrenchLongDate, parseFrenchNumber, uid } from "@/lib/project-import-types";
import { FIXED_EXPENSE_CATEGORIES, LEGAL_STATUS_OPTIONS, SECTOR_OPTIONS } from "@/lib/wizard/options";
import { SEASONALITY_LABELS } from "@/lib/finance/seasonality";
import type { SeasonalityProfile } from "@/lib/finance/types";

const COVER_MARKER = "Dossier financier prévisionnel";
const HYPOTHESES_MARKER = "Hypothèses du projet";
const FINANCING_MARKER = "Plan de financement";

/** true si ce texte a la structure d'un PDF généré par FinAxis (voir lib/pdf/document.tsx). */
export function looksLikeFinAxisPdf(pages: PdfPageText[]): boolean {
  const firstPage = pages[0]?.items.join(" ") ?? "";
  return firstPage.includes(COVER_MARKER) && firstPage.includes("FinAxis");
}

/**
 * Cherche la page contenant un marqueur de section donné. Le sommaire
 * (page 2) reprend le titre de chaque section dans sa table des matières —
 * ex. « Hypothèses du projet » y apparaît aussi bien qu'en page 4 — donc un
 * simple `items.includes(marker)` peut retomber sur le sommaire au lieu de
 * la vraie page. On exige en plus la présence d'un second repère qui
 * n'existe que sur la page de contenu réelle (jamais dans le sommaire).
 */
function findPage(pages: PdfPageText[], marker: string, contentMarkerStartsWith: string): PdfPageText | undefined {
  return pages.find(
    (p) => p.items.includes(marker) && p.items.some((it) => it.startsWith(contentMarkerStartsWith))
  );
}

function labelValue(items: string[], label: string): string | undefined {
  const idx = items.indexOf(label);
  if (idx === -1 || idx + 1 >= items.length) return undefined;
  return items[idx + 1];
}

/** Trouve la fin d'une section de tableau : le prochain marqueur de section connu. */
function findSectionEnd(items: string[], from: number, markers: string[]): number {
  for (let i = from; i < items.length; i++) {
    if (markers.includes(items[i])) return i;
  }
  return items.length;
}

function consumeRows(
  items: string[],
  headerIdx: number,
  columnCount: number,
  stopMarkers: string[],
  warnings: string[],
  sectionLabel: string
): string[][] {
  const dataStart = headerIdx + columnCount; // saute la ligne d'en-tête du tableau
  const end = findSectionEnd(items, dataStart, stopMarkers);
  const slice = items.slice(dataStart, end);
  const rows: string[][] = [];
  for (let i = 0; i + columnCount <= slice.length; i += columnCount) {
    rows.push(slice.slice(i, i + columnCount));
  }
  if (slice.length % columnCount !== 0) {
    warnings.push(
      `La section « ${sectionLabel} » n'a pas pu être lue intégralement (un nom probablement trop long a coupé une ligne) — vérifiez-la à l'étape correspondante.`
    );
  }
  return rows;
}

const SECTION_MARKERS = [
  "Sources de revenus",
  "Charges fixes",
  "Aucune charge fixe saisie.",
  "Charges variables",
  "Aucune charge variable saisie.",
  "Investissements",
  "Aucun investissement saisi.",
];

/**
 * Parseur haute-fidélité pour un PDF généré par FinAxis lui-même : la page
 * « Hypothèses du projet » contient exactement les mêmes tableaux (mêmes
 * intitulés, même ordre) que le wizard et l'export Excel, et pdf.js
 * restitue le texte dans l'ordre d'écriture — donc dans l'ordre exact des
 * cellules telles qu'écrites par @react-pdf/renderer.
 */
export function parseFinAxisPdf(pages: PdfPageText[]): ParseResult {
  const warnings: string[] = [];

  // Nom du projet : juste après le titre de couverture, page 1.
  const cover = pages[0]?.items ?? [];
  const coverIdx = cover.indexOf(COVER_MARKER);
  const name = coverIdx !== -1 && coverIdx + 1 < cover.length ? cover[coverIdx + 1] : "";
  if (!name) warnings.push("Le nom du projet n'a pas pu être lu sur la page de couverture.");

  const hypPage = findPage(pages, HYPOTHESES_MARKER, "Secteur d'activité");
  if (!hypPage) {
    warnings.push(
      "La page « Hypothèses du projet » est introuvable dans ce PDF — seul le nom du projet a pu être récupéré."
    );
    return { data: emptyParsedData(name), warnings };
  }
  const items = hypPage.items;

  // Les paragraphes "Secteur d'activité : Services" sont un seul item pdf.js
  // ("Label : valeur"), pas un couple séparé — d'où extractAfterColon
  // plutôt que la recherche label/valeur utilisée pour les tableaux.
  const sector = matchOption(extractAfterColon(items, "Secteur d'activité"), SECTOR_OPTIONS, "Autre");
  const legalStatus = matchOption(extractAfterColon(items, "Statut juridique"), LEGAL_STATUS_OPTIONS, "Autre");

  const dateRaw = extractAfterColon(items, "Date de démarrage");
  const startDate = parseFrenchLongDate(dateRaw) ?? new Date().toISOString().slice(0, 10);
  if (dateRaw && !parseFrenchLongDate(dateRaw)) {
    warnings.push(`Date de démarrage « ${dateRaw} » illisible, à vérifier dans l'étape 1.`);
  }

  const initialCash = parseFrenchNumber(extractAfterColon(items, "Trésorerie de départ"));

  const seasonalityRaw = extractAfterColon(items, "Profil de saisonnalité");
  const seasonalityEntry = (Object.entries(SEASONALITY_LABELS) as [SeasonalityProfile, string][]).find(
    ([, label]) => label.toLowerCase() === seasonalityRaw.toLowerCase()
  );
  const seasonality: SeasonalityProfile = seasonalityEntry?.[0] ?? "stable";

  // -- Sources de revenus --------------------------------------------
  const revenueSources: ParsedProjectData["revenueSources"] = [];
  const sourcesHeaderIdx = items.indexOf("Sources de revenus");
  if (sourcesHeaderIdx !== -1) {
    const rows = consumeRows(items, sourcesHeaderIdx + 1, 5, SECTION_MARKERS, warnings, "Sources de revenus");
    for (const [nom, prix, volM1, volM12, type] of rows) {
      revenueSources.push({
        id: uid(),
        name: nom,
        unitPrice: parseFrenchNumber(prix),
        volumeM1: parseFrenchNumber(volM1),
        volumeM12: parseFrenchNumber(volM12),
        type: type.toLowerCase() === "ponctuel" ? "ponctuel" : "recurrent",
      });
    }
  }
  if (revenueSources.length === 0) {
    warnings.push("Aucune source de revenus détectée dans le PDF.");
  }

  // -- Charges fixes ----------------------------------------------------
  const fixedExpenses: ParsedProjectData["fixedExpenses"] = [];
  const fixedHeaderIdx = items.indexOf("Charges fixes");
  if (fixedHeaderIdx !== -1 && items[fixedHeaderIdx + 1] !== "Aucune charge fixe saisie.") {
    const rows = consumeRows(items, fixedHeaderIdx + 1, 3, SECTION_MARKERS, warnings, "Charges fixes");
    for (const [nom, montant, categorie] of rows) {
      fixedExpenses.push({
        id: uid(),
        name: nom,
        monthlyAmount: parseFrenchNumber(montant),
        category: matchOption(categorie, FIXED_EXPENSE_CATEGORIES, "Autre"),
      });
    }
  }

  // -- Charges variables --------------------------------------------
  const variableExpenses: ParsedProjectData["variableExpenses"] = [];
  const variableHeaderIdx = items.indexOf("Charges variables");
  if (variableHeaderIdx !== -1 && items[variableHeaderIdx + 1] !== "Aucune charge variable saisie.") {
    const rows = consumeRows(items, variableHeaderIdx + 1, 4, SECTION_MARKERS, warnings, "Charges variables");
    for (const [nom, mode, valeur, categorie] of rows) {
      const isPercent = mode.includes("%");
      variableExpenses.push({
        id: uid(),
        name: nom,
        mode: isPercent ? "percent" : "unit",
        percentOfRevenue: isPercent ? parseFrenchNumber(valeur) : 0,
        unitCost: isPercent ? 0 : parseFrenchNumber(valeur),
        category: matchOption(categorie, FIXED_EXPENSE_CATEGORIES, "Autre"),
      });
    }
  }

  // -- Investissements ------------------------------------------------
  const investments: ParsedProjectData["investments"] = [];
  const investHeaderIdx = items.indexOf("Investissements");
  if (investHeaderIdx !== -1 && items[investHeaderIdx + 1] !== "Aucun investissement saisi.") {
    const rows = consumeRows(items, investHeaderIdx + 1, 3, SECTION_MARKERS, warnings, "Investissements");
    for (const [nom, montant, duree] of rows) {
      investments.push({
        id: uid(),
        name: nom,
        amountHT: parseFrenchNumber(montant),
        amortizationYears: parseFrenchNumber(duree) || 1,
      });
    }
  }

  // -- Plan de financement ---------------------------------------------
  const finPage = findPage(pages, FINANCING_MARKER, "Besoins");
  const finItems = finPage?.items ?? [];
  const personalContribution = parseFrenchNumber(labelValue(finItems, "Apport personnel") ?? "0");
  const honorLoan = parseFrenchNumber(labelValue(finItems, "Prêt d'honneur") ?? "0");
  const loanAmount = parseFrenchNumber(labelValue(finItems, "Emprunt bancaire") ?? "0");
  const subsidies = parseFrenchNumber(labelValue(finItems, "Subventions") ?? "0");

  let annualRate = 0;
  let months = 0;
  if (loanAmount > 0) {
    const joined = finItems.join(" ");
    const match = joined.match(/taux annuel ([\d,.]+)\s*%,?\s*durée (\d+)\s*mois/i);
    if (match) {
      annualRate = parseFrenchNumber(match[1]);
      months = Number(match[2]);
    } else {
      warnings.push("Le taux et la durée de l'emprunt bancaire n'ont pas pu être lus — à vérifier à l'étape 4.");
    }
  }

  if (!finPage) {
    warnings.push("La page « Plan de financement » est introuvable — apport, prêt et subventions non récupérés.");
  }

  const totalNeeds = investments.reduce((sum, i) => sum + i.amountHT, 0);
  const totalResources = personalContribution + honorLoan + loanAmount + subsidies;
  if (Math.round(totalNeeds) !== Math.round(totalResources)) {
    warnings.push(
      `Le plan de financement n'est pas équilibré (besoins : ${Math.round(totalNeeds)} €, ressources : ${Math.round(totalResources)} €) — vous pourrez l'ajuster à l'étape 4.`
    );
  }

  return {
    data: {
      name,
      sector,
      legalStatus,
      startDate,
      initialCash,
      seasonality,
      revenueSources,
      fixedExpenses,
      variableExpenses,
      investments,
      financing: {
        personalContribution,
        honorLoan,
        bankLoan: { amount: loanAmount, annualRate, months },
        subsidies,
      },
    },
    warnings,
  };
}

/** Les paragraphes de la page Hypothèses sont écrits en un seul item "Label : valeur". */
function extractAfterColon(items: string[], label: string): string {
  const item = items.find((it) => it.startsWith(label));
  if (!item) return "";
  const idx = item.indexOf(":");
  return idx === -1 ? "" : item.slice(idx + 1).trim();
}

function emptyParsedData(name: string): ParsedProjectData {
  return {
    name,
    sector: "Autre",
    legalStatus: "Autre",
    startDate: new Date().toISOString().slice(0, 10),
    initialCash: 0,
    seasonality: "stable",
    revenueSources: [],
    fixedExpenses: [],
    variableExpenses: [],
    investments: [],
    financing: {
      personalContribution: 0,
      honorLoan: 0,
      bankLoan: { amount: 0, annualRate: 0, months: 0 },
      subsidies: 0,
    },
  };
}
