import type { Project, RevenueProjection } from "./types";
import { YEAR2_GROWTH, YEAR3_GROWTH } from "./types";
import { SEASONALITY_COEFFICIENTS } from "./seasonality";

/**
 * Normalise un jeu de coefficients de saisonnalité pour que sa moyenne
 * sur 12 mois vaille exactement 1 (robustesse aux arrondis).
 */
function normalizedCoefficients(profile: keyof typeof SEASONALITY_COEFFICIENTS): number[] {
  const raw = SEASONALITY_COEFFICIENTS[profile];
  const sum = raw.reduce((a, b) => a + b, 0);
  const avg = sum / 12;
  return raw.map((c) => c / avg);
}

/** Interpole linéairement un volume entre M1 et M12. */
export function interpolateVolume(volumeM1: number, volumeM12: number, month: number): number {
  // month: 1..12
  const t = (month - 1) / 11;
  return volumeM1 + (volumeM12 - volumeM1) * t;
}

/**
 * Calcule la projection de chiffre d'affaires Année 1 (mensuelle, par
 * source et totale) puis les totaux Années 2 et 3 par croissance simple.
 */
export function computeRevenueProjection(
  project: Project,
  options?: { year2Growth?: number; year3Growth?: number }
): RevenueProjection {
  const coefficients = normalizedCoefficients(project.seasonality);
  const year2Growth = options?.year2Growth ?? YEAR2_GROWTH;
  const year3Growth = options?.year3Growth ?? YEAR3_GROWTH;

  const bySourceMonthlyYear1 = project.revenueSources.map((source) => {
    const monthly = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const volume = interpolateVolume(source.volumeM1, source.volumeM12, month);
      const base = volume * source.unitPrice;
      return round2(base * coefficients[i]);
    });
    return { sourceId: source.id, name: source.name, monthly };
  });

  const totalVolumeMonthlyYear1 = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return project.revenueSources.reduce(
      (sum, source) => sum + interpolateVolume(source.volumeM1, source.volumeM12, month),
      0
    );
  });

  const totalMonthlyYear1 = Array.from({ length: 12 }, (_, i) =>
    round2(bySourceMonthlyYear1.reduce((sum, s) => sum + s.monthly[i], 0))
  );

  const totalYear1 = round2(totalMonthlyYear1.reduce((a, b) => a + b, 0));
  const totalYear2 = round2(totalYear1 * (1 + year2Growth));
  const totalYear3 = round2(totalYear2 * (1 + year3Growth));

  return {
    bySourceMonthlyYear1,
    totalMonthlyYear1,
    totalVolumeMonthlyYear1,
    totalYear1,
    totalYear2,
    totalYear3,
  };
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
