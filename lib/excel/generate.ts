import * as XLSX from "xlsx";
import type { Project } from "@/lib/finance/types";
import type { ProjectResults } from "@/lib/finance";
import { setLabel, finalizeSheet } from "./sheet-helpers";
import { buildEmptyHypSheet } from "./project-sheet-layout";
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
  finalizeSheet(ws);
  return ws;
}

export function buildProjectWorkbook(project: Project, results: ProjectResults): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildGuideSheet(project), "Guide");
  XLSX.utils.book_append_sheet(wb, buildHypSheet(project), "Hyp");
  XLSX.utils.book_append_sheet(wb, buildRevenusSheet(project, results), "Revenus");
  XLSX.utils.book_append_sheet(wb, buildCompteResultatSheet(results), "CR");
  XLSX.utils.book_append_sheet(wb, buildFinancementSheet(project, results), "Financement");
  XLSX.utils.book_append_sheet(wb, buildTresorerieSheet(results), "Tresorerie");
  XLSX.utils.book_append_sheet(wb, buildSeuilSheet(results), "Seuil");
  XLSX.utils.book_append_sheet(wb, buildKpiSheet(results), "KPIs");
  XLSX.utils.book_append_sheet(wb, buildSuiviSheet(results), "Suivi");
  XLSX.utils.book_append_sheet(wb, buildSyntheseSheet(project, results), "Synthese");
  return wb;
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

export function downloadProjectExcel(project: Project, results: ProjectResults) {
  const wb = buildProjectWorkbook(project, results);
  const filename = `finaxis-${slugify(project.name)}-dossier-financier.xlsx`;
  XLSX.writeFile(wb, filename, { compression: true });
}
