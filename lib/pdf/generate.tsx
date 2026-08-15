import { pdf } from "@react-pdf/renderer";
import type { Project } from "@/lib/finance/types";
import type { ProjectResults } from "@/lib/finance";
import { registerPdfFonts } from "./fonts";
import { FinancialDossierDocument } from "./document";

function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .toLowerCase() || "projet"
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadProjectPdf(project: Project, results: ProjectResults) {
  registerPdfFonts();

  const generatedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const instance = pdf(
    <FinancialDossierDocument project={project} results={results} generatedDate={generatedDate} />
  );
  const blob = await instance.toBlob();

  const filename = `finaxis-${slugify(project.name)}-dossier-financier.pdf`;
  triggerDownload(blob, filename);
}
