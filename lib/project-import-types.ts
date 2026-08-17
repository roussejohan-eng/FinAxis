import type {
  FixedExpenseCategory,
  Investment,
  LegalStatus,
  RevenueSource,
  Sector,
  SeasonalityProfile,
  VariableExpense,
} from "@/lib/finance/types";

/**
 * Forme commune du résultat d'import de projet, que la source soit un
 * fichier Excel (lib/excel/) ou un PDF (lib/pdf-import/) : les deux
 * importeurs produisent ce même objet, consommé par
 * `useWizardStore().loadDraftFromImport`.
 */
export interface ParsedProjectData {
  name: string;
  sector: Sector;
  legalStatus: LegalStatus;
  startDate: string;
  initialCash: number;
  seasonality: SeasonalityProfile;
  revenueSources: RevenueSource[];
  fixedExpenses: { id: string; name: string; monthlyAmount: number; category: FixedExpenseCategory }[];
  variableExpenses: VariableExpense[];
  investments: Investment[];
  financing: {
    personalContribution: number;
    honorLoan: number;
    bankLoan: { amount: number; annualRate: number; months: number };
    subsidies: number;
  };
}

export interface ParseResult {
  data: ParsedProjectData;
  warnings: string[];
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function matchOption<T extends string>(value: string, options: readonly T[], fallback: T): T {
  const found = options.find((o) => o.toLowerCase() === value.toLowerCase());
  return found ?? fallback;
}

/**
 * Convertit "1 234,56 €", "1234.56", "3 ans" ou "6 %" en nombre — extrait la
 * portion numérique de tête et ignore le reste (unité, symbole...).
 * Tolère le signe moins typographique "−" et l'espace insécable.
 */
export function parseFrenchNumber(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/\s/g, "").replace(/−/g, "-");
  const match = cleaned.match(/^-?\d+(?:[.,]\d+)?/);
  if (!match) return 0;
  const n = Number(match[0].replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

const FRENCH_MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

/** Parse une date au format "01 janvier 2026" (celui produit par formatDate) en ISO "2026-01-01". */
export function parseFrenchLongDate(raw: string): string | null {
  const match = raw.trim().match(/^(\d{1,2})\s+([a-zéû]+)\s+(\d{4})$/i);
  if (!match) return null;
  const [, day, monthName, year] = match;
  const monthIndex = FRENCH_MONTHS.findIndex((m) => m === monthName.toLowerCase());
  if (monthIndex === -1) return null;
  const date = new Date(Date.UTC(Number(year), monthIndex, Number(day)));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}
