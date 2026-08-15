import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PdfPage } from "../components/pdf-page";
import { PdfH1, PdfH2, PdfNote } from "../components/typography";
import { PDF_COLORS, PDF_SIZES } from "../theme";
import type { Project } from "@/lib/finance/types";

const styles = StyleSheet.create({
  block: {
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderRadius: 4,
    padding: 14,
    marginTop: 10,
  },
  fieldLine: {
    flexDirection: "row",
    marginTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
    paddingBottom: 4,
  },
  fieldLabel: { fontSize: PDF_SIZES.note, color: PDF_COLORS.grey, width: 110 },
  signatureBox: {
    marginTop: 18,
    height: 70,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: PDF_COLORS.greyLight,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});

export function ContactSignaturePage({
  project,
  projectName,
  generatedDate,
}: {
  project: Project;
  projectName: string;
  generatedDate: string;
}) {
  return (
    <PdfPage projectName={projectName} generatedDate={generatedDate}>
      <PdfH1>Contact et signature</PdfH1>

      <PdfH2>Porteur de projet</PdfH2>
      <View style={styles.block} wrap={false}>
        <View style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Nom</Text>
        </View>
        <View style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Coordonnées</Text>
        </View>
        <View style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Date</Text>
        </View>
        <Text style={{ fontSize: PDF_SIZES.note, color: PDF_COLORS.grey, marginTop: 12 }}>Signature</Text>
        <View style={styles.signatureBox}>
          <Text style={{ fontSize: PDF_SIZES.note, color: PDF_COLORS.greyLight }}>
            Signature manuscrite ou électronique
          </Text>
        </View>
      </View>

      <PdfH2>Attestation de l&apos;expert-comptable partenaire (le cas échéant)</PdfH2>
      <View style={styles.block} wrap={false}>
        <PdfNote>
          Cadre réservé à l&apos;expert-comptable partenaire inscrit à l&apos;Ordre ayant procédé à la
          revue de cohérence de ce dossier, sous sa responsabilité et sa lettre de mission. FinAxis ne
          fournit pas de services d&apos;expertise comptable.
        </PdfNote>
        <View style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Cabinet</Text>
        </View>
        <View style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Expert-comptable</Text>
        </View>
        <View style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Numéro d&apos;inscription</Text>
        </View>
        <View style={styles.fieldLine}>
          <Text style={styles.fieldLabel}>Date</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text style={{ fontSize: PDF_SIZES.note, color: PDF_COLORS.greyLight }}>Cachet et signature</Text>
        </View>
      </View>

      <PdfNote style={{ marginTop: 14 }}>{`Projet « ${project.name || "sans nom"} » — dossier généré le ${generatedDate}.`}</PdfNote>
    </PdfPage>
  );
}
