import * as XLSX from "xlsx";
import type { Project } from "@/lib/finance/types";
import type { ProjectResults } from "@/lib/finance";
import { setLabel, finalizeSheet } from "./sheet-helpers";
import { buildEmptyHypSheet, hypStylePlanRegions } from "./project-sheet-layout";
import {
  buildCompteResultatSheet,
  buildFinancementSheet,
  buildKpiSheet,
  buildRevenusSheet,
  buildSeuilSheet,
  buildSuiviSheet,
  buildSyntheseSheet,
  buildTresorerieSheet,
} from "./analytical-sheets";
import { polishWorkbook, type SheetStylePlan } from "./xlsx-polish";

function buildHypSheet(project: Project): XLSX.WorkSheet {
  return buildEmptyHypSheet(project);
}

function buildGuideSheet(project: Project): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const lines: string[] = [
    "FinAxis — Dossier financier prévisionnel",
    `Projet : ${project.name || "Projet sans nom"}`,
    "",
    "Mode d'emploi",
    "Ce classeur contient des formules Excel réelles : modifiez les hypothèses",
    "de l'onglet « Hypothèses » et les autres onglets se recalculent automatiquement.",
    "",
    "Code couleur (convention, à appliquer via la mise en forme conditionnelle de votre tableur si non visible) :",
    "  - Bleu : cellule d'entrée (à modifier)",
    "  - Noir : cellule de calcul (formule)",
    "  - Vert : cellule de résultat final",
    "",
    "Onglets",
    "  1. Guide — ce mode d'emploi",
    "  2. Hyp — toutes les entrées du wizard (projet, revenus, charges, investissements, financement)",
    "  3. Revenus — chiffre d'affaires mensuel Année 1 et projections Années 2 et 3",
    "  4. CR (Compte de résultat) — compte de résultat sur 3 ans",
    "  5. Financement — besoins / ressources et tableau d'amortissement de l'emprunt",
    "  6. Tresorerie — budget de trésorerie mensuel Année 1",
    "  7. Seuil (de rentabilité) — seuil et point mort par année",
    "  8. Suivi (réel vs budget) — à compléter mois par mois une fois l'activité démarrée",
    "  9. KPIs — synthèse chiffrée",
    "  10. Synthese — chiffres clés et tableaux prêts à transformer en graphique",
    "",
    "Limites connues",
    "  - Les dotations aux amortissements s'arrêtent à la durée saisie, comme dans le tableau de bord.",
    "  - Le tableau d'amortissement de l'emprunt est généré sur 60 périodes ; au-delà, complétez",
    "    manuellement le modèle si votre emprunt est plus long.",
    "",
    "Ce document est un prévisionnel construit à partir de vos hypothèses. Il n'a pas valeur",
    "d'attestation comptable. Généré avec FinAxis.",
  ];
  lines.forEach((line, i) => setLabel(ws, 0, i + 1, line));
  ws["!cols"] = [{ wch: 90 }];
  finalizeSheet(ws);
  return ws;
}

/** Exporté pour les tests : construit le classeur brut et son plan de mise en forme séparément, sans passer par le téléchargement navigateur. */
export function buildWorkbookAndPlans(project: Project, results: ProjectResults): { wb: XLSX.WorkBook; plans: SheetStylePlan[] } {
  const wb = XLSX.utils.book_new();
  const plans: SheetStylePlan[] = [];

  XLSX.utils.book_append_sheet(wb, buildGuideSheet(project), "Guide");
  plans.push({ sheetName: "Guide", regions: [{ kind: "title", ref: "A1:A1" }] });

  XLSX.utils.book_append_sheet(wb, buildHypSheet(project), "Hyp");
  plans.push({ sheetName: "Hyp", regions: hypStylePlanRegions() });

  const revenus = buildRevenusSheet(project, results);
  XLSX.utils.book_append_sheet(wb, revenus.ws, "Revenus");
  plans.push({ sheetName: "Revenus", regions: revenus.regions });

  const cr = buildCompteResultatSheet(results);
  XLSX.utils.book_append_sheet(wb, cr.ws, "CR");
  plans.push({ sheetName: "CR", regions: cr.regions });

  const financement = buildFinancementSheet(project, results);
  XLSX.utils.book_append_sheet(wb, financement.ws, "Financement");
  plans.push({ sheetName: "Financement", regions: financement.regions });

  const tresorerie = buildTresorerieSheet(results);
  XLSX.utils.book_append_sheet(wb, tresorerie.ws, "Tresorerie");
  plans.push({ sheetName: "Tresorerie", regions: tresorerie.regions });

  const seuil = buildSeuilSheet(results);
  XLSX.utils.book_append_sheet(wb, seuil.ws, "Seuil");
  plans.push({ sheetName: "Seuil", regions: seuil.regions });

  const kpis = buildKpiSheet(results);
  XLSX.utils.book_append_sheet(wb, kpis.ws, "KPIs");
  plans.push({ sheetName: "KPIs", regions: kpis.regions });

  const suivi = buildSuiviSheet(results);
  XLSX.utils.book_append_sheet(wb, suivi.ws, "Suivi");
  plans.push({ sheetName: "Suivi", regions: suivi.regions });

  const synthese = buildSyntheseSheet(project, results);
  XLSX.utils.book_append_sheet(wb, synthese.ws, "Synthese");
  plans.push({ sheetName: "Synthese", regions: synthese.regions });

  return { wb, plans };
}

/** Classeur brut (sans mise en forme) — utilisé par les tests qui inspectent les cellules directement. */
export function buildProjectWorkbook(project: Project, results: ProjectResults): XLSX.WorkBook {
  return buildWorkbookAndPlans(project, results).wb;
}

function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .toLowerCase() || "projet"
  );
}

export async function downloadProjectExcel(project: Project, results: ProjectResults) {
  const { wb, plans } = buildWorkbookAndPlans(project, results);
  const rawBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  const polished = await polishWorkbook(new Uint8Array(rawBuffer), plans);
  const filename = `finaxis-${slugify(project.name)}-dossier-financier.xlsx`;
  const blob = new Blob([polished as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
