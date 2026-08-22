import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { polishWorkbook } from "./xlsx-polish";
import { EUR_FORMAT, PCT_FORMAT, finalizeSheet, setFormula, setLabel, setValue } from "./sheet-helpers";

function sampleWorkbook() {
  const ws: XLSX.WorkSheet = {};
  setLabel(ws, 0, 1, "FinAxis — Test");
  setLabel(ws, 1, 3, "Année 1");
  setLabel(ws, 0, 4, "Produits d'exploitation");
  setValue(ws, 1, 4, 18517, EUR_FORMAT);
  setLabel(ws, 0, 5, "Taux");
  setValue(ws, 1, 5, 0.927, PCT_FORMAT);
  setLabel(ws, 0, 12, "Résultat net");
  setFormula(ws, 1, 12, "B4-B5", 7720, EUR_FORMAT);
  ws["!ref"] = "A1:B12";
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
  finalizeSheet(ws);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Test");
  return wb;
}

describe("polishWorkbook", () => {
  it("hides gridlines, bands the title, styles the header/total, and survives a real re-read", async () => {
    const wb = sampleWorkbook();
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" }) as Uint8Array;

    const polished = await polishWorkbook(buffer, [
      {
        sheetName: "Test",
        regions: [
          { kind: "title", ref: "A1:B1" },
          { kind: "header", ref: "A3:B3" },
          { kind: "total", cells: [{ ref: "A12" }, { ref: "B12", format: "eur" }] },
          // C4 n'existe pas du tout dans le XML d'origine : vérifie l'insertion d'une cellule vide.
          { kind: "input", cells: [{ ref: "C4" }] },
          // La ligne 7 entière n'a aucune cellule : vérifie l'insertion d'une ligne <row> complète.
          { kind: "input", cells: [{ ref: "B7" }] },
        ],
      },
    ]);

    // Le classeur doit rester lisible et garder ses valeurs/formules intactes.
    const reread = XLSX.read(polished, { type: "array" });
    const sheet = reread.Sheets["Test"];
    expect(sheet["B4"].v).toBe(18517);
    expect(sheet["B12"].v).toBe(7720);
    expect(sheet["B12"].f).toBe("B4-B5");
    // SheetJS ne restitue pas une cellule vide sans valeur/formule dans l'objet
    // relu (même stylée) : la preuve de l'insertion se fait sur le XML brut.

    // Vérifie directement le XML brut pour les propriétés que SheetJS n'expose pas en lecture.
    const zip = await (await import("jszip")).default.loadAsync(polished);
    const sheetXml = await zip.file("xl/worksheets/sheet1.xml")!.async("string");
    expect(sheetXml).toContain('showGridLines="0"');
    expect(sheetXml).toMatch(/<c r="A1"[^>]* s="\d+"/);
    expect(sheetXml).toMatch(/<c r="A3"[^>]* s="\d+"/);
    expect(sheetXml).toMatch(/<c r="A12"[^>]* s="\d+"/);
    expect(sheetXml).toMatch(/<c r="C4" s="\d+"\/>/);
    // Ligne 7 entièrement absente du XML d'origine : une ligne <row> complète
    // doit avoir été insérée, dans le bon ordre (entre la ligne 5 et la ligne 12).
    expect(sheetXml).toMatch(/<row r="7"[^>]*><c r="B7" s="\d+"\/><\/row>/);
    expect(sheetXml.indexOf('<row r="5"')).toBeLessThan(sheetXml.indexOf('<row r="7"'));
    expect(sheetXml.indexOf('<row r="7"')).toBeLessThan(sheetXml.indexOf('<row r="12"'));

    const stylesXml = await zip.file("xl/styles.xml")!.async("string");
    expect(stylesXml).toContain(NAVY_FILL_SNIPPET);
    expect(stylesXml).toContain(INPUT_FILL_SNIPPET);
  });
});

const NAVY_FILL_SNIPPET = 'fgColor rgb="FF0F2A44"';
const INPUT_FILL_SNIPPET = 'fgColor rgb="FFEAFBFC"';
