// Types partagés du moteur de calcul financier FinAxis.
// Toute la logique de calcul (lib/finance/*) consomme un objet `Project`
// et renvoie des objets de résultat immuables — aucune fonction ne mute
// ses entrées ni ne produit d'effet de bord.

export type Sector =
  | "Services"
  | "Commerce"
  | "Restauration"
  | "Artisanat"
  | "Tech / SaaS"
  | "Industrie"
  | "Autre";

export type LegalStatus =
  | "Micro-entreprise"
  | "EI"
  | "EURL"
  | "SASU"
  | "SAS"
  | "SARL"
  | "Autre";

export type SeasonalityProfile =
  | "stable"
  | "ete"
  | "hiver"
  | "b2b-saas";

export type RevenueType = "ponctuel" | "recurrent";

export interface RevenueSource {
  id: string;
  name: string;
  unitPrice: number; // prix unitaire HT
  volumeM1: number; // volume prévu au mois 1
  volumeM12: number; // volume prévu au mois 12
  type: RevenueType;
}

export type FixedExpenseCategory =
  | "Salaires"
  | "Loyer"
  | "Logiciels"
  | "Marketing"
  | "Assurances"
  | "Comptabilité"
  | "Autre";

export interface FixedExpense {
  id: string;
  name: string;
  monthlyAmount: number; // montant mensuel HT
  category: FixedExpenseCategory;
}

export type VariableExpenseMode = "percent" | "unit";

export interface VariableExpense {
  id: string;
  name: string;
  mode: VariableExpenseMode;
  percentOfRevenue?: number; // en % du CA, si mode === "percent"
  unitCost?: number; // coût unitaire HT, si mode === "unit"
  category: FixedExpenseCategory;
}

export interface Investment {
  id: string;
  name: string;
  amountHT: number;
  amortizationYears: number;
}

export interface BankLoan {
  amount: number;
  annualRate: number; // en %, ex 4.5
  months: number;
}

export interface Financing {
  personalContribution: number;
  honorLoan: number; // prêt d'honneur à taux 0
  bankLoan: BankLoan;
  subsidies: number;
}

export interface Project {
  id: string;
  name: string;
  sector: Sector;
  legalStatus: LegalStatus;
  startDate: string; // ISO date
  initialCash: number;
  seasonality: SeasonalityProfile;
  revenueSources: RevenueSource[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  investments: Investment[];
  financing: Financing;
  createdAt: string;
  updatedAt: string;
}

export const MONTH_LABELS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
] as const;

export const VAT_RATE = 0.2;

export const CORPORATE_TAX_THRESHOLD = 42_500;
export const CORPORATE_TAX_RATE_REDUCED = 0.15;
export const CORPORATE_TAX_RATE_STANDARD = 0.25;

export const YEAR2_GROWTH = 0.3;
export const YEAR3_GROWTH = 0.25;

// -- Résultats --------------------------------------------------------

export interface RevenueProjection {
  /** CA mensuel Année 1, par source (12 valeurs) */
  bySourceMonthlyYear1: { sourceId: string; name: string; monthly: number[] }[];
  /** CA mensuel Année 1, total toutes sources (12 valeurs) */
  totalMonthlyYear1: number[];
  /** Volume mensuel Année 1, total toutes sources (12 valeurs) — utilisé pour les charges variables "à l'unité" */
  totalVolumeMonthlyYear1: number[];
  totalYear1: number;
  totalYear2: number;
  totalYear3: number;
}

export interface ExpenseProjection {
  totalFixedMonthly: number; // total mensuel des charges fixes (constant sur l'année)
  totalFixedYear1: number;
  variableMonthlyYear1: number[]; // 12 valeurs
  totalVariableYear1: number;
  fixedByCategory: { category: FixedExpenseCategory; monthly: number }[];
  ratioFixedToVariable: number; // charges fixes / charges variables (année 1)
}

export interface IncomeStatementYear {
  year: 1 | 2 | 3;
  revenue: number;
  variableExpenses: number;
  contributionMargin: number;
  fixedExpenses: number;
  operatingResult: number;
  interest: number;
  resultBeforeTax: number;
  corporateTax: number;
  netResult: number;
}

export interface IncomeStatementResult {
  years: IncomeStatementYear[];
  monthlyYear1: {
    month: number;
    revenue: number;
    variableExpenses: number;
    contributionMargin: number;
    fixedExpenses: number;
    operatingResult: number;
  }[];
  grossMarginRate: number; // taux de marge brute (marge/CA) année 1
  netMarginRate: number; // marge nette (RN/CA) année 1
  expenseToRevenueRatio: number; // (charges var + fixes)/CA année 1
}

export interface CashFlowMonth {
  month: number;
  label: string;
  cashIn: number; // encaissements TTC
  cashOut: number; // décaissements TTC (hors TVA)
  netVat: number; // TVA nette reversée (positif = décaissement, négatif = crédit reporté non payé)
  netFlow: number;
  cumulativeCash: number;
}

export interface CashFlowResult {
  months: CashFlowMonth[];
  endOfYearCash: number;
}

export interface VatMonth {
  month: number;
  label: string;
  collected: number;
  deductible: number;
  netDue: number; // >=0 à reverser
  creditCarriedForward: number; // crédit reporté au mois suivant
}

export interface VatResult {
  months: VatMonth[];
}

export interface AmortizationRow {
  period: number;
  remainingCapitalStart: number;
  payment: number;
  principal: number;
  interest: number;
  remainingCapitalEnd: number;
}

export interface FinancingResult {
  needs: {
    investments: number;
    workingCapital: number;
    initialCash: number;
    total: number;
  };
  resources: {
    personalContribution: number;
    honorLoan: number;
    bankLoan: number;
    subsidies: number;
    total: number;
  };
  gap: number; // ressources - besoins, doit être ~0
  amortizationSchedule: AmortizationRow[];
  monthlyPayment: number;
  totalInterestYear1: number;
  yearlyInterest: { year: 1 | 2 | 3; interest: number; principal: number }[];
}

export interface BreakEvenYear {
  year: 1 | 2 | 3;
  breakEvenRevenue: number;
  breakEvenDays: number; // point mort, en jours
  mrrEquivalent: number;
  reached: boolean;
}

export interface BreakEvenResult {
  years: BreakEvenYear[];
}
