// Formatage des nombres à la française : séparateur de milliers = espace
// insécable, virgule décimale, symbole € après le montant.

const NBSP = " ";

export function formatEUR(value: number, decimals = 0): string {
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value));
  const sign = value < 0 ? "−" : "";
  return `${sign}${formatted}${NBSP}€`;
}

export function formatNumber(value: number, decimals = 0): string {
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value));
  const sign = value < 0 ? "−" : "";
  return `${sign}${formatted}`;
}

export function formatPercent(value: number, decimals = 1): string {
  // value est un ratio décimal, ex 0.234 -> "23,4 %"
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value) * 100);
  const sign = value < 0 ? "−" : "";
  return `${sign}${formatted}${NBSP}%`;
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}
