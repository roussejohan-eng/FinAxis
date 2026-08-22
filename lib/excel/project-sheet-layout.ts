import * as XLSX from "xlsx";
import type {
  Investment,
  Project,
  RevenueSource,
  SeasonalityProfile,
  VariableExpense,
  VariableExpenseMode,
} from "@/lib/finance/types";
import { SEASONALITY_COEFFICIENTS, SEASONALITY_LABELS } from "@/lib/finance/seasonality";
import { EUR_FORMAT, finalizeSheet, setLabel, setValue } from "./sheet-helpers";
import { FIXED_EXPENSE_CATEGORIES, LEGAL_STATUS_OPTIONS, SECTOR_OPTIONS } from "@/lib/wizard/options";
import { matchOption, uid, type ParsedProjectData, type ParseResult } from "@/lib/project-import-types";

// -- Gabarit de la feuille "Hyp" (Hypothèses) --------------------------
// Partagé entre l'export du dossier complet (lib/excel/generate.ts) et le
// modèle d'import vierge (lib/excel/project-template.ts) : les deux
// écrivent/lisent exactement les mêmes lignes et colonnes, ce qui permet
// aussi de ré-importer un classeur précédemment exporté par FinAxis.
export const MAX_SOURCES = 10;
export const MAX_FIXED = 20;
export const MAX_VARIABLE = 20;
export const MAX_INVESTMENTS = 10;

export const HYP_SHEET_NAME = "Hyp";

export const ROW = {
  name: 3,
  sector: 4,
  legalStatus: 5,
  startDate: 6,
  initialCash: 7,
  seasonality: 8,
  growthY2: 9,
  growthY3: 10,
  vatRate: 11,
  isReducedRate: 12,
  isStandardRate: 13,
  isThreshold: 14,
  sourcesHeader: 17,
  sourcesStart: 18,
  fixedHeader: 30,
  fixedStart: 31,
  variableHeader: 53,
  variableStart: 54,
  investHeader: 76,
  investStart: 77,
  financingHeader: 88,
  personalContribution: 89,
  honorLoan: 90,
  loanAmount: 91,
  loanRate: 92,
  loanMonths: 93,
  subsidies: 94,
} as const;

export const COL = {
  label: 0,
  value: 1,
  // Sources de revenus
  sourceName: 1,
  sourcePrice: 2,
  sourceVolM1: 3,
  sourceVolM12: 4,
  sourceType: 5,
  // Charges fixes
  fixedName: 1,
  fixedAmount: 2,
  fixedCategory: 3,
  // Charges variables
  variableName: 1,
  variableMode: 2,
  variablePercent: 3,
  variableUnitCost: 4,
  variableCategory: 5,
  // Investissements
  investName: 1,
  investAmount: 2,
  investYears: 3,
} as const;

function cellText(ws: XLSX.WorkSheet, col: number, row: number): string {
  const cell = ws[XLSX.utils.encode_cell({ c: col, r: row - 1 })];
  if (!cell || cell.v === undefined || cell.v === null) return "";
  return String(cell.v).trim();
}

function cellNumber(ws: XLSX.WorkSheet, col: number, row: number): number {
  const raw = cellText(ws, col, row);
  if (!raw) return 0;
  // Tolère "1 234,56" (virgule française) autant que "1234.56".
  const normalized = raw.replace(/\s/g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

/** Écrit toutes les hypothèses d'un projet dans une feuille "Hyp" vierge. */
export function writeProjectToHypSheet(ws: XLSX.WorkSheet, project: Project): void {
  setLabel(ws, COL.label, 1, "FinAxis — Hypothèses du projet");
  setLabel(ws, COL.label, ROW.name, "Nom du projet");
  setValue(ws, COL.value, ROW.name, project.name || "");
  setLabel(ws, COL.label, ROW.sector, "Secteur d'activité");
  setValue(ws, COL.value, ROW.sector, project.sector);
  setLabel(ws, COL.label, ROW.legalStatus, "Statut juridique");
  setValue(ws, COL.value, ROW.legalStatus, project.legalStatus);
  setLabel(ws, COL.label, ROW.startDate, "Date de démarrage");
  setValue(ws, COL.value, ROW.startDate, project.startDate);
  setLabel(ws, COL.label, ROW.initialCash, "Trésorerie de départ (€)");
  setValue(ws, COL.value, ROW.initialCash, project.initialCash, EUR_FORMAT);
  setLabel(ws, COL.label, ROW.seasonality, "Profil de saisonnalité");
  setValue(ws, COL.value, ROW.seasonality, SEASONALITY_LABELS[project.seasonality]);
  setLabel(ws, COL.label, ROW.growthY2, "Croissance Année 2 (%)");
  setValue(ws, COL.value, ROW.growthY2, 30);
  setLabel(ws, COL.label, ROW.growthY3, "Croissance Année 3 (%)");
  setValue(ws, COL.value, ROW.growthY3, 25);
  setLabel(ws, COL.label, ROW.vatRate, "Taux de TVA (%)");
  setValue(ws, COL.value, ROW.vatRate, 20);
  setLabel(ws, COL.label, ROW.isReducedRate, "Taux IS réduit (%)");
  setValue(ws, COL.value, ROW.isReducedRate, 15);
  setLabel(ws, COL.label, ROW.isStandardRate, "Taux IS normal (%)");
  setValue(ws, COL.value, ROW.isStandardRate, 25);
  setLabel(ws, COL.label, ROW.isThreshold, "Seuil IS réduit (€)");
  setValue(ws, COL.value, ROW.isThreshold, 42500, EUR_FORMAT);

  setLabel(ws, COL.label, ROW.sourcesHeader - 1, "Sources de revenus");
  setLabel(ws, COL.sourceName, ROW.sourcesHeader, "Nom");
  setLabel(ws, COL.sourcePrice, ROW.sourcesHeader, "Prix unitaire HT");
  setLabel(ws, COL.sourceVolM1, ROW.sourcesHeader, "Volume M1");
  setLabel(ws, COL.sourceVolM12, ROW.sourcesHeader, "Volume M12");
  setLabel(ws, COL.sourceType, ROW.sourcesHeader, "Type (recurrent / ponctuel)");
  for (let i = 0; i < MAX_SOURCES; i++) {
    const row = ROW.sourcesStart + i;
    const source = project.revenueSources[i];
    if (source) {
      setValue(ws, COL.sourceName, row, source.name);
      setValue(ws, COL.sourcePrice, row, source.unitPrice, EUR_FORMAT);
      setValue(ws, COL.sourceVolM1, row, source.volumeM1);
      setValue(ws, COL.sourceVolM12, row, source.volumeM12);
      setValue(ws, COL.sourceType, row, source.type);
    }
  }

  setLabel(ws, COL.label, ROW.fixedHeader - 1, "Charges fixes");
  setLabel(ws, COL.fixedName, ROW.fixedHeader, "Nom");
  setLabel(ws, COL.fixedAmount, ROW.fixedHeader, "Montant mensuel HT");
  setLabel(ws, COL.fixedCategory, ROW.fixedHeader, "Catégorie");
  for (let i = 0; i < MAX_FIXED; i++) {
    const row = ROW.fixedStart + i;
    const expense = project.fixedExpenses[i];
    if (expense) {
      setValue(ws, COL.fixedName, row, expense.name);
      setValue(ws, COL.fixedAmount, row, expense.monthlyAmount, EUR_FORMAT);
      setValue(ws, COL.fixedCategory, row, expense.category);
    }
  }

  setLabel(ws, COL.label, ROW.variableHeader - 1, "Charges variables");
  setLabel(ws, COL.variableName, ROW.variableHeader, "Nom");
  setLabel(ws, COL.variableMode, ROW.variableHeader, "Mode (percent / unit)");
  setLabel(ws, COL.variablePercent, ROW.variableHeader, "% du CA");
  setLabel(ws, COL.variableUnitCost, ROW.variableHeader, "Coût unitaire HT");
  setLabel(ws, COL.variableCategory, ROW.variableHeader, "Catégorie");
  for (let i = 0; i < MAX_VARIABLE; i++) {
    const row = ROW.variableStart + i;
    const expense = project.variableExpenses[i];
    if (expense) {
      setValue(ws, COL.variableName, row, expense.name);
      setValue(ws, COL.variableMode, row, expense.mode);
      setValue(ws, COL.variablePercent, row, expense.percentOfRevenue ?? 0);
      setValue(ws, COL.variableUnitCost, row, expense.unitCost ?? 0, EUR_FORMAT);
      setValue(ws, COL.variableCategory, row, expense.category);
    }
  }

  setLabel(ws, COL.label, ROW.investHeader - 1, "Investissements");
  setLabel(ws, COL.investName, ROW.investHeader, "Nom");
  setLabel(ws, COL.investAmount, ROW.investHeader, "Montant HT");
  setLabel(ws, COL.investYears, ROW.investHeader, "Durée amortissement (ans)");
  for (let i = 0; i < MAX_INVESTMENTS; i++) {
    const row = ROW.investStart + i;
    const inv = project.investments[i];
    if (inv) {
      setValue(ws, COL.investName, row, inv.name);
      setValue(ws, COL.investAmount, row, inv.amountHT, EUR_FORMAT);
      setValue(ws, COL.investYears, row, inv.amortizationYears);
    }
  }

  setLabel(ws, COL.label, ROW.financingHeader, "Financement");
  setLabel(ws, COL.label, ROW.personalContribution, "Apport personnel (€)");
  setValue(ws, COL.value, ROW.personalContribution, project.financing.personalContribution, EUR_FORMAT);
  setLabel(ws, COL.label, ROW.honorLoan, "Prêt d'honneur (€)");
  setValue(ws, COL.value, ROW.honorLoan, project.financing.honorLoan, EUR_FORMAT);
  setLabel(ws, COL.label, ROW.loanAmount, "Emprunt bancaire — montant (€)");
  setValue(ws, COL.value, ROW.loanAmount, project.financing.bankLoan.amount, EUR_FORMAT);
  setLabel(ws, COL.label, ROW.loanRate, "Emprunt bancaire — taux annuel (%)");
  setValue(ws, COL.value, ROW.loanRate, project.financing.bankLoan.annualRate);
  setLabel(ws, COL.label, ROW.loanMonths, "Emprunt bancaire — durée (mois)");
  setValue(ws, COL.value, ROW.loanMonths, project.financing.bankLoan.months);
  setLabel(ws, COL.label, ROW.subsidies, "Subventions (€)");
  setValue(ws, COL.value, ROW.subsidies, project.financing.subsidies, EUR_FORMAT);
}

/** Écrit le tableau des coefficients de saisonnalité (utilisé par les formules de l'export). */
export function writeSeasonalityCoefficients(ws: XLSX.WorkSheet, project: Pick<Project, "seasonality">): void {
  const HYP_COEF_LABEL_ROW = 97;
  const HYP_COEF_ROW = 98;
  const MONTH_COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const coefficients = SEASONALITY_COEFFICIENTS[project.seasonality];
  const avg = coefficients.reduce((a, b) => a + b, 0) / 12;
  setLabel(ws, COL.label, HYP_COEF_LABEL_ROW - 1, "Coefficients de saisonnalité mensuels (profil sélectionné)");
  MONTH_COLS.forEach((col, i) => {
    setLabel(ws, col, HYP_COEF_LABEL_ROW, MONTH_NAMES[i]);
    setValue(ws, col, HYP_COEF_ROW, Math.round((coefficients[i] / avg) * 1000) / 1000);
  });
}

export function buildEmptyHypSheet(project: Project): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  writeProjectToHypSheet(ws, project);
  writeSeasonalityCoefficients(ws, project);
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }]; // bandeau de titre A1:F1
  ws["!cols"] = [{ wch: 32 }, { wch: 22 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 22 }];
  finalizeSheet(ws);
  return ws;
}

/**
 * Plan de mise en forme de la feuille « Hyp » : bandeau de titre, libellés
 * de section en gras, en-têtes de tableau, et surtout les cellules de
 * saisie teintées en bleu (y compris les lignes encore vierges au-delà des
 * exemples) — la seule feuille que l'utilisateur est censé modifier.
 */
export function hypStylePlanRegions(): import("./xlsx-polish").StyleRegion[] {
  const colRange = (from: number, to: number, row: number) =>
    `${XLSX.utils.encode_col(from)}${row}:${XLSX.utils.encode_col(to)}${row}`;
  const inputRange = (
    fromCol: number,
    toCol: number,
    fromRow: number,
    toRow: number,
    format?: "eur" | "pct" | "none"
  ) => {
    const cells: { ref: string; format?: "eur" | "pct" | "none" }[] = [];
    for (let r = fromRow; r <= toRow; r++) {
      for (let c = fromCol; c <= toCol; c++) {
        cells.push({ ref: `${XLSX.utils.encode_col(c)}${r}`, format });
      }
    }
    return cells;
  };

  return [
    { kind: "title", ref: colRange(0, 5, 1) },
    { kind: "sectionLabel", ref: colRange(0, 0, ROW.sourcesHeader - 1) },
    { kind: "sectionLabel", ref: colRange(0, 0, ROW.fixedHeader - 1) },
    { kind: "sectionLabel", ref: colRange(0, 0, ROW.variableHeader - 1) },
    { kind: "sectionLabel", ref: colRange(0, 0, ROW.investHeader - 1) },
    { kind: "sectionLabel", ref: colRange(0, 0, ROW.financingHeader) },
    { kind: "header", ref: colRange(COL.label, COL.sourceType, ROW.sourcesHeader) },
    { kind: "header", ref: colRange(COL.label, COL.fixedCategory, ROW.fixedHeader) },
    { kind: "header", ref: colRange(COL.label, COL.variableCategory, ROW.variableHeader) },
    { kind: "header", ref: colRange(COL.label, COL.investYears, ROW.investHeader) },
    // Informations générales (lignes 3 à 14) — colonne B. Seule ROW.initialCash
    // (ligne 7) est une devise ; le reste est du texte ou un simple nombre.
    { kind: "input", cells: inputRange(COL.value, COL.value, ROW.name, ROW.initialCash - 1, "none") },
    { kind: "input", cells: inputRange(COL.value, COL.value, ROW.initialCash, ROW.initialCash, "eur") },
    { kind: "input", cells: inputRange(COL.value, COL.value, ROW.seasonality, ROW.isThreshold, "none") },
    // Les 4 tableaux — toutes les lignes réservées, y compris vierges.
    { kind: "input", cells: inputRange(COL.sourceName, COL.sourceName, ROW.sourcesStart, ROW.sourcesStart + MAX_SOURCES - 1, "none") },
    { kind: "input", cells: inputRange(COL.sourcePrice, COL.sourcePrice, ROW.sourcesStart, ROW.sourcesStart + MAX_SOURCES - 1, "eur") },
    { kind: "input", cells: inputRange(COL.sourceVolM1, COL.sourceType, ROW.sourcesStart, ROW.sourcesStart + MAX_SOURCES - 1, "none") },
    { kind: "input", cells: inputRange(COL.fixedName, COL.fixedName, ROW.fixedStart, ROW.fixedStart + MAX_FIXED - 1, "none") },
    { kind: "input", cells: inputRange(COL.fixedAmount, COL.fixedAmount, ROW.fixedStart, ROW.fixedStart + MAX_FIXED - 1, "eur") },
    { kind: "input", cells: inputRange(COL.fixedCategory, COL.fixedCategory, ROW.fixedStart, ROW.fixedStart + MAX_FIXED - 1, "none") },
    { kind: "input", cells: inputRange(COL.variableName, COL.variableName, ROW.variableStart, ROW.variableStart + MAX_VARIABLE - 1, "none") },
    { kind: "input", cells: inputRange(COL.variableMode, COL.variableMode, ROW.variableStart, ROW.variableStart + MAX_VARIABLE - 1, "none") },
    { kind: "input", cells: inputRange(COL.variablePercent, COL.variableUnitCost, ROW.variableStart, ROW.variableStart + MAX_VARIABLE - 1, "eur") },
    { kind: "input", cells: inputRange(COL.variableCategory, COL.variableCategory, ROW.variableStart, ROW.variableStart + MAX_VARIABLE - 1, "none") },
    { kind: "input", cells: inputRange(COL.investName, COL.investName, ROW.investStart, ROW.investStart + MAX_INVESTMENTS - 1, "none") },
    { kind: "input", cells: inputRange(COL.investAmount, COL.investAmount, ROW.investStart, ROW.investStart + MAX_INVESTMENTS - 1, "eur") },
    { kind: "input", cells: inputRange(COL.investYears, COL.investYears, ROW.investStart, ROW.investStart + MAX_INVESTMENTS - 1, "none") },
    // Financement — colonne B.
    { kind: "input", cells: inputRange(COL.value, COL.value, ROW.personalContribution, ROW.loanAmount, "eur") },
    { kind: "input", cells: inputRange(COL.value, COL.value, ROW.loanRate, ROW.loanMonths, "none") },
    { kind: "input", cells: inputRange(COL.value, COL.value, ROW.subsidies, ROW.subsidies, "eur") },
  ];
}

// -- Lecture (import) ---------------------------------------------------

export type { ParsedProjectData, ParseResult } from "@/lib/project-import-types";

/** Lit une feuille "Hyp" (modèle d'import ou export FinAxis) et reconstitue les hypothèses du projet. */
export function readProjectFromHypSheet(ws: XLSX.WorkSheet): ParseResult {
  const warnings: string[] = [];

  const name = cellText(ws, COL.value, ROW.name);
  if (!name) warnings.push("Le nom du projet est vide — pensez à le renseigner avant de générer le dossier.");

  const sectorRaw = cellText(ws, COL.value, ROW.sector);
  const sector = matchOption(sectorRaw, SECTOR_OPTIONS, "Autre");
  if (sectorRaw && sector === "Autre" && sectorRaw.toLowerCase() !== "autre") {
    warnings.push(`Secteur « ${sectorRaw} » non reconnu, réglé sur « Autre ». Choix possibles : ${SECTOR_OPTIONS.join(", ")}.`);
  }

  const legalStatusRaw = cellText(ws, COL.value, ROW.legalStatus);
  const legalStatus = matchOption(legalStatusRaw, LEGAL_STATUS_OPTIONS, "Autre");
  if (legalStatusRaw && legalStatus === "Autre" && legalStatusRaw.toLowerCase() !== "autre") {
    warnings.push(
      `Statut juridique « ${legalStatusRaw} » non reconnu, réglé sur « Autre ». Choix possibles : ${LEGAL_STATUS_OPTIONS.join(", ")}.`
    );
  }

  let startDate = cellText(ws, COL.value, ROW.startDate);
  const parsedDate = startDate ? new Date(startDate) : null;
  if (!startDate || !parsedDate || Number.isNaN(parsedDate.getTime())) {
    if (startDate) warnings.push(`Date de démarrage « ${startDate} » illisible, à vérifier dans l'étape 1.`);
    startDate = new Date().toISOString().slice(0, 10);
  } else {
    startDate = parsedDate.toISOString().slice(0, 10);
  }

  const initialCash = cellNumber(ws, COL.value, ROW.initialCash);

  const seasonalityRaw = cellText(ws, COL.value, ROW.seasonality);
  const seasonalityEntry = (Object.entries(SEASONALITY_LABELS) as [SeasonalityProfile, string][]).find(
    ([, label]) => label.toLowerCase() === seasonalityRaw.toLowerCase()
  );
  const seasonality: SeasonalityProfile = seasonalityEntry?.[0] ?? "stable";
  if (seasonalityRaw && !seasonalityEntry) {
    warnings.push(
      `Profil de saisonnalité « ${seasonalityRaw} » non reconnu, réglé sur « Stable ». Choix possibles : ${Object.values(SEASONALITY_LABELS).join(", ")}.`
    );
  }

  const revenueSources: RevenueSource[] = [];
  for (let i = 0; i < MAX_SOURCES; i++) {
    const row = ROW.sourcesStart + i;
    const nameCell = cellText(ws, COL.sourceName, row);
    if (!nameCell) continue;
    const typeRaw = cellText(ws, COL.sourceType, row).toLowerCase();
    revenueSources.push({
      id: uid(),
      name: nameCell,
      unitPrice: cellNumber(ws, COL.sourcePrice, row),
      volumeM1: cellNumber(ws, COL.sourceVolM1, row),
      volumeM12: cellNumber(ws, COL.sourceVolM12, row),
      type: typeRaw === "ponctuel" ? "ponctuel" : "recurrent",
    });
  }
  if (revenueSources.length === 0) {
    warnings.push("Aucune source de revenus détectée — la section « Sources de revenus » du modèle semble vide.");
  }

  const fixedExpenses: ParsedProjectData["fixedExpenses"] = [];
  for (let i = 0; i < MAX_FIXED; i++) {
    const row = ROW.fixedStart + i;
    const nameCell = cellText(ws, COL.fixedName, row);
    if (!nameCell) continue;
    const categoryRaw = cellText(ws, COL.fixedCategory, row);
    fixedExpenses.push({
      id: uid(),
      name: nameCell,
      monthlyAmount: cellNumber(ws, COL.fixedAmount, row),
      category: matchOption(categoryRaw, FIXED_EXPENSE_CATEGORIES, "Autre"),
    });
  }

  const variableExpenses: VariableExpense[] = [];
  for (let i = 0; i < MAX_VARIABLE; i++) {
    const row = ROW.variableStart + i;
    const nameCell = cellText(ws, COL.variableName, row);
    if (!nameCell) continue;
    const modeRaw = cellText(ws, COL.variableMode, row).toLowerCase();
    const mode: VariableExpenseMode = modeRaw === "unit" ? "unit" : "percent";
    const categoryRaw = cellText(ws, COL.variableCategory, row);
    variableExpenses.push({
      id: uid(),
      name: nameCell,
      mode,
      percentOfRevenue: mode === "percent" ? cellNumber(ws, COL.variablePercent, row) : 0,
      unitCost: mode === "unit" ? cellNumber(ws, COL.variableUnitCost, row) : 0,
      category: matchOption(categoryRaw, FIXED_EXPENSE_CATEGORIES, "Autre"),
    });
  }

  const investments: Investment[] = [];
  for (let i = 0; i < MAX_INVESTMENTS; i++) {
    const row = ROW.investStart + i;
    const nameCell = cellText(ws, COL.investName, row);
    if (!nameCell) continue;
    investments.push({
      id: uid(),
      name: nameCell,
      amountHT: cellNumber(ws, COL.investAmount, row),
      amortizationYears: cellNumber(ws, COL.investYears, row) || 1,
    });
  }

  const personalContribution = cellNumber(ws, COL.value, ROW.personalContribution);
  const honorLoan = cellNumber(ws, COL.value, ROW.honorLoan);
  const loanAmount = cellNumber(ws, COL.value, ROW.loanAmount);
  const loanRate = cellNumber(ws, COL.value, ROW.loanRate);
  const loanMonths = cellNumber(ws, COL.value, ROW.loanMonths);
  const subsidies = cellNumber(ws, COL.value, ROW.subsidies);

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
        bankLoan: { amount: loanAmount, annualRate: loanRate, months: loanMonths },
        subsidies,
      },
    },
    warnings,
  };
}
