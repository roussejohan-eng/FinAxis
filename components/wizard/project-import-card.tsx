"use client";

import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ParsedProjectData } from "@/lib/project-import-types";
import { SECTOR_TEMPLATES, type SectorTemplateId } from "@/lib/excel/sector-templates-meta";

export function ProjectImportCard({
  onImported,
}: {
  onImported: (data: ParsedProjectData, warnings: string[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastImport, setLastImport] = useState<{ fileName: string; warnings: string[] } | null>(null);

  const handleDownloadTemplate = async (id: SectorTemplateId) => {
    const { downloadSectorTemplate } = await import("@/lib/excel/sector-templates");
    await downloadSectorTemplate(id);
  };

  const handleFile = async (file: File) => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
      const { data, warnings } = isPdf
        ? await (await import("@/lib/pdf-import")).parsePdfFile(file)
        : await (await import("@/lib/excel/import-project")).parseProjectFile(file);
      onImported(data, warnings);
      setLastImport({ fileName: file.name, warnings });
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Impossible de lire ce fichier. Réessayez avec le modèle FinAxis."
      );
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-turquoise-200 bg-turquoise-50/40 p-5 transition-colors hover:border-turquoise-300 hover:bg-turquoise-50/70">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
          <FileText className="h-4.5 w-4.5 text-turquoise-600" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy-700">Importer un projet existant</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Déposez un dossier financier déjà généré par FinAxis (PDF ou Excel) pour le recharger tel
            quel, ou partez d&apos;un modèle Excel complet (hypothèses, revenus, compte de résultat,
            trésorerie, plan de financement...) déjà adapté à votre secteur.
          </p>

          <div className="mt-4">
            <p className="text-xs font-medium text-navy-700">
              Télécharger un modèle Excel selon votre secteur
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SECTOR_TEMPLATES.map((t) => (
                <Button
                  key={t.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  title={`${t.coversText} — ${t.description}`}
                  onClick={() => handleDownloadTemplate(t.id)}
                >
                  <Download className="h-4 w-4" aria-hidden />
                  {t.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={status === "loading"}
            >
              <Upload className="h-4 w-4" aria-hidden />
              {status === "loading" ? "Lecture en cours…" : "Déposer un fichier (PDF ou Excel)"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.pdf"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            La lecture est fiable pour un PDF ou un Excel déjà généré par FinAxis (tous les champs sont
            reconnus, y compris un modèle par secteur complété). Pour un autre document PDF, seuls
            quelques montants explicitement indiqués (chiffre d&apos;affaires, apport, emprunt...)
            peuvent être repérés — le reste se complète manuellement dans les étapes suivantes.
          </p>

          {status === "error" && errorMessage && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === "idle" && lastImport && (
            <div className="mt-3 rounded-md bg-white p-3 text-sm">
              <div className="flex items-start gap-2 text-navy-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-turquoise-600" aria-hidden />
                <span>
                  {`« ${lastImport.fileName} » importé — les champs ci-dessous ont été pré-remplis, vérifiez-les avant de continuer.`}
                </span>
              </div>
              {lastImport.warnings.length > 0 && (
                <ul className="mt-2 space-y-1 pl-6 text-xs text-amber-700">
                  {lastImport.warnings.map((warning) => (
                    <li key={warning} className="list-disc">
                      {warning}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
