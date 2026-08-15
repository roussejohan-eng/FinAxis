import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PDF_COLORS, PDF_SIZES } from "../theme";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TextStyle = Record<string, any>;

const styles = StyleSheet.create({
  h1: {
    fontSize: PDF_SIZES.h1,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: PDF_COLORS.navy,
    marginBottom: 10,
  },
  h2: {
    fontSize: PDF_SIZES.h2,
    fontFamily: "Roboto",
    fontWeight: 500,
    color: PDF_COLORS.navy,
    marginTop: 14,
    marginBottom: 6,
  },
  p: {
    fontSize: PDF_SIZES.body,
    fontFamily: "Roboto",
    fontWeight: 400,
    color: PDF_COLORS.navy,
    lineHeight: 1.5,
  },
  note: {
    fontSize: PDF_SIZES.note,
    fontFamily: "Roboto",
    fontWeight: 400,
    color: PDF_COLORS.grey,
    lineHeight: 1.4,
  },
});

export function PdfH1({ children }: { children: ReactNode }) {
  return (
    <View wrap={false}>
      <Text style={styles.h1}>{children}</Text>
    </View>
  );
}

export function PdfH2({ children }: { children: ReactNode }) {
  return (
    <View wrap={false}>
      <Text style={styles.h2}>{children}</Text>
    </View>
  );
}

export function PdfP({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[styles.p, style ?? {}]}>{children}</Text>;
}

export function PdfNote({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[styles.note, style ?? {}]}>{children}</Text>;
}
