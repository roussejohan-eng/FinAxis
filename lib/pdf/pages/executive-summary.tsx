import { StyleSheet, View } from "@react-pdf/renderer";
import { PdfPage } from "../components/pdf-page";
import { PdfH1, PdfP } from "../components/typography";
import { PdfKpiCard } from "../components/kpi-card";
import type { Project } from "@/lib/finance/types";
import type { ProjectResults } from "@/lib/finance";
import { formatEUR } from "../pdf-format";

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
});

export function ExecutiveSummaryPage({
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
  const year1 = results.incomeStatement.years[0];
  const totalCharges = year1.variableExpenses + year1.fixedExpenses;
  const breakEvenYear1 = results.breakEven.years[0];

  const breakEvenSentence = breakEvenYear1.reached
    ? `Le seuil de rentabilité est atteint au bout de ${Math.max(1, Math.ceil(breakEvenYear1.breakEvenDays / 30))} mois.`
    : "Le seuil de rentabilité n'est pas encore atteint sur l'année 1 aux hypothèses saisies.";

  return (
    <PdfPage projectName={projectName} generatedDate={generatedDate}>
      <PdfH1>Synthèse exécutive</PdfH1>

      <View style={styles.grid} wrap={false}>
        <PdfKpiCard label="CA annuel — année 1" value={year1.revenue} />
        <PdfKpiCard
          label="Résultat net — année 1"
          value={year1.netResult}
          badge={{ label: year1.netResult >= 0 ? "Bénéficiaire" : "Déficitaire", positive: year1.netResult >= 0 }}
        />
      </View>
      <View style={[styles.grid, { marginTop: 8 }]} wrap={false}>
        <PdfKpiCard
          label="Trésorerie fin année 1"
          value={results.cashFlow.endOfYearCash}
          badge={{ label: results.cashFlow.endOfYearCash >= 0 ? "Positive" : "Négative", positive: results.cashFlow.endOfYearCash >= 0 }}
        />
        <PdfKpiCard label="Charges totales — année 1" value={totalCharges} />
      </View>

      <View style={{ marginTop: 20 }} wrap={false}>
        <PdfP>
          {`Ce projet prévoit un chiffre d'affaires de ${formatEUR(year1.revenue)} en année 1, avec un résultat net de ${formatEUR(
            year1.netResult
          )} et une trésorerie finale de ${formatEUR(results.cashFlow.endOfYearCash)}. ${breakEvenSentence}`}
        </PdfP>
        <PdfP style={{ marginTop: 10 }}>
          {`Ce dossier a été généré à partir des hypothèses saisies pour le projet « ${project.name || "sans nom"} » (secteur ${project.sector}, statut envisagé ${project.legalStatus}), démarrant le ${new Date(
            project.startDate
          ).toLocaleDateString("fr-FR")}.`}
        </PdfP>
      </View>
    </PdfPage>
  );
}
