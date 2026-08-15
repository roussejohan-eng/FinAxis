import { Circle, Line, Path, Rect, Svg, Text as SvgText } from "@react-pdf/renderer";
import { PDF_COLORS } from "../theme";

// Voir la note dans pdf-logo.tsx : fontFamily/fontSize ne sont pas typés
// sur <Text> en contexte SVG bien qu'ils soient pris en charge à l'exécution.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const axisLabelStyle: any = { fontFamily: "Roboto", fontSize: 6 };

/**
 * Petit graphique en courbe, dessiné en primitives vectorielles react-pdf
 * (alternative "SVG pré-calculé" autorisée par le cahier des charges à la
 * place d'une image PNG générée via html2canvas). Une bande rouge marque
 * la zone sous zéro.
 */
export function PdfLineChart({
  values,
  labels,
  width = 500,
  height = 130,
}: {
  values: number[];
  labels: string[];
  width?: number;
  height?: number;
}) {
  const padTop = 10;
  const padBottom = 16;
  const padLeft = 4;
  const padRight = 4;
  const innerWidth = width - padLeft - padRight;
  const innerHeight = height - padTop - padBottom;

  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values, 1);
  const range = max - min || 1;

  const x = (i: number) => padLeft + (i / Math.max(values.length - 1, 1)) * innerWidth;
  const y = (v: number) => padTop + innerHeight - ((v - min) / range) * innerHeight;
  const zeroY = y(0);

  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(" L ");
  const path = `M ${points}`;

  return (
    <Svg width={width} height={height}>
      {min < 0 && (
        <Rect x={padLeft} y={zeroY} width={innerWidth} height={Math.max(padTop + innerHeight - zeroY, 0)} fill="#FDECEC" />
      )}
      <Line x1={padLeft} y1={zeroY} x2={padLeft + innerWidth} y2={zeroY} stroke={PDF_COLORS.grey} strokeWidth={0.5} strokeDasharray="2,2" />
      <Path d={path} stroke={PDF_COLORS.turquoise} strokeWidth={2} fill="none" />
      {values.map((v, i) => (
        <Circle key={i} cx={x(i)} cy={y(v)} r={1.6} fill={v < 0 ? PDF_COLORS.negative : PDF_COLORS.turquoise} />
      ))}
      {labels.map((label, i) =>
        i % 2 === 0 ? (
          <SvgText
            key={label}
            x={x(i)}
            y={height - 2}
            style={axisLabelStyle}
            fill={PDF_COLORS.grey}
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ) : null
      )}
    </Svg>
  );
}
