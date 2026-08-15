import { View } from "@react-pdf/renderer";
import { PdfPage } from "../components/pdf-page";
import { PdfH1, PdfH2 } from "../components/typography";
import { PdfHeaderRow, PdfRow, PdfTable, Th, Td, MoneyTd } from "../components/table";
import { PdfLineChart } from "../components/line-chart";
import type { ProjectResults } from "@/lib/finance";

export function CashFlowPage({
  results,
  projectName,
  generatedDate,
}: {
  results: ProjectResults;
  projectName: string;
  generatedDate: string;
}) {
  const { months } = results.cashFlow;

  return (
    <PdfPage projectName={projectName} generatedDate={generatedDate}>
      <PdfH1>Budget de trésorerie mensuel — année 1</PdfH1>

      <PdfTable>
        <PdfHeaderRow>
          <Th flex={1}>Mois</Th>
          <Th flex={1.3} align="right">
            Encaissements TTC
          </Th>
          <Th flex={1.3} align="right">
            Décaissements TTC
          </Th>
          <Th flex={1} align="right">
            TVA nette
          </Th>
          <Th flex={1} align="right">
            Flux net
          </Th>
          <Th flex={1.3} align="right">
            Trésorerie cumulée
          </Th>
        </PdfHeaderRow>
        {months.map((m, i) => (
          <PdfRow key={m.month} zebra={i % 2 === 1}>
            <Td flex={1} small>
              {m.label}
            </Td>
            <MoneyTd flex={1.3} small value={m.cashIn} highlight />
            <MoneyTd flex={1.3} small value={-m.cashOut} />
            <MoneyTd flex={1} small value={-m.netVat} />
            <MoneyTd flex={1} small value={m.netFlow} highlight />
            <MoneyTd flex={1.3} small value={m.cumulativeCash} bold highlight />
          </PdfRow>
        ))}
      </PdfTable>

      <PdfH2>Trésorerie cumulée</PdfH2>
      <View wrap={false}>
        <PdfLineChart values={months.map((m) => m.cumulativeCash)} labels={months.map((m) => m.label)} />
      </View>
    </PdfPage>
  );
}
