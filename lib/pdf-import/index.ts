import type { ParseResult } from "@/lib/project-import-types";
import { extractPdfText } from "./extract-text";
import { looksLikeFinAxisPdf, parseFinAxisPdf } from "./parse-finaxis-pdf";
import { parseGenericPdf } from "./parse-generic-pdf";

export class PdfImportError extends Error {}

/**
 * Lit un fichier PDF et en extrait les hypothèses du projet : lecture
 * fidèle si c'est un PDF généré par FinAxis, best-effort sinon (voir
 * parse-finaxis-pdf.ts et parse-generic-pdf.ts).
 */
export async function parsePdfFile(file: File): Promise<ParseResult> {
  let pages;
  try {
    pages = await extractPdfText(file);
  } catch {
    throw new PdfImportError(
      "Ce PDF n'a pas pu être lu. Vérifiez qu'il s'agit bien d'un fichier .pdf non corrompu et non protégé par mot de passe."
    );
  }

  const totalItems = pages.reduce((sum, p) => sum + p.items.length, 0);
  if (totalItems === 0) {
    throw new PdfImportError(
      "Aucun texte n'a pu être extrait de ce PDF — s'il s'agit d'un document scanné (une image), il ne peut pas être lu automatiquement. Utilisez plutôt le modèle Excel."
    );
  }

  return looksLikeFinAxisPdf(pages) ? parseFinAxisPdf(pages) : parseGenericPdf(pages);
}
