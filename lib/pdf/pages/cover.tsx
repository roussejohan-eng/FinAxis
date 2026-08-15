import { Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PdfLogo } from "../components/pdf-logo";
import { PDF_COLORS, PDF_SIZES } from "../theme";
import type { Project } from "@/lib/finance/types";
import { formatDate } from "@/lib/finance/format";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    paddingTop: "40mm",
    paddingHorizontal: "20mm",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  tagline: {
    marginTop: 6,
    fontSize: PDF_SIZES.body,
    color: PDF_COLORS.grey,
  },
  title: {
    marginTop: "26mm",
    fontSize: PDF_SIZES.title,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: PDF_COLORS.navy,
    textAlign: "center",
  },
  projectName: {
    marginTop: 14,
    fontSize: 20,
    fontFamily: "Roboto",
    fontWeight: 500,
    color: PDF_COLORS.turquoise,
    textAlign: "center",
  },
  metaBlock: {
    marginTop: 28,
    alignItems: "center",
  },
  metaLine: {
    fontSize: PDF_SIZES.body,
    color: PDF_COLORS.navy,
    marginBottom: 4,
  },
  generated: {
    marginTop: 24,
    fontSize: PDF_SIZES.note,
    color: PDF_COLORS.grey,
  },
  bandeau: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: PDF_COLORS.turquoise,
  },
});

export function CoverPage({ project, generatedDate }: { project: Project; generatedDate: string }) {
  return (
    <Page size="A4" style={styles.page}>
      <PdfLogo width={200} />
      <Text style={styles.tagline}>Comprendre, prévoir, réussir.</Text>

      <Text style={styles.title}>Dossier financier prévisionnel</Text>
      <Text style={styles.projectName}>{project.name || "Projet sans nom"}</Text>

      <View style={styles.metaBlock}>
        <Text style={styles.metaLine}>Secteur d&apos;activité : {project.sector}</Text>
        <Text style={styles.metaLine}>Statut juridique envisagé : {project.legalStatus}</Text>
        <Text style={styles.metaLine}>Date de démarrage prévue : {formatDate(project.startDate)}</Text>
      </View>

      <Text style={styles.generated}>{`Généré le ${generatedDate} avec FinAxis`}</Text>

      <View style={styles.bandeau} fixed />
    </Page>
  );
}
