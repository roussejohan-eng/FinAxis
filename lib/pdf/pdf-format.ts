import { formatEUR as baseFormatEUR, formatPercent as baseFormatPercent } from "@/lib/finance/format";

// Intl.NumberFormat("fr-FR") separe les milliers avec une espace fine
// insecable (U+202F) et precede le symbole monetaire d'une espace
// insecable normale (U+00A0). La police Roboto (sous-ensemble latin
// embarque) ne possede pas ces glyphes -> on les remplace par une espace
// normale (U+0020) pour l'export PDF.
function stripSpecialSpaces(text: string): string {
  return text.replace(/[\u00A0\u202F]/g, "\u0020");
}

export function formatEUR(value: number, decimals = 0): string {
  return stripSpecialSpaces(baseFormatEUR(value, decimals));
}

export function formatPercent(value: number, decimals = 1): string {
  return stripSpecialSpaces(baseFormatPercent(value, decimals));
}
