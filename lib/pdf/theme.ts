// Palette et échelle typographique du PDF, alignées sur l'identité FinAxis.
export const PDF_COLORS = {
  navy: "#0F2A44",
  navyLight: "#3D5975",
  turquoise: "#1FB6C1",
  turquoisePale: "#EAFBFC",
  grey: "#6B7280",
  greyLight: "#9AA9B8",
  border: "#E5E9EE",
  zebra: "#F7F9FB",
  white: "#FFFFFF",
  negative: "#DC2626",
  positive: "#16A34A",
};

export const PDF_SIZES = {
  title: 24,
  h1: 16,
  h2: 12,
  body: 10,
  note: 8,
};

// Marges 20mm haut/bas, 15mm gauche/droite (react-pdf accepte les unités "mm" nativement).
export const PAGE_MARGIN = { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" };
export const PAGE_MARGIN_LANDSCAPE = { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" };
