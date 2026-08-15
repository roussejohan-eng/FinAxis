import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PDF_COLORS, PDF_SIZES } from "../theme";
import { formatEUR } from "../pdf-format";

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: PDF_COLORS.navy,
  },
  row: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: PDF_COLORS.border,
  },
  th: {
    padding: 5,
    fontSize: PDF_SIZES.note,
    fontFamily: "Roboto",
    fontWeight: 500,
    color: PDF_COLORS.white,
  },
  td: {
    padding: 5,
    fontSize: PDF_SIZES.body,
    fontFamily: "Roboto",
    fontWeight: 400,
    color: PDF_COLORS.navy,
  },
  tdSmall: {
    padding: 4,
    fontSize: 9,
    fontFamily: "Roboto",
    fontWeight: 400,
    color: PDF_COLORS.navy,
  },
});

export function PdfTable({ children, wrap = false }: { children: ReactNode; wrap?: boolean }) {
  return (
    <View style={styles.table} wrap={wrap}>
      {children}
    </View>
  );
}

export function PdfHeaderRow({ children }: { children: ReactNode }) {
  return (
    <View style={styles.headerRow} wrap={false}>
      {children}
    </View>
  );
}

export function PdfRow({
  children,
  zebra = false,
  bold = false,
}: {
  children: ReactNode;
  zebra?: boolean;
  bold?: boolean;
}) {
  return (
    <View
      style={[
        styles.row,
        zebra ? { backgroundColor: PDF_COLORS.zebra } : {},
        bold ? { borderTopWidth: 1.5, borderTopColor: PDF_COLORS.turquoise } : {},
      ]}
      wrap={false}
    >
      {children}
    </View>
  );
}

export function Th({
  children,
  flex = 1,
  align = "left",
  small = false,
}: {
  children: ReactNode;
  flex?: number;
  align?: "left" | "right" | "center";
  small?: boolean;
}) {
  return (
    <Text style={[styles.th, { flex, textAlign: align }, small ? { fontSize: 8 } : {}]}>{children}</Text>
  );
}

export function Td({
  children,
  flex = 1,
  align = "left",
  bold = false,
  small = false,
}: {
  children: ReactNode;
  flex?: number;
  align?: "left" | "right" | "center";
  bold?: boolean;
  small?: boolean;
}) {
  return (
    <Text
      style={[
        small ? styles.tdSmall : styles.td,
        { flex, textAlign: align },
        bold ? { fontFamily: "Roboto", fontWeight: 500 } : {},
      ]}
    >
      {children}
    </Text>
  );
}

export function MoneyTd({
  value,
  flex = 1,
  bold = false,
  highlight = false,
  small = false,
  decimals = 0,
}: {
  value: number;
  flex?: number;
  bold?: boolean;
  highlight?: boolean;
  small?: boolean;
  decimals?: number;
}) {
  const color = value < 0 ? PDF_COLORS.negative : highlight && value > 0 ? PDF_COLORS.positive : PDF_COLORS.navy;
  return (
    <Text
      style={[
        small ? styles.tdSmall : styles.td,
        { flex, textAlign: "right", color },
        bold ? { fontFamily: "Roboto", fontWeight: 500 } : {},
      ]}
    >
      {formatEUR(value, decimals)}
    </Text>
  );
}
