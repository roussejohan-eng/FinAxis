import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PdfLogo } from "./pdf-logo";
import { PDF_COLORS, PDF_SIZES } from "../theme";

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: "10mm",
    left: "15mm",
    right: "15mm",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRule: {
    position: "absolute",
    top: "16mm",
    left: "15mm",
    right: "15mm",
    height: 1.5,
    backgroundColor: PDF_COLORS.turquoise,
  },
  projectName: {
    fontSize: PDF_SIZES.body,
    fontFamily: "Roboto",
    fontWeight: 500,
    color: PDF_COLORS.navy,
  },
  pageNum: {
    fontSize: PDF_SIZES.note,
    color: PDF_COLORS.grey,
  },
  footer: {
    position: "absolute",
    bottom: "8mm",
    left: "15mm",
    right: "15mm",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: PDF_SIZES.note,
    color: PDF_COLORS.grey,
  },
});

export function PdfPageChrome({ projectName, generatedDate }: { projectName: string; generatedDate: string }) {
  return (
    <>
      <View style={styles.header} fixed>
        <PdfLogo width={64} />
        <Text style={styles.projectName}>{projectName}</Text>
        <Text style={styles.pageNum} render={({ pageNumber }) => `Page ${pageNumber}`} />
      </View>
      <View style={styles.headerRule} fixed />

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>{`FinAxis · Document confidentiel · ${generatedDate}`}</Text>
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} sur ${totalPages}`}
        />
      </View>
    </>
  );
}
