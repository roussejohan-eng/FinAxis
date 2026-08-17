import * as XLSX from "xlsx";
import type { Project } from "@/lib/finance/types";
import { HYP_SHEET_NAME, buildEmptyHypSheet } from "./project-sheet-layout";
import { finalizeSheet, setLabel } from "./sheet-helpers";

/**
 * Projet d'exemple utilisé pour pré-remplir le modèle d'import : une ligne
 * illustrative par tableau, que l'utilisateur remplace ou complète.
 */
function exampleProject(): Project {
  return {
    id: "template",
    name: "",
    sector: "Services",
    legalStatus: "Micro-entreprise",
    startDate: new Date().toISOString().slice(0, 10),
    initialCash: 0,
    seasonality: "stable",
    revenueSources: [
      {
        id: "example",
        name: "Exemple : Prestation de service",
        unitPrice: 100,
        volumeM1: 5,
        volumeM12: 20,
        type: "recurrent",
      },
    ],
    fixedExpenses: [
      { id: "example", name: "Exemple : Loyer", monthlyAmount: 500, category: "Loyer" },
    ],
    variableExpenses: [
      {
        id: "example",
        name: "Exemple : Fournitures",
        mode: "percent",
        percentOfRevenue: 15,
        category: "Autre",
      },
    ],
    investments: [
      { id: "example", name: "Exemple : Matériel", amountHT: 3000, amortizationYears: 3 },
    ],
    financing: {
      personalContribution: 3000,
      honorLoan: 0,
      bankLoan: { amount: 0, annualRate: 0, months: 0 },
      subsidies: 0,
    },
    createdAt: "",
    updatedAt: "",
  };
}

function buildGuideSheet(): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const lines = [
    "FinAxis — Modèle d'import de projet",
    "",
    "Comment utiliser ce fichier",
    "1. Ouvrez l'onglet « Hyp ».",
    "2. Remplacez les lignes « Exemple : ... » par vos propres données (une ligne = une",
    "   source de revenus, une charge, un investissement).",
    "3. Pour ajouter d'autres lignes, écrivez simplement dans les lignes vides juste en",
    "   dessous — jusqu'à 10 sources de revenus, 20 charges fixes, 20 charges variables",
    "   et 10 investissements.",
    "4. Ne modifiez pas l'organisation des colonnes ni les intitulés en gras : ce sont",
    "   ces repères qui permettent au site de relire le fichier.",
    "5. Enregistrez le fichier, puis déposez-le sur la page de création de projet de",
    "   FinAxis (« Importer un projet Excel »).",
    "",
    "Précisions utiles",
    "  - Secteur d'activité : Services, Commerce, Restauration, Artisanat, Tech / SaaS,",
    "    Industrie ou Autre.",
    "  - Statut juridique : Micro-entreprise, EI, EURL, SASU, SAS, SARL ou Autre.",
    "  - Type de source de revenus : « recurrent » (abonnement, prestation régulière) ou",
    "    « ponctuel » (vente unique).",
    "  - Mode de charge variable : « percent » (pourcentage du chiffre d'affaires) ou",
    "    « unit » (montant unitaire × volume vendu).",
    "  - Catégorie de charge : Salaires, Loyer, Logiciels, Marketing, Assurances,",
    "    Comptabilité ou Autre.",
    "  - Volume M1 / M12 : quantité vendue au mois 1 et au mois 12 de votre première",
    "    année (la montée en charge est interpolée automatiquement entre les deux).",
    "",
    "Le total des ressources (apport, prêt d'honneur, emprunt, subventions) doit être égal",
    "au total des besoins (investissements) pour que le plan de financement soit équilibré",
    "— vous pourrez toujours l'ajuster une fois le fichier importé.",
  ];
  lines.forEach((line, i) => setLabel(ws, 0, i + 1, line));
  finalizeSheet(ws);
  return ws;
}

export function buildImportTemplateWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildGuideSheet(), "Guide");
  XLSX.utils.book_append_sheet(wb, buildEmptyHypSheet(exampleProject()), HYP_SHEET_NAME);
  return wb;
}

export function downloadImportTemplate() {
  const wb = buildImportTemplateWorkbook();
  XLSX.writeFile(wb, "finaxis-modele-import-projet.xlsx", { compression: true });
}
