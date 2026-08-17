"use client";

export interface PdfPageText {
  pageNumber: number;
  items: string[];
}

let workerConfigured = false;

/**
 * Extrait le texte d'un PDF, page par page, dans l'ordre de lecture du
 * flux de contenu (pdf.js préserve l'ordre d'écriture des blocs de texte,
 * ce qui correspond exactement à l'ordre des cellules telles qu'écrites
 * par @react-pdf/renderer pour les PDF générés par FinAxis).
 *
 * Fonctionne uniquement sur les PDF avec une couche de texte (pas les
 * PDF scannés / images) — limite inhérente à l'extraction de texte,
 * documentée pour l'utilisateur dans l'UI d'import.
 */
export async function extractPdfText(file: File): Promise<PdfPageText[]> {
  const pdfjsLib = await import("pdfjs-dist");

  if (!workerConfigured) {
    // Servi tel quel depuis public/ (copié par scripts/copy-pdf-worker.js) plutôt
    // que résolu via `new URL(..., import.meta.url)` : cette dernière approche fait
    // passer le fichier dans le pipeline webpack de Next.js, dont le minifieur de
    // production (Terser) échoue sur les fichiers ESM contenant `import.meta`.
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    workerConfigured = true;
  }

  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pages: PdfPageText[] = [];
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    pages.push({ pageNumber, items });
  }
  return pages;
}
