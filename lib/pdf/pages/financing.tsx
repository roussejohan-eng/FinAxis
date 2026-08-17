import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PdfPage } from "../components/pdf-page";
import { PdfH1, PdfH2, PdfNote } from "../components/typography";
import { PdfHeaderRow, PdfRow, PdfTable, Th, Td, MoneyTd } from "../components/table";
import type { ProjectResults } from "@/lib/finance";
import type { Project } from "@/lib/finance/types";
import { PDF_COLORS, PDF_SIZES } from "../theme";
import { formatEUR } from "../pdf-format";

const styles = StyleSheet.create({
  columns: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
  colHeader: {
    backgroundColor: PDF_COLORS.navy,
    color: PDF_COLORS.white,
    fontSize: PDF_SIZES.h2,
    fontFamily: "Roboto",
    fontWeight: 500,
    padding: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },
  lineLabel: { fontSize: PDF_SIZES.body, color: PDF_COLORS.grey },
  lineValue: { fontSize: PDF_SIZES.body, color: PDF_COLORS.navy, fontFamily: "Roboto", fontWeight: 500 },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderTopWidth: 1.5,
    borderTopColor: PDF_COLORS.turquoise,
  },
});

export function FinancingPage({
  project,
  results,
  projectName,
  generatedDate,
}: {
  project: Project;
  results: ProjectResults;
  projectName: string;
  generatedDate: string;
}) {
  const { financing } = results;
  const { bankLoan } = project.financing;
  const sample = financing.amortizationSchedule.slice(0, 12);
  const hasMore = financing.amortizationSchedule.length > 12;

  return (
    <PdfPage projectName={projectName} generatedDate={generatedDate}>
      <PdfH1>Plan de financement</PdfH1>

      <View style={styles.columns} wrap={false}>
        <View style={styles.col}>
          <Text style={styles.colHeader}>Besoins</Text>
          <View style={{ borderWidth: 1, borderColor: PDF_COLORS.border, borderTopWidth: 0 }}>
            <View style={styles.line}>
              <Text style={styles.lineLabel}>Investissements</Text>
              <Text style={styles.lineValue}>{formatEUR(financing.needs.investments)}</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.lineLabel}>Besoin en fonds de roulement</Text>
              <Text style={styles.lineValue}>{formatEUR(financing.needs.workingCapital)}</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.lineLabel}>Trésorerie de départ</Text>
              <Text style={styles.lineValue}>{formatEUR(financing.needs.initialCash)}</Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={[styles.lineLabel, { fontFamily: "Roboto", fontWeight: 700, color: PDF_COLORS.navy }]}>
                Total besoins
              </Text>
              <Text style={[styles.lineValue, { fontWeight: 700 }]}>{formatEUR(financing.needs.total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.col}>
          <Text style={styles.colHeader}>Ressources</Text>
          <View style={{ borderWidth: 1, borderColor: PDF_COLORS.border, borderTopWidth: 0 }}>
            <View style={styles.line}>
              <Text style={styles.lineLabel}>Apport personnel</Text>
              <Text style={styles.lineValue}>{formatEUR(financing.resources.personalContribution)}</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.lineLabel}>Prêt d&apos;honneur</Text>
              <Text style={styles.lineValue}>{formatEUR(financing.resources.honorLoan)}</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.lineLabel}>Emprunt bancaire</Text>
              <Text style={styles.lineValue}>{formatEUR(financing.resources.bankLoan)}</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.lineLabel}>Subventions</Text>
              <Text style={styles.lineValue}>{formatEUR(financing.resources.subsidies)}</Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={[styles.lineLabel, { fontFamily: "Roboto", fontWeight: 700, color: PDF_COLORS.navy }]}>
                Total ressources
              </Text>
              <Text style={[styles.lineValue, { fontWeight: 700 }]}>{formatEUR(financing.resources.total)}</Text>
            </View>
          </View>
        </View>
      </View>

      {financing.amortizationSchedule.length > 0 && (
        <>
          <PdfH2>Tableau d&apos;amortissement de l&apos;emprunt bancaire</PdfH2>
          <PdfNote style={{ marginBottom: 6 }}>
            {`Conditions de l'emprunt : taux annuel ${bankLoan.annualRate.toString().replace(".", ",")} %, durée ${bankLoan.months} mois.`}
          </PdfNote>
          <PdfTable>
            <PdfHeaderRow>
              <Th flex={1}>Période</Th>
              <Th flex={1.4} align="right">
                Capital restant dû
              </Th>
              <Th flex={1.2} align="right">
                Échéance
              </Th>
              <Th flex={1.2} align="right">
                Capital remboursé
              </Th>
              <Th flex={1} align="right">
                Intérêts
              </Th>
              <Th flex={1.4} align="right">
                Capital en fin
              </Th>
            </PdfHeaderRow>
            {sample.map((row, i) => (
              <PdfRow key={row.period} zebra={i % 2 === 1}>
                <Td flex={1}>{row.period}</Td>
                <MoneyTd flex={1.4} value={row.remainingCapitalStart} />
                <MoneyTd flex={1.2} value={row.payment} />
                <MoneyTd flex={1.2} value={row.principal} />
                <MoneyTd flex={1} value={row.interest} />
                <MoneyTd flex={1.4} value={row.remainingCapitalEnd} />
              </PdfRow>
            ))}
          </PdfTable>
          {hasMore && (
            <PdfNote style={{ marginTop: 6 }}>
              {`Échéancier présenté sur les 12 premières périodes (sur ${financing.amortizationSchedule.length} au total). Tableau complet disponible sur demande.`}
            </PdfNote>
          )}
        </>
      )}
    </PdfPage>
  );
}
