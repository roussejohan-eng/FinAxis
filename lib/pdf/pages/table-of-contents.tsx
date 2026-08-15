import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PdfPage } from "../components/pdf-page";
import { PdfH1 } from "../components/typography";
import { PDF_COLORS, PDF_SIZES } from "../theme";
import { PDF_SECTIONS } from "../toc";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.border,
  },
  index: {
    width: 20,
    fontSize: PDF_SIZES.body,
    color: PDF_COLORS.turquoise,
    fontFamily: "Roboto",
    fontWeight: 700,
  },
  title: {
    flex: 1,
    fontSize: PDF_SIZES.body,
    color: PDF_COLORS.navy,
    fontFamily: "Roboto",
    fontWeight: 400,
  },
  page: {
    fontSize: PDF_SIZES.body,
    color: PDF_COLORS.grey,
    fontFamily: "Roboto",
    fontWeight: 500,
  },
});

export function TableOfContentsPage({
  projectName,
  generatedDate,
}: {
  projectName: string;
  generatedDate: string;
}) {
  return (
    <PdfPage projectName={projectName} generatedDate={generatedDate}>
      <PdfH1>Sommaire</PdfH1>
      <View>
        {PDF_SECTIONS.map((section, i) => (
          <View key={section.title} style={styles.row} wrap={false}>
            <Text style={styles.index}>{String(i + 1).padStart(2, "0")}</Text>
            <Text style={styles.title}>{section.title}</Text>
            <Text style={styles.page}>{section.page}</Text>
          </View>
        ))}
      </View>
    </PdfPage>
  );
}
