import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PdfPage } from "../components/pdf-page";
import { PdfH1 } from "../components/typography";
import type { ProjectResults } from "@/lib/finance";
import { PDF_COLORS, PDF_SIZES } from "../theme";
import { formatEUR } from "../pdf-format";

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, marginTop: 4 },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderRadius: 4,
    padding: 10,
  },
  yearLabel: { fontSize: PDF_SIZES.h2, fontFamily: "Roboto", fontWeight: 500, color: PDF_COLORS.navy },
  line: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  lineLabel: { fontSize: PDF_SIZES.note, color: PDF_COLORS.grey },
  lineValue: { fontSize: PDF_SIZES.body, fontFamily: "Roboto", fontWeight: 500, color: PDF_COLORS.navy },
  italic: {
    marginTop: 16,
    fontSize: PDF_SIZES.note,
    color: PDF_COLORS.grey,
    fontStyle: "italic",
  },
});

export function BreakEvenPage({
  results,
  projectName,
  generatedDate,
}: {
  results: ProjectResults;
  projectName: string;
  generatedDate: string;
}) {
  return (
    <PdfPage projectName={projectName} generatedDate={generatedDate}>
      <PdfH1>Seuil de rentabilité</PdfH1>

      <View style={styles.row} wrap={false}>
        {results.breakEven.years.map((year) => (
          <View key={year.year} style={styles.card}>
            <Text style={styles.yearLabel}>{`Année ${year.year}`}</Text>
            <View style={styles.line}>
              <Text style={styles.lineLabel}>Seuil</Text>
              <Text style={styles.lineValue}>{formatEUR(year.breakEvenRevenue)}</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.lineLabel}>Point mort</Text>
              <Text style={styles.lineValue}>{Math.round(year.breakEvenDays)} jours</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.lineLabel}>Équivalent MRR</Text>
              <Text style={styles.lineValue}>{formatEUR(year.mrrEquivalent)}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.italic}>
        Le seuil de rentabilité est le chiffre d&apos;affaires à partir duquel votre activité couvre
        toutes ses charges. Le point mort indique le nombre de jours dans l&apos;année nécessaires
        pour l&apos;atteindre.
      </Text>
    </PdfPage>
  );
}
