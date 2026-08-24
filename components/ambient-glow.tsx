// Fond décoratif réutilisable : un dégradé abstrait navy/turquoise flouté,
// posé en DOM avant le contenu (pas de z-index négatif — expérience faite,
// ça finit invisible derrière le fond opaque de la section). Le parent
// direct doit être positionné (`relative`) pour que ce calque s'y ancre.
//
// - variant="light" : pour un fond blanc/clair — glow doux, très discret.
// - variant="dark" : pour un fond navy sombre — halo turquoise/blanc plus
//   marqué, c'est là qu'on peut pousser le plus loin dans l'univers.
export function AmbientGlow({
  variant = "light",
  className = "h-[720px]",
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const id = variant === "dark" ? "dark" : "light";

  return (
    <div className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden ${className}`} aria-hidden>
      {variant === "light" ? (
        <svg
          className="absolute left-1/2 top-[-60px] h-[780px] w-[1600px] -translate-x-1/2 blur-3xl"
          viewBox="0 0 1600 780"
          fill="none"
        >
          <defs>
            <radialGradient id={`glow-navy-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0F2A44" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#0F2A44" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`glow-turquoise-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1FB6C1" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#1FB6C1" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="180" cy="220" rx="460" ry="300" fill={`url(#glow-navy-${id})`} />
          <ellipse cx="1320" cy="160" rx="440" ry="300" fill={`url(#glow-turquoise-${id})`} />
        </svg>
      ) : (
        <svg
          className="absolute left-1/2 top-[-60px] h-[780px] w-[1600px] -translate-x-1/2 blur-3xl"
          viewBox="0 0 1600 780"
          fill="none"
        >
          <defs>
            <radialGradient id={`glow-turquoise-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1FB6C1" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1FB6C1" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`glow-white-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="220" cy="200" rx="480" ry="320" fill={`url(#glow-turquoise-${id})`} />
          <ellipse cx="1300" cy="260" rx="440" ry="300" fill={`url(#glow-white-${id})`} />
        </svg>
      )}
    </div>
  );
}
