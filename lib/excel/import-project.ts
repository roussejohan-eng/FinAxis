import * as XLSX from "xlsx";
import { HYP_SHEET_NAME, readProjectFromHypSheet, type ParseResult } from "./project-sheet-layout";

export class ProjectImportError extends Error {}

/**
 * Lit un fichier .xlsx (modèle FinAxis rempli, ou classeur précédemment
 * exporté par FinAxis) et en extrait les hypothèses du projet.
 */
export async function parseProjectFile(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array", cellText: true });
  } catch {
    throw new ProjectImportError(
      "Ce fichier n'a pas pu être lu. Vérifiez qu'il s'agit bien d'un fichier .xlsx non corrompu."
    );
  }

  const sheetName = workbook.SheetNames.includes(HYP_SHEET_NAME) ? HYP_SHEET_NAME : workbook.SheetNames[0];
  const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;
  if (!sheet) {
    throw new ProjectImportError("Aucune feuille exploitable trouvée dans ce fichier.");
  }

  return readProjectFromHypSheet(sheet);
}
