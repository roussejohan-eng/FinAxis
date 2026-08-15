import type { FixedExpenseCategory, LegalStatus, Sector } from "@/lib/finance/types";

export const SECTOR_OPTIONS: Sector[] = [
  "Services",
  "Commerce",
  "Restauration",
  "Artisanat",
  "Tech / SaaS",
  "Industrie",
  "Autre",
];

export const LEGAL_STATUS_OPTIONS: LegalStatus[] = [
  "Micro-entreprise",
  "EI",
  "EURL",
  "SASU",
  "SAS",
  "SARL",
  "Autre",
];

export const FIXED_EXPENSE_CATEGORIES: FixedExpenseCategory[] = [
  "Salaires",
  "Loyer",
  "Logiciels",
  "Marketing",
  "Assurances",
  "Comptabilité",
  "Autre",
];

export const WIZARD_STEP_LABELS = [
  "Votre projet",
  "Vos revenus",
  "Vos charges",
  "Financement",
  "Récapitulatif",
];
