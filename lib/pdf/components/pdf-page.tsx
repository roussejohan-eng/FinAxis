import type { ReactNode } from "react";
import { Page, StyleSheet } from "@react-pdf/renderer";
import { PdfPageChrome } from "./chrome";
import { PAGE_MARGIN, PAGE_MARGIN_LANDSCAPE, PDF_COLORS, PDF_SIZES } from "../theme";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: PDF_SIZES.body,
    color: PDF_COLORS.navy,
    paddingTop: PAGE_MARGIN.top,
    paddingBottom: PAGE_MARGIN.bottom,
    paddingLeft: PAGE_MARGIN.left,
    paddingRight: PAGE_MARGIN.right,
  },
  pageWithChrome: {
    paddingTop: "26mm",
  },
  pageLandscape: {
    fontFamily: "Roboto",
    fontSize: PDF_SIZES.body,
    color: PDF_COLORS.navy,
    paddingTop: "26mm",
    paddingBottom: PAGE_MARGIN_LANDSCAPE.bottom,
    paddingLeft: PAGE_MARGIN_LANDSCAPE.left,
    paddingRight: PAGE_MARGIN_LANDSCAPE.right,
  },
});

export function PdfPage({
  children,
  projectName,
  generatedDate,
  cover = false,
}: {
  children: ReactNode;
  projectName: string;
  generatedDate: string;
  cover?: boolean;
}) {
  return (
    <Page size="A4" style={[styles.page, cover ? {} : styles.pageWithChrome]} wrap>
      {!cover && <PdfPageChrome projectName={projectName} generatedDate={generatedDate} />}
      {children}
    </Page>
  );
}

export function PdfPageLandscape({
  children,
  projectName,
  generatedDate,
}: {
  children: ReactNode;
  projectName: string;
  generatedDate: string;
}) {
  return (
    <Page size="A4" orientation="landscape" style={styles.pageLandscape} wrap>
      <PdfPageChrome projectName={projectName} generatedDate={generatedDate} />
      {children}
    </Page>
  );
}
