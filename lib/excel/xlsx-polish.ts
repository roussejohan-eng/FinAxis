import JSZip from "jszip";
import { EUR_FORMAT, PCT_FORMAT } from "./sheet-helpers";

// -- Mise en forme visuelle du classeur Excel ----------------------------
// La bibliothèque `xlsx` (SheetJS, édition communautaire) utilisée pour
// générer les classeurs ne sait pas écrire de mise en forme (couleurs,
// bordures, quadrillage masqué) — vérifié empiriquement : une cellule à
// laquelle on assigne un style (`cell.s`) l'ignore silencieusement à
// l'écriture. Ce module poste-traite le fichier .xlsx déjà écrit (qui
// n'est qu'une archive ZIP de fichiers XML) pour y injecter une vraie
// feuille de styles OOXML : bandeaux de titre, en-têtes de tableau,
// cellules d'entrée teintées, lignes de total, quadrillage masqué.
//
// Validé par une relecture indépendante avec openpyxl (Python) en plus de
// SheetJS lui-même, en l'absence d'un Excel/LibreOffice réel dans cet
// environnement pour vérifier visuellement.

const NAVY = "0F2A44";
const NAVY_PALE = "EEF2F5";
const TURQUOISE_PALE = "EAFBFC";
const BORDER_GREY = "E5E9EE";
const WHITE = "FFFFFF";

function argb(hex: string): string {
  return "FF" + hex.toUpperCase();
}

export type CellFormat = "eur" | "pct" | "none";

export type StyleRegion =
  /** Bandeau de titre (fond navy, texte blanc gras) — fusionner la plage avant l'écriture via `!merges`. */
  | { kind: "title"; ref: string }
  /** Ligne d'en-tête de tableau (fond bleu pâle, texte navy gras, bordure basse). */
  | { kind: "header"; ref: string }
  /** Libellé de section en gras navy, sans fond (ex. "BESOINS", "CHIFFRES CLÉS"). */
  | { kind: "sectionLabel"; ref: string }
  /** Ligne de total : gras + bordure haute, un format par cellule. */
  | { kind: "total"; cells: { ref: string; format?: CellFormat }[] }
  /** Cellule éditable (feuille Hyp) : fond turquoise pâle + bordure fine tout autour. */
  | { kind: "input"; cells: { ref: string; format?: CellFormat }[] };

export interface SheetStylePlan {
  sheetName: string;
  regions: StyleRegion[];
  /** Masquer le quadrillage par défaut d'Excel — true sauf mention contraire. */
  hideGridlines?: boolean;
}

interface StyleIndices {
  XF_TITLE: number;
  XF_HEADER: number;
  XF_SECTION: number;
  totalXf(format: CellFormat | undefined): number;
  inputXf(format: CellFormat | undefined): number;
}

function findNumFmtId(stylesXml: string, formatCode: string): number | null {
  const escaped = formatCode.replace(/"/g, "&quot;").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = stylesXml.match(new RegExp(`<numFmt numFmtId="(\\d+)" formatCode="${escaped}"\\s*/>`));
  return m ? Number(m[1]) : null;
}

function countOf(xml: string, tag: string): number {
  const m = xml.match(new RegExp(`<${tag} count="(\\d+)">`));
  if (!m) throw new Error(`polishWorkbook: balise <${tag}> introuvable dans styles.xml`);
  return Number(m[1]);
}

function replaceCount(xml: string, tag: string, count: number): string {
  return xml.replace(new RegExp(`<${tag} count="\\d+">`), `<${tag} count="${count}">`);
}

/** Ajoute une entrée numFmt personnalisée si le format n'est utilisé nulle part dans le classeur. */
function ensureNumFmt(xml: string, formatCode: string, customId: number): { xml: string; id: number } {
  const existing = findNumFmtId(xml, formatCode);
  if (existing != null) return { xml, id: existing };
  const escaped = formatCode.replace(/"/g, "&quot;");
  const entry = `<numFmt numFmtId="${customId}" formatCode="${escaped}"/>`;
  if (/<numFmts count="\d+">/.test(xml)) {
    const count = countOf(xml, "numFmts");
    xml = replaceCount(xml, "numFmts", count + 1).replace("</numFmts>", entry + "</numFmts>");
  } else {
    // Aucun numFmt personnalisé dans le classeur (cas limite) : créer le bloc.
    xml = xml.replace("<fonts", `<numFmts count="1">${entry}</numFmts><fonts`);
  }
  return { xml, id: customId };
}

/** Ajoute la palette de styles FinAxis à styles.xml, en préservant tout ce que SheetJS y a déjà écrit. */
function extendStylesheet(stylesXml: string): { xml: string; indices: StyleIndices } {
  let xml = stylesXml;
  const eur = ensureNumFmt(xml, EUR_FORMAT, 300);
  xml = eur.xml;
  const pct = ensureNumFmt(xml, PCT_FORMAT, 301);
  xml = pct.xml;
  const eurId = eur.id;
  const pctId = pct.id;

  const fontsCount = countOf(xml, "fonts");
  const fillsCount = countOf(xml, "fills");
  const bordersCount = countOf(xml, "borders");
  const cellXfsCount = countOf(xml, "cellXfs");

  const F_TITLE = fontsCount;
  const F_HEADER = fontsCount + 1;
  const newFonts =
    `<font><b/><sz val="12"/><color rgb="${argb(WHITE)}"/><name val="Calibri"/></font>` +
    `<font><b/><sz val="10"/><color rgb="${argb(NAVY)}"/><name val="Calibri"/></font>`;

  const FL_TITLE = fillsCount;
  const FL_HEADER = fillsCount + 1;
  const FL_INPUT = fillsCount + 2;
  const newFills =
    `<fill><patternFill patternType="solid"><fgColor rgb="${argb(NAVY)}"/><bgColor indexed="64"/></patternFill></fill>` +
    `<fill><patternFill patternType="solid"><fgColor rgb="${argb(NAVY_PALE)}"/><bgColor indexed="64"/></patternFill></fill>` +
    `<fill><patternFill patternType="solid"><fgColor rgb="${argb(TURQUOISE_PALE)}"/><bgColor indexed="64"/></patternFill></fill>`;

  const BD_BOTTOM = bordersCount;
  const BD_TOP_THICK = bordersCount + 1;
  const BD_BOX_THIN = bordersCount + 2;
  const thinGrey = `style="thin"><color rgb="${argb(BORDER_GREY)}"/></`;
  const newBorders =
    `<border><left/><right/><top/><bottom ${thinGrey}bottom><diagonal/></border>` +
    `<border><left/><right/><top style="medium"><color rgb="${argb(NAVY)}"/></top><bottom/><diagonal/></border>` +
    `<border><left ${thinGrey}left><right ${thinGrey}right><top ${thinGrey}top><bottom ${thinGrey}bottom><diagonal/></border>`;

  const XF_TITLE = cellXfsCount;
  const XF_HEADER = cellXfsCount + 1;
  const XF_SECTION = cellXfsCount + 2;
  const XF_TOTAL_TEXT = cellXfsCount + 3;
  const XF_TOTAL_EUR = cellXfsCount + 4;
  const XF_TOTAL_PCT = cellXfsCount + 5;
  const XF_INPUT_TEXT = cellXfsCount + 6;
  const XF_INPUT_EUR = cellXfsCount + 7;
  const XF_INPUT_PCT = cellXfsCount + 8;
  const newXfs =
    `<xf numFmtId="0" fontId="${F_TITLE}" fillId="${FL_TITLE}" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>` +
    `<xf numFmtId="0" fontId="${F_HEADER}" fillId="${FL_HEADER}" borderId="${BD_BOTTOM}" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>` +
    `<xf numFmtId="0" fontId="${F_HEADER}" fillId="0" borderId="0" xfId="0" applyFont="1"/>` +
    `<xf numFmtId="0" fontId="${F_HEADER}" fillId="0" borderId="${BD_TOP_THICK}" xfId="0" applyFont="1" applyBorder="1"/>` +
    `<xf numFmtId="${eurId}" fontId="${F_HEADER}" fillId="0" borderId="${BD_TOP_THICK}" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1"/>` +
    `<xf numFmtId="${pctId}" fontId="${F_HEADER}" fillId="0" borderId="${BD_TOP_THICK}" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1"/>` +
    `<xf numFmtId="0" fontId="0" fillId="${FL_INPUT}" borderId="${BD_BOX_THIN}" xfId="0" applyFill="1" applyBorder="1"/>` +
    `<xf numFmtId="${eurId}" fontId="0" fillId="${FL_INPUT}" borderId="${BD_BOX_THIN}" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/>` +
    `<xf numFmtId="${pctId}" fontId="0" fillId="${FL_INPUT}" borderId="${BD_BOX_THIN}" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/>`;

  xml = replaceCount(xml, "fonts", fontsCount + 2).replace("</fonts>", newFonts + "</fonts>");
  xml = replaceCount(xml, "fills", fillsCount + 3).replace("</fills>", newFills + "</fills>");
  xml = replaceCount(xml, "borders", bordersCount + 3).replace("</borders>", newBorders + "</borders>");
  xml = replaceCount(xml, "cellXfs", cellXfsCount + 9).replace("</cellXfs>", newXfs + "</cellXfs>");

  const indices: StyleIndices = {
    XF_TITLE,
    XF_HEADER,
    XF_SECTION,
    totalXf: (format) => (format === "eur" ? XF_TOTAL_EUR : format === "pct" ? XF_TOTAL_PCT : XF_TOTAL_TEXT),
    inputXf: (format) => (format === "eur" ? XF_INPUT_EUR : format === "pct" ? XF_INPUT_PCT : XF_INPUT_TEXT),
  };
  return { xml, indices };
}

function hideGridlines(sheetXml: string): string {
  if (/<sheetView[^>]*\sshowGridLines=/.test(sheetXml)) return sheetXml;
  if (/<sheetView\b/.test(sheetXml)) {
    return sheetXml.replace(/<sheetView(\s|\/?>)/, '<sheetView showGridLines="0"$1');
  }
  // Aucun <sheetView> écrit (feuille sans !ref particulier) : en ajouter un juste après <sheetViews>.
  return sheetXml.replace(
    /<sheetViews>/,
    '<sheetViews><sheetView showGridLines="0" workbookViewId="0"/></sheetViews>'
  ).replace(/<sheetViews><sheetView showGridLines="0" workbookViewId="0"\/><\/sheetViews><sheetViews>.*?<\/sheetViews>/, (m) => m);
}

function colToNum(col: string): number {
  let n = 0;
  for (const ch of col) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

function numToCol(n: number): string {
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function parseRef(ref: string): { col: string; row: number } {
  const m = ref.match(/^([A-Z]+)(\d+)$/);
  if (!m) throw new Error(`polishWorkbook: référence de cellule invalide "${ref}"`);
  return { col: m[1], row: Number(m[2]) };
}

/**
 * Pose l'attribut `s="idx"` sur une cellule existante, ou l'insère (vide) si
 * elle n'existe pas encore — nécessaire pour les cellules de saisie encore
 * vierges (au-delà des lignes d'exemple), qui n'ont aucun `<c>` dans le XML
 * tant qu'aucune valeur n'y a été écrite.
 */
function setCellStyleInSheet(sheetXml: string, ref: string, styleIdx: number): string {
  const { col, row } = parseRef(ref);
  const rowRe = new RegExp(`(<row r="${row}"[^>]*>)([\\s\\S]*?)(</row>)`);
  const rowMatch = sheetXml.match(rowRe);

  const cellRe = new RegExp(`<c r="${ref}"([^>]*?)(/>|>([\\s\\S]*?)</c>)`);

  if (rowMatch) {
    const [, openTag, rowBody, closeTag] = rowMatch;
    if (cellRe.test(rowBody)) {
      const newBody = rowBody.replace(cellRe, (full, attrs, tail, inner) => {
        const cleanAttrs = attrs.replace(/\s*s="\d+"/, "");
        return `<c r="${ref}"${cleanAttrs} s="${styleIdx}"${inner !== undefined ? `>${inner}</c>` : "/>"}`;
      });
      return sheetXml.replace(rowRe, `${openTag}${newBody}${closeTag}`);
    }
    // Insérer une cellule vide au bon endroit (ordre des colonnes croissant).
    const cells = Array.from(rowBody.matchAll(/<c r="([A-Z]+)\d+"/g)).map((m) => m[1]);
    const targetCol = colToNum(col);
    let insertAfter = -1;
    for (let i = 0; i < cells.length; i++) {
      if (colToNum(cells[i]) < targetCol) insertAfter = i;
    }
    const newCell = `<c r="${ref}" s="${styleIdx}"/>`;
    if (insertAfter === -1) {
      return sheetXml.replace(rowRe, `${openTag}${newCell}${rowBody}${closeTag}`);
    }
    const parts = rowBody.split(/(<c r="[A-Z]+\d+"[^>]*?(?:\/>|>[\s\S]*?<\/c>))/).filter(Boolean);
    // Repère la position d'insertion en comptant les cellules déjà vues.
    let seen = -1;
    let out = openTag;
    for (const part of parts) {
      if (/^<c r=/.test(part)) {
        seen++;
        out += part;
        if (seen === insertAfter) out += newCell;
      } else {
        out += part;
      }
    }
    return sheetXml.replace(rowRe, `${out}${closeTag}`);
  }

  // La ligne entière n'existe pas encore : l'insérer au bon endroit dans <sheetData>.
  const newRow = `<row r="${row}"><c r="${ref}" s="${styleIdx}"/></row>`;
  const rows = Array.from(sheetXml.matchAll(/<row r="(\d+)"[^>]*>[\s\S]*?<\/row>|<row r="(\d+)"[^>]*\/>/g));
  let insertBeforeRowNum: number | null = null;
  for (const m of rows) {
    const r = Number(m[1] ?? m[2]);
    if (r > row) {
      insertBeforeRowNum = r;
      break;
    }
  }
  if (insertBeforeRowNum != null) {
    return sheetXml.replace(new RegExp(`<row r="${insertBeforeRowNum}"`), newRow + `<row r="${insertBeforeRowNum}"`);
  }
  return sheetXml.replace("</sheetData>", newRow + "</sheetData>");
}

function forEachRefInRange(ref: string, fn: (ref: string) => void): void {
  const [start, end] = ref.includes(":") ? ref.split(":") : [ref, ref];
  const a = parseRef(start);
  const b = parseRef(end);
  const c1 = colToNum(a.col);
  const c2 = colToNum(b.col);
  for (let r = a.row; r <= b.row; r++) {
    for (let c = c1; c <= c2; c++) {
      fn(`${numToCol(c)}${r}`);
    }
  }
}

/**
 * Poste-traite un classeur .xlsx déjà écrit par SheetJS pour y ajouter une
 * vraie mise en forme (couleurs, bordures, quadrillage masqué) — voir la
 * note en tête de fichier sur pourquoi ce n'est pas possible directement à
 * l'écriture avec cette bibliothèque.
 */
export async function polishWorkbook(buffer: Uint8Array, plans: SheetStylePlan[]): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(buffer);

  const stylesFile = zip.file("xl/styles.xml");
  if (!stylesFile) return buffer; // classeur sans feuille de styles (ne devrait pas arriver) : ne rien faire.
  const stylesXml = await stylesFile.async("string");
  const { xml: newStyles, indices } = extendStylesheet(stylesXml);
  zip.file("xl/styles.xml", newStyles);

  // xl/workbook.xml liste les feuilles dans l'ordre ; xl/_rels/workbook.xml.rels
  // fait le lien nom de fichier <-> r:id. On construit sheetName -> fichier XML.
  const workbookXml = await zip.file("xl/workbook.xml")!.async("string");
  const relsXml = await zip.file("xl/_rels/workbook.xml.rels")!.async("string");
  const sheetIdToRid = new Map<string, string>();
  for (const m of Array.from(workbookXml.matchAll(/<sheet name="([^"]+)"[^>]*r:id="([^"]+)"/g))) {
    sheetIdToRid.set(m[1], m[2]);
  }
  const ridToTarget = new Map<string, string>();
  for (const m of Array.from(relsXml.matchAll(/<Relationship Id="([^"]+)"[^>]*Target="([^"]+)"/g))) {
    ridToTarget.set(m[1], m[2]);
  }

  for (const plan of plans) {
    const rid = sheetIdToRid.get(plan.sheetName);
    if (!rid) continue; // feuille absente de ce classeur (ex. plan générique appliqué à un classeur partiel)
    const target = ridToTarget.get(rid);
    if (!target) continue;
    const path = `xl/${target.replace(/^\.?\//, "")}`;
    const file = zip.file(path);
    if (!file) continue;
    let sheetXml = await file.async("string");

    if (plan.hideGridlines !== false) sheetXml = hideGridlines(sheetXml);

    for (const region of plan.regions) {
      if (region.kind === "title") {
        forEachRefInRange(region.ref, (ref) => (sheetXml = setCellStyleInSheet(sheetXml, ref, indices.XF_TITLE)));
      } else if (region.kind === "header") {
        forEachRefInRange(region.ref, (ref) => (sheetXml = setCellStyleInSheet(sheetXml, ref, indices.XF_HEADER)));
      } else if (region.kind === "sectionLabel") {
        forEachRefInRange(region.ref, (ref) => (sheetXml = setCellStyleInSheet(sheetXml, ref, indices.XF_SECTION)));
      } else if (region.kind === "total") {
        for (const cell of region.cells) {
          sheetXml = setCellStyleInSheet(sheetXml, cell.ref, indices.totalXf(cell.format));
        }
      } else if (region.kind === "input") {
        for (const cell of region.cells) {
          sheetXml = setCellStyleInSheet(sheetXml, cell.ref, indices.inputXf(cell.format));
        }
      }
    }

    zip.file(path, sheetXml);
  }

  return zip.generateAsync({ type: "uint8array" });
}
