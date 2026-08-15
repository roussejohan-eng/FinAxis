import { PdfPage } from "../components/pdf-page";
import { PdfH1, PdfNote } from "../components/typography";
import { PdfHeaderRow, PdfRow, PdfTable, Th, Td, MoneyTd } from "../components/table";
import type { ProjectResults } from "@/lib/finance";

export function VatPage({
  results,
  projectName,
  generatedDate,
}: {
  results: ProjectResults;
  projectName: string;
  generatedDate: string;
}) {
  const { months } = results.vat;

  return (
    <PdfPage projectName={projectName} generatedDate={generatedDate}>
      <PdfH1>Budget de TVA — année 1</PdfH1>

      <PdfTable>
        <PdfHeaderRow>
          <Th flex={1}>Mois</Th>
          <Th flex={1.2} align="right">
            TVA collectée
          </Th>
          <Th flex={1.2} align="right">
            TVA déductible
          </Th>
          <Th flex={1.2} align="right">
            Nette à reverser
          </Th>
          <Th flex={1.2} align="right">
            Crédit reporté
          </Th>
        </PdfHeaderRow>
        {months.map((m, i) => (
          <PdfRow key={m.month} zebra={i % 2 === 1}>
            <Td flex={1}>{m.label}</Td>
            <MoneyTd flex={1.2} value={m.collected} />
            <MoneyTd flex={1.2} value={m.deductible} />
            <MoneyTd flex={1.2} value={m.netDue} bold />
            <MoneyTd flex={1.2} value={m.creditCarriedForward} />
          </PdfRow>
        ))}
      </PdfTable>

      <PdfNote style={{ marginTop: 10 }}>
        Hypothèse : TVA au taux normal de 20 %, déclarée et acquittée mensuellement, avec report du
        crédit de TVA lorsque la TVA déductible dépasse la TVA collectée.
      </PdfNote>
    </PdfPage>
  );
}
