import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** "light" = wordmark en blanc, pour les fonds sombres (footer, sidebar, sections marine). */
  variant?: "dark" | "light";
  /** Affiche uniquement le monogramme (le "A" fléché), sans le texte. */
  mark?: boolean;
  showTagline?: boolean;
  taglineClassName?: string;
}

/**
 * Wordmark FinAxis recréé en SVG inline : "Fin" + un "A" stylisé (deux
 * jambages sans barre transversale) contenant une flèche turquoise
 * montante, puis "xis". Baseline optionnelle en dessous.
 */
export function Logo({
  className,
  variant = "dark",
  mark = false,
  showTagline = false,
  taglineClassName,
}: LogoProps) {
  const wordColor = variant === "light" ? "#FFFFFF" : "#0F2A44";
  const arrowColor = "#1FB6C1";

  return (
    <div className={cn("inline-flex flex-col", className)}>
      <svg
        viewBox={mark ? "112 0 100 100" : "0 0 320 100"}
        role="img"
        aria-label="FinAxis"
        className="h-8 w-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>FinAxis</title>
        {!mark && (
          <text
            x="0"
            y="78"
            fontFamily="var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif"
            fontWeight={700}
            fontSize="84"
            letterSpacing="-2"
            fill={wordColor}
          >
            Fin
          </text>
        )}

        {/* "A" stylisé : deux jambages sans barre, flèche montante turquoise à l'intérieur */}
        <path
          d="M 130 82 L 164 12 L 198 82"
          stroke={wordColor}
          strokeWidth="16"
          strokeLinejoin="miter"
          strokeLinecap="butt"
          fill="none"
        />
        <path
          d="M 145 68 C 145 52 152 42 165 38"
          stroke={arrowColor}
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="163,29 179,34 168,47" fill={arrowColor} />

        {!mark && (
          <text
            x="204"
            y="78"
            fontFamily="var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif"
            fontWeight={700}
            fontSize="84"
            letterSpacing="-2"
            fill={wordColor}
          >
            xis
          </text>
        )}
      </svg>
      {showTagline && !mark && (
        <span
          className={cn(
            "mt-1 text-sm text-muted-foreground",
            variant === "light" && "text-white/60",
            taglineClassName
          )}
        >
          Comprendre, prévoir, réussir.
        </span>
      )}
    </div>
  );
}
