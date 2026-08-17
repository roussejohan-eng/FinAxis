import { Document } from "@react-pdf/renderer";
import type { Project } from "@/lib/finance/types";
import type { ProjectResults } from "@/lib/finance";
import { CoverPage } from "./pages/cover";
import { TableOfContentsPage } from "./pages/table-of-contents";
import { ExecutiveSummaryPage } from "./pages/executive-summary";
import { AssumptionsPage } from "./pages/assumptions";
import { IncomeStatementPage } from "./pages/income-statement";
import { MonthlyDetailPage } from "./pages/monthly-detail";
import { CashFlowPage } from "./pages/cash-flow";
import { VatPage } from "./pages/vat";
import { FinancingPage } from "./pages/financing";
import { BreakEvenPage } from "./pages/break-even";
import { MethodologyPage } from "./pages/methodology";
import { ContactSignaturePage } from "./pages/contact-signature";

export function FinancialDossierDocument({
  project,
  results,
  generatedDate,
}: {
  project: Project;
  results: ProjectResults;
  generatedDate: string;
}) {
  const projectName = project.name || "Projet sans nom";

  return (
    <Document
      title={`FinAxis — Dossier financier prévisionnel — ${projectName}`}
      author="FinAxis"
      subject="Dossier financier prévisionnel"
      creator="FinAxis"
    >
      <CoverPage project={project} generatedDate={generatedDate} />
      <TableOfContentsPage projectName={projectName} generatedDate={generatedDate} />
      <ExecutiveSummaryPage
        project={project}
        results={results}
        projectName={projectName}
        generatedDate={generatedDate}
      />
      <AssumptionsPage project={project} projectName={projectName} generatedDate={generatedDate} />
      <IncomeStatementPage results={results} projectName={projectName} generatedDate={generatedDate} />
      <MonthlyDetailPage results={results} projectName={projectName} generatedDate={generatedDate} />
      <CashFlowPage results={results} projectName={projectName} generatedDate={generatedDate} />
      <VatPage results={results} projectName={projectName} generatedDate={generatedDate} />
      <FinancingPage project={project} results={results} projectName={projectName} generatedDate={generatedDate} />
      <BreakEvenPage results={results} projectName={projectName} generatedDate={generatedDate} />
      <MethodologyPage projectName={projectName} generatedDate={generatedDate} />
      <ContactSignaturePage project={project} projectName={projectName} generatedDate={generatedDate} />
    </Document>
  );
}
