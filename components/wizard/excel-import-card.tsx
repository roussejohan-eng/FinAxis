"use client";

import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ParsedProjectData } from "@/lib/excel/project-sheet-layout";

export function ExcelImportCard({
  onImported,
}: {
  onImported: (data: ParsedProjectData, warnings: string[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastImport, setLastImport] = useState<{ fileName: string; warnings: string[] } | null>(null);

  const handleDownloadTemplate = async () => {
    const { downloadImportTemplate } = await import("@/lib/excel/project-template");
    downloadImportTemplate();
  };

  const handleFile = async (file: File) => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const { parseProjectFile } = await import("@/lib/excel/import-project");
      const { data, warnings } = await parseProjectFile(file);
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
    <div className="rounded-lg border border-dashed border-turquoise-200 bg-turquoise-50/40 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
          <FileSpreadsheet className="h-4.5 w-4.5 text-turquoise-600" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy-700">Importer un projet Excel</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Déjà vos chiffres quelque part ? Téléchargez notre modèle, complétez-le avec vos données,
            puis déposez-le ici : tout le parcours se pré-remplit automatiquement.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4" aria-hidden />
              Télécharger le modèle Excel
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={status === "loading"}
            >
              <Upload className="h-4 w-4" aria-hidden />
              {status === "loading" ? "Lecture en cours…" : "Déposer mon fichier rempli"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </div>

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
