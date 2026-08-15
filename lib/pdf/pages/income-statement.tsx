import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PdfPage } from "../components/pdf-page";
import { PdfH1 } from "../components/typography";
import { PdfHeaderRow, PdfRow, PdfTable, Th, Td, MoneyTd } from "../components/table";
import type { ProjectResults } from "@/lib/finance";
import { PDF_COLORS, PDF_SIZES } from "../theme";
import { formatEUR } from "../pdf-format";

const styles = StyleSheet.create({
  box: {
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: PDF_COLORS.turquoise,
    borderRadius: 4,
    padding: 12,
    backgroundColor: PDF_COLORS.turquoisePale,
  },
  boxLabel: {
    fontSize: PDF_SIZES.body,
    color: PDF_COLORS.navy,
    fontFamily: "Roboto",
    fontWeight: 500,
  },
  boxValue: {
    marginTop: 4,
    fontSize: 18,
    fontFamily: "Roboto",
    fontWeight: 700,
  },
});

export function IncomeStatementPage({
  results,
  projectName,
  generatedDate,
}: {
  results: ProjectResults;
  projectName: string;
  generatedDate: string;
}) {
  const [y1, y2, y3] = results.incomeStatement.years;

  const rows: { label: string; key: keyof typeof y1; bold?: boolean; highlight?: boolean }[] = [
    { label: "Produits d'exploitation", key: "revenue" },
    { label: "Charges variables", key: "variableExpenses" },
    { label: "Marge sur coûts variables", key: "contributionMargin", bold: true },
    { label: "Charges fixes", key: "fixedExpenses" },
    { label: "Résultat d'exploitation", key: "operatingResult", bold: true, highlight: true },
    { label: "Intérêts d'emprunt", key: "interest" },
    { label: "Impôt sur les sociétés", key: "corporateTax" },
  ];

  return (
    <PdfPage projectName={projectName} generatedDate={generatedDate}>
      <PdfH1>Compte de résultat prévisionnel sur 3 ans</PdfH1>

      <PdfTable>
        <PdfHeaderRow>
          <Th flex={2}>Libellé</Th>
          <Th flex={1} align="right">
            Année 1
          </Th>
          <Th flex={1} align="right">
            Année 2
          </Th>
          <Th flex={1} align="right">
            Année 3
          </Th>
        </PdfHeaderRow>
        {rows.map((row, i) => (
          <PdfRow key={row.label} zebra={i % 2 === 1} bold={row.bold}>
            <Td flex={2} bold={row.bold}>
              {row.label}
            </Td>
            <MoneyTd flex={1} value={y1[row.key] as number} bold={row.bold} highlight={row.highlight} />
            <MoneyTd flex={1} value={y2[row.key] as number} bold={row.bold} highlight={row.highlight} />
            <MoneyTd flex={1} value={y3[row.key] as number} bold={row.bold} highlight={row.highlight} />
          </PdfRow>
        ))}
      </PdfTable>

      <View style={styles.box} wrap={false}>
        <Text style={styles.boxLabel}>Résultat net</Text>
        <View style={{ flexDirection: "row", marginTop: 6 }}>
          {[y1, y2, y3].map((year) => (
            <View key={year.year} style={{ flex: 1 }}>
              <Text style={{ fontSize: PDF_SIZES.note, color: PDF_COLORS.grey }}>{`Année ${year.year}`}</Text>
              <Text
                style={[
                  styles.boxValue,
                  { color: year.netResult < 0 ? PDF_COLORS.negative : PDF_COLORS.positive },
                ]}
              >
                {formatEUR(year.netResult)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </PdfPage>
  );
}
