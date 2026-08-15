import type { SeasonalityProfile } from "./types";

/**
 * Coefficients mensuels (Jan → Déc) appliqués au chiffre d'affaires lissé.
 * Chaque profil a une moyenne de 1 sur les 12 mois, pour ne pas modifier
 * le CA annuel total, uniquement sa répartition mensuelle.
 */
export const SEASONALITY_COEFFICIENTS: Record<SeasonalityProfile, number[]> = {
  stable: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ete: [0.7, 0.7, 0.8, 0.95, 1.15, 1.4, 1.6, 1.5, 1.05, 0.8, 0.65, 0.7],
  hiver: [1.45, 1.3, 1.05, 0.85, 0.7, 0.6, 0.55, 0.6, 0.85, 1.05, 1.35, 1.65],
  "b2b-saas": [0.95, 1.0, 1.05, 1.05, 1.0, 1.0, 0.75, 0.7, 1.05, 1.1, 1.1, 1.25],
};

export const SEASONALITY_LABELS: Record<SeasonalityProfile, string> = {
  stable: "Stable",
  ete: "Saisonnier été",
  hiver: "Saisonnier hiver",
  "b2b-saas": "B2B / SaaS",
};

export const SEASONALITY_DESCRIPTIONS: Record<SeasonalityProfile, string> = {
  stable: "Activité régulière toute l'année, sans pic marqué.",
  ete: "Pic d'activité de juin à août (tourisme, restauration saisonnière...).",
  hiver: "Pic d'activité en fin et début d'année (fêtes, sports d'hiver...).",
  "b2b-saas": "Cycles de vente B2B, creux estival, forte fin d'année.",
};
