import * as XLSX from "xlsx";

// Codes de format Excel standard (jeton "," pour le séparateur de milliers,
// "." pour le séparateur décimal) : Excel les affiche automatiquement selon
// les paramètres régionaux de l'utilisateur (espace et virgule en français).
export const EUR_FORMAT = '#,##0" €"';
export const EUR2_FORMAT = '#,##0.00" €"';
export const PCT_FORMAT = "0.0%";

/** Convertit (colonne 0-indexée, ligne 1-indexée) en référence Excel, ex (1,3) -> "B3". */
export function ref(col: number, row: number): string {
  return XLSX.utils.encode_cell({ c: col, r: row - 1 });
}

export function setValue(
  ws: XLSX.WorkSheet,
  col: number,
  row: number,
  value: string | number,
  numFmt?: string
) {
  const address = ref(col, row);
  const cell: XLSX.CellObject =
    typeof value === "number" ? { t: "n", v: value } : { t: "s", v: value };
  if (numFmt) cell.z = numFmt;
  ws[address] = cell;
}

export function setFormula(
  ws: XLSX.WorkSheet,
  col: number,
  row: number,
  formula: string,
  numFmt?: string
) {
  const address = ref(col, row);
  const cell: XLSX.CellObject = { t: "n", f: formula };
  if (numFmt) cell.z = numFmt;
  ws[address] = cell;
}

export function setLabel(ws: XLSX.WorkSheet, col: number, row: number, text: string) {
  ws[ref(col, row)] = { t: "s", v: text };
}

/** Calcule et pose `!ref` à partir des cellules effectivement écrites dans la feuille. */
export function finalizeSheet(ws: XLSX.WorkSheet) {
  const addresses = Object.keys(ws).filter((k) => !k.startsWith("!"));
  if (addresses.length === 0) {
    ws["!ref"] = "A1";
    return;
  }
  let minR = Infinity;
  let minC = Infinity;
  let maxR = -Infinity;
  let maxC = -Infinity;
  for (const addr of addresses) {
    const { r, c } = XLSX.utils.decode_cell(addr);
    minR = Math.min(minR, r);
    minC = Math.min(minC, c);
    maxR = Math.max(maxR, r);
    maxC = Math.max(maxC, c);
  }
  ws["!ref"] = XLSX.utils.encode_range({ s: { r: minR, c: minC }, e: { r: maxR, c: maxC } });
}
