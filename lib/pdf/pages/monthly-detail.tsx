import { PdfPageLandscape } from "../components/pdf-page";
import { PdfH1 } from "../components/typography";
import { PdfHeaderRow, PdfRow, PdfTable, Th, Td, MoneyTd } from "../components/table";
import type { ProjectResults } from "@/lib/finance";
import { MONTH_LABELS } from "@/lib/finance/types";

export function MonthlyDetailPage({
  results,
  projectName,
  generatedDate,
}: {
  results: ProjectResults;
  projectName: string;
  generatedDate: string;
}) {
  const { monthlyYear1 } = results.incomeStatement;

  const rowsDef: { label: string; key: "revenue" | "variableExpenses" | "contributionMargin" | "fixedExpenses" | "operatingResult"; bold?: boolean; highlight?: boolean }[] = [
    { label: "Chiffre d'affaires", key: "revenue" },
    { label: "Charges variables", key: "variableExpenses" },
    { label: "Marge sur coûts variables", key: "contributionMargin", bold: true },
    { label: "Charges fixes", key: "fixedExpenses" },
    { label: "Résultat d'exploitation", key: "operatingResult", bold: true, highlight: true },
  ];

  return (
    <PdfPageLandscape projectName={projectName} generatedDate={generatedDate}>
      <PdfH1>Détail mensuel — année 1</PdfH1>

      <PdfTable>
        <PdfHeaderRow>
          <Th flex={2.2} small>
            Libellé
          </Th>
          {MONTH_LABELS.map((m) => (
            <Th key={m} flex={1} align="right" small>
              {m}
            </Th>
          ))}
          <Th flex={1.2} align="right" small>
            Total
          </Th>
        </PdfHeaderRow>

        {rowsDef.map((row, i) => {
          const total = monthlyYear1.reduce((sum, m) => sum + (m[row.key] as number), 0);
          return (
            <PdfRow key={row.key} zebra={i % 2 === 1} bold={row.bold}>
              <Td flex={2.2} small bold={row.bold}>
                {row.label}
              </Td>
              {monthlyYear1.map((m) => (
                <MoneyTd
                  key={m.month}
                  flex={1}
                  small
                  value={m[row.key] as number}
                  bold={row.bold}
                  highlight={row.highlight}
                />
              ))}
              <MoneyTd flex={1.2} small value={total} bold highlight={row.highlight} />
            </PdfRow>
          );
        })}
      </PdfTable>
    </PdfPageLandscape>
  );
}
