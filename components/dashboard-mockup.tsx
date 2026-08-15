export function DashboardMockup({ className }: { className?: string }) {
  const bars = [38, 52, 46, 60, 55, 68, 74, 66, 78, 84, 80, 92];
  return (
    <svg
      viewBox="0 0 560 420"
      className={className}
      role="img"
      aria-label="Aperçu du tableau de bord FinAxis : quatre indicateurs clés et un graphique du chiffre d'affaires mensuel"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="560" height="420" rx="16" fill="#FFFFFF" />
      <rect x="0.5" y="0.5" width="559" height="419" rx="15.5" stroke="#E5E9EE" />

      {/* Barre de titre */}
      <rect x="24" y="24" width="140" height="12" rx="6" fill="#0F2A44" />
      <circle cx="512" cy="30" r="6" fill="#1FB6C1" />

      {/* 4 cartes KPI */}
      {[0, 1, 2, 3].map((i) => {
        const x = 24 + i * 130;
        return (
          <g key={i}>
            <rect x={x} y="56" width="118" height="76" rx="10" fill="#F7F9FB" stroke="#E5E9EE" />
            <rect x={x + 14} y="72" width="60" height="8" rx="4" fill="#9AA9B8" />
            <rect x={x + 14} y="92" width="46" height="14" rx="4" fill="#0F2A44" />
            <rect x={x + 14} y="114" width="34" height="7" rx="3.5" fill="#1FB6C1" />
          </g>
        );
      })}

      {/* Graphique en barres */}
      <rect x="24" y="156" width="512" height="240" rx="10" fill="#F7F9FB" stroke="#E5E9EE" />
      <rect x="44" y="176" width="120" height="9" rx="4.5" fill="#0F2A44" />

      {bars.map((h, i) => {
        const barWidth = 26;
        const gap = 14;
        const x = 44 + i * (barWidth + gap);
        const maxH = 150;
        const barH = (h / 100) * maxH;
        const y = 356 - barH;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barH}
            rx="4"
            fill={i === bars.length - 1 ? "#1FB6C1" : "#0F2A44"}
            opacity={i === bars.length - 1 ? 1 : 0.85}
          />
        );
      })}
      <line x1="44" y1="356" x2="516" y2="356" stroke="#E5E9EE" strokeWidth="1" />
    </svg>
  );
}
