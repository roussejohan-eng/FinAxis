interface KpiSpec {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: "trend" | "coin" | "wallet" | "stack";
}

const KPIS: KpiSpec[] = [
  { label: "Chiffre d'affaires", value: "12,4 k€", trend: "+8,2 %", trendUp: true, icon: "trend" },
  { label: "Résultat net", value: "3,1 k€", trend: "+2,4 %", trendUp: true, icon: "coin" },
  { label: "Trésorerie", value: "18,7 k€", trend: "+5,1 %", trendUp: true, icon: "wallet" },
  { label: "Charges", value: "9,3 k€", trend: "−1,8 %", trendUp: false, icon: "stack" },
];

const BARS = [38, 46, 42, 54, 50, 61, 58, 67, 63, 74, 70, 82];
const LINE = [30, 34, 33, 40, 39, 47, 46, 55, 54, 63, 66, 78];

function KpiIcon({ type, x, y }: { type: KpiSpec["icon"]; x: number; y: number }) {
  const stroke = "#0F2A44";
  switch (type) {
    case "trend":
      return (
        <g transform={`translate(${x} ${y})`} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12 L7 7 L10.5 10 L16 3" />
          <path d="M11.5 3 H16 V7.5" />
        </g>
      );
    case "coin":
      return (
        <g transform={`translate(${x} ${y})`} fill="none" stroke={stroke} strokeWidth="1.6">
          <circle cx="9" cy="8" r="6.5" />
          <path d="M9 5v6M6.8 6.4c0-1 .9-1.7 2.2-1.7s2.2.6 2.2 1.5c0 2.2-4.4 1-4.4 3.1 0 .9 1 1.5 2.2 1.5s2.2-.6 2.2-1.6" strokeLinecap="round" />
        </g>
      );
    case "wallet":
      return (
        <g transform={`translate(${x} ${y})`} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round">
          <rect x="1.5" y="4" width="15" height="10.5" rx="2" />
          <path d="M1.5 7.5h15" />
          <circle cx="12.5" cy="10.8" r="1.1" fill={stroke} stroke="none" />
        </g>
      );
    case "stack":
      return (
        <g transform={`translate(${x} ${y})`} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
          <path d="M9 2 2 6l7 4 7-4-7-4Z" />
          <path d="M2 10l7 4 7-4" />
          <path d="M2 14l7 4 7-4" />
        </g>
      );
  }
}

export function DashboardMockup({ className }: { className?: string }) {
  const chartX = 24;
  const chartY = 158;
  const chartW = 512;
  const chartH = 226;
  const plotTop = chartY + 34;
  const plotBottom = chartY + chartH - 28;
  const plotH = plotBottom - plotTop;
  const barW = 22;
  const gap = (chartW - 32) / BARS.length;

  const linePoints = LINE.map((v, i) => {
    const px = chartX + 16 + i * gap + gap / 2;
    const py = plotBottom - (v / 100) * plotH;
    return [px, py] as const;
  });
  const linePath = linePoints.map(([px, py], i) => `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${linePoints[linePoints.length - 1][0].toFixed(1)} ${plotBottom} L ${linePoints[0][0].toFixed(1)} ${plotBottom} Z`;

  return (
    <svg
      viewBox="0 0 560 420"
      className={className}
      role="img"
      aria-label="Aperçu du tableau de bord FinAxis : quatre indicateurs clés et l'évolution du chiffre d'affaires mensuel"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fx-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1FB6C1" stopOpacity="0.22" />
          <stop offset="1" stopColor="#1FB6C1" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0.5" y="0.5" width="559" height="419" rx="16" fill="#FFFFFF" stroke="#E5E9EE" />

      {/* Barre d'application */}
      <g transform="translate(24 22)">
        <path d="M0 20.5 L8.5 3 L17 20.5" stroke="#0F2A44" strokeWidth="3.4" strokeLinejoin="round" fill="none" />
        <path d="M6.3 14.8c0-3.6 1.6-6 3.9-8.4" stroke="#1FB6C1" strokeWidth="2" strokeLinecap="round" fill="none" />
        <polygon points="9.7,4.2 13.4,5.6 10.7,9" fill="#1FB6C1" />
      </g>
      <rect x="52" y="27" width="118" height="9" rx="4.5" fill="#DCE3EA" />
      <circle cx="518" cy="31.5" r="4" fill="#1FB6C1" />
      <circle cx="500" cy="31.5" r="4" fill="#DCE3EA" />
      <line x1="24" y1="52" x2="536" y2="52" stroke="#EEF1F4" strokeWidth="1" />

      {/* 4 cartes KPI */}
      {KPIS.map((kpi, i) => {
        const x = 24 + i * 130;
        return (
          <g key={kpi.label}>
            <rect x={x} y="68" width="118" height="76" rx="10" fill="#FFFFFF" stroke="#E9EDF1" />
            <rect x={x + 12} y="80" width="24" height="24" rx="7" fill="#F0F8F9" />
            <KpiIcon type={kpi.icon} x={x + 15} y={83} />
            <text x={x + 12} y="121" fontSize="8" fontFamily="Helvetica, Arial, sans-serif" fill="#8A97A6">
              {kpi.label}
            </text>
            <text x={x + 12} y="134" fontSize="13.5" fontFamily="Helvetica, Arial, sans-serif" fontWeight="bold" fill="#0F2A44">
              {kpi.value}
            </text>
            <text
              x={x + 106}
              y="121"
              fontSize="8"
              fontFamily="Helvetica, Arial, sans-serif"
              fontWeight="bold"
              textAnchor="end"
              fill={kpi.trendUp ? "#16A34A" : "#B45309"}
            >
              {kpi.trend}
            </text>
          </g>
        );
      })}

      {/* Zone graphique */}
      <rect x={chartX} y={chartY} width={chartW} height={chartH} rx="10" fill="#FFFFFF" stroke="#E9EDF1" />
      <text x={chartX + 16} y={chartY + 22} fontSize="9.5" fontFamily="Helvetica, Arial, sans-serif" fontWeight="bold" fill="#0F2A44">
        Chiffre d&apos;affaires vs charges
      </text>

      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1={chartX + 16}
          x2={chartX + chartW - 16}
          y1={plotTop + (i * plotH) / 2}
          y2={plotTop + (i * plotH) / 2}
          stroke="#F0F2F5"
          strokeWidth="1"
        />
      ))}

      {BARS.map((h, i) => {
        const x = chartX + 16 + i * gap;
        const barH = (h / 100) * plotH;
        const y = plotBottom - barH;
        return <rect key={i} x={x} y={y} width={barW} height={barH} rx="3" fill="#DCE3EA" />;
      })}

      <path d={areaPath} fill="url(#fx-area)" stroke="none" />
      <path d={linePath} fill="none" stroke="#1FB6C1" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      {linePoints.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={i === linePoints.length - 1 ? 3.2 : 0} fill="#1FB6C1" />
      ))}

      <line x1={chartX + 16} x2={chartX + chartW - 16} y1={plotBottom} y2={plotBottom} stroke="#E5E9EE" strokeWidth="1" />
    </svg>
  );
}
