import { Font } from "@react-pdf/renderer";

let registered = false;

/**
 * Enregistre la police Roboto (embarquée localement en /public/fonts) pour
 * garantir un rendu contrôlé — accents français, symbole €, signe moins
 * typographique "−" — sans dépendre des 14 polices standard PDF.
 */
export function registerPdfFonts() {
  if (registered) return;
  Font.register({
    family: "Roboto",
    fonts: [
      { src: "/fonts/Roboto-Regular.woff", fontWeight: 400 },
      { src: "/fonts/Roboto-Medium.woff", fontWeight: 500 },
      { src: "/fonts/Roboto-Bold.woff", fontWeight: 700 },
      { src: "/fonts/Roboto-Italic.woff", fontWeight: 400, fontStyle: "italic" },
    ],
  });
  // Désactive la césure automatique (évite de couper les mots/nombres en fin de ligne).
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
