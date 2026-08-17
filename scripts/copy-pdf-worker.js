// Copie le worker pdf.js dans public/ pour qu'il soit servi comme un
// simple fichier statique plutôt que traité par le pipeline webpack de
// Next.js. Sans ça, le build de production échoue : Next passe ce fichier
// (un module ESM contenant `import.meta`) dans Terser configuré pour du
// code non-module, ce qui casse la minification. Servir le fichier tel
// quel depuis public/ évite complètement ce traitement.
// Exécuté automatiquement après chaque `npm install` (voir "postinstall").
const fs = require("node:fs");
const path = require("node:path");

const src = path.join(__dirname, "..", "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const destDir = path.join(__dirname, "..", "public");
const dest = path.join(destDir, "pdf.worker.min.mjs");

if (!fs.existsSync(src)) {
  console.warn("[copy-pdf-worker] fichier source introuvable, ignoré :", src);
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log("[copy-pdf-worker] pdf.worker.min.mjs copié dans public/");
