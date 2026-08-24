"use client";

import { useState } from "react";
import { FileDown, FileSpreadsheet, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareModal } from "@/components/dashboard/share-modal";
import type { Project } from "@/lib/finance/types";
import type { ProjectResults } from "@/lib/finance";

export function DashboardActionBar({ project, results }: { project: Project; results: ProjectResults }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  const handlePdf = async () => {
    setPdfLoading(true);
    try {
      const { downloadProjectPdf } = await import("@/lib/pdf/generate");
      await downloadProjectPdf(project, results);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExcel = async () => {
    setExcelLoading(true);
    try {
      const { downloadProjectExcel } = await import("@/lib/excel/generate");
      await downloadProjectExcel(project, results);
    } finally {
      setExcelLoading(false);
    }
  };

  return (
    <>
      <div className="sticky bottom-0 z-20 border-t border-border bg-white/95 shadow-[0_-4px_16px_-8px_rgba(15,42,68,0.12)] backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-8">
          <Button variant="outline" onClick={() => setShareOpen(true)}>
            <Share2 className="h-4 w-4" aria-hidden />
            Partager avec mon expert-comptable
          </Button>
          <Button variant="secondary" onClick={handleExcel} disabled={excelLoading}>
            <FileSpreadsheet className="h-4 w-4" aria-hidden />
            {excelLoading ? "Génération…" : "Exporter Excel"}
          </Button>
          <Button onClick={handlePdf} disabled={pdfLoading}>
            <FileDown className="h-4 w-4" aria-hidden />
            {pdfLoading ? "Génération…" : "Télécharger PDF"}
          </Button>
        </div>
      </div>
      <ShareModal open={shareOpen} onOpenChange={setShareOpen} projectName={project.name} />
    </>
  );
}
