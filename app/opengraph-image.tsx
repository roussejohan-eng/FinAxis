import { ImageResponse } from "next/og";

export const alt = "FinAxis — comprendre, prévoir, réussir";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image de partage générée à la volée (satori/next-og) : pas d'image
// statique à maintenir, et un rendu qui reste cohérent avec la charte
// (marine + turquoise, wordmark, tagline) si celle-ci évolue.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#001F54",
          backgroundImage:
            "radial-gradient(circle at 82% 8%, rgba(18,130,162,0.35), rgba(18,130,162,0) 55%), radial-gradient(circle at 8% 100%, rgba(18,130,162,0.18), rgba(18,130,162,0) 50%)",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="64" height="64" viewBox="0 0 100 100" fill="none">
            <path d="M 18 82 L 52 12 L 86 82" stroke="#FFFFFF" strokeWidth="14" strokeLinejoin="miter" fill="none" />
            <path d="M 33 68 C 33 52 40 42 53 38" stroke="#1282A2" strokeWidth="8" strokeLinecap="round" fill="none" />
            <polygon points="51,29 67,34 56,47" fill="#1282A2" />
          </svg>
          <span style={{ fontSize: 56, fontWeight: 700, color: "#FFFFFF", letterSpacing: -1 }}>
            FinAxis
          </span>
        </div>

        <div style={{ display: "flex", marginTop: 48, maxWidth: 880 }}>
          <span style={{ fontSize: 46, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.25 }}>
            Le dossier financier que les banques attendent.
          </span>
        </div>

        <div style={{ display: "flex", marginTop: 28 }}>
          <span style={{ fontSize: 24, color: "rgba(255,255,255,0.65)" }}>
            Prévisionnel, trésorerie et plan de financement en 30 minutes.
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
