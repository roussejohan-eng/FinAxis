import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { PDF_COLORS, PDF_SIZES } from "../theme";
import { formatEUR } from "../pdf-format";

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderRadius: 4,
    padding: 8,
    backgroundColor: PDF_COLORS.white,
  },
  label: {
    fontSize: PDF_SIZES.note,
    color: PDF_COLORS.grey,
    fontFamily: "Roboto",
    fontWeight: 400,
  },
  value: {
    marginTop: 4,
    fontSize: PDF_SIZES.h2,
    color: PDF_COLORS.navy,
    fontFamily: "Roboto",
    fontWeight: 700,
  },
  badge: {
    marginTop: 4,
    fontSize: 7,
    fontFamily: "Roboto",
    fontWeight: 500,
  },
});

export function PdfKpiCard({
  label,
  value,
  badge,
}: {
  label: string;
  value: number;
  badge?: { label: string; positive: boolean };
}) {
  return (
    <View style={styles.card} wrap={false}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: value < 0 ? PDF_COLORS.negative : PDF_COLORS.navy }]}>
        {formatEUR(value)}
      </Text>
      {badge && (
        <Text style={[styles.badge, { color: badge.positive ? PDF_COLORS.positive : PDF_COLORS.negative }]}>
          {badge.label}
        </Text>
      )}
    </View>
  );
}
