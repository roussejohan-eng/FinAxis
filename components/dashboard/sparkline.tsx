import { useId } from "react";

/**
 * Mini-graphique d'évolution en SVG pur (pas de dépendance graphique) —
 * utilisé dans les cartes KPI et l'aperçu en temps réel de l'assistant.
 * viewBox à largeur logique fixe (100) + preserveAspectRatio="none" pour
 * s'étirer sur toute la largeur du conteneur via CSS, quelle que soit la
 * taille réelle affichée.
 */
export function Sparkline({
  data,
  height = 40,
  color = "#1282A2",
  showArea = true,
  strokeWidth = 1.75,
}: {
  data: number[];
  height?: number;
  color?: string;
  showArea?: boolean;
  strokeWidth?: number;
}) {
  const gradientId = useId();
  const width = 100;

  if (data.length < 2 || data.every((v) => v === data[0])) {
    const y = height / 2;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden>
        <line x1={0} y1={y} x2={width} y2={y} stroke={color} strokeWidth={strokeWidth} strokeDasharray="2 3" opacity={0.5} />
      </svg>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  // Marge verticale pour que le trait ne touche jamais les bords.
  const pad = height * 0.12;
  const plotH = height - pad * 2;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = pad + plotH - ((v - min) / range) * plotH;
    return [x, y] as const;
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden>
      {showArea && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {showArea && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
      <path d={linePath} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lastX} cy={lastY} r={strokeWidth * 1.4} fill={color} />
    </svg>
  );
}
