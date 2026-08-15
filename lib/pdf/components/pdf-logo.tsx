import { Path, Svg, Text as SvgText } from "@react-pdf/renderer";
import { PDF_COLORS } from "../theme";

// Le typage react-pdf pour <Text> en contexte SVG n'expose pas fontFamily /
// fontWeight / fontSize (uniquement pris en charge à l'exécution) : on
// passe donc ce style pré-construit pour éviter de dupliquer le `as any`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const svgTextStyle: any = { fontFamily: "Roboto", fontWeight: 700, fontSize: 84 };

/** Recrée le wordmark FinAxis en primitives react-pdf (mêmes coordonnées que components/logo.tsx). */
export function PdfLogo({ width = 90, color = PDF_COLORS.navy }: { width?: number; color?: string }) {
  const height = (width * 100) / 320;
  return (
    <Svg viewBox="0 0 320 100" width={width} height={height}>
      <SvgText x={0} y={78} style={svgTextStyle} fill={color}>
        Fin
      </SvgText>
      <Path
        d="M 130 82 L 164 12 L 198 82"
        stroke={color}
        strokeWidth={16}
        strokeLinejoin="miter"
        fill="none"
      />
      <Path
        d="M 147 60 H 170 V 37"
        stroke={PDF_COLORS.turquoise}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M 147 60 L 170 37"
        stroke={PDF_COLORS.turquoise}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <SvgText x={204} y={78} style={svgTextStyle} fill={color}>
        xis
      </SvgText>
    </Svg>
  );
}
