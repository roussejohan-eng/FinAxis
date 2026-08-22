import * as XLSX from "xlsx";
import type { Project } from "@/lib/finance/types";
import { computeProjectResults } from "@/lib/finance";
import { HYP_SHEET_NAME, buildEmptyHypSheet, hypStylePlanRegions } from "./project-sheet-layout";
import { finalizeSheet, setLabel } from "./sheet-helpers";
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
import { SECTOR_TEMPLATES, type SectorTemplateId, type SectorTemplateMeta } from "./sector-templates-meta";
import { polishWorkbook, type SheetStylePlan, type StyleRegion } from "./xlsx-polish";

// -- Modèles de départ par grande famille de secteur ---------------------
// Trois modèles plutôt qu'un par secteur exact (7 secteurs au wizard) :
// chacun couvre plusieurs secteurs proches dont la structure économique se
// ressemble (nature des revenus, poids des charges, niveau d'investissement),
// ce qui les rend plus riches à approfondir que 7-8 variantes superficielles.
// Les trois partagent exactement le même gabarit de feuille « Hyp » que
// l'export et l'import (project-sheet-layout.ts) : le site les relit avec
// le même parseur, sans aucun cas particulier.
// (Métadonnées dans ./sector-templates-meta, importable sans `xlsx`.)
export { SECTOR_TEMPLATES, type SectorTemplateId, type SectorTemplateMeta } from "./sector-templates-meta";

function exampleBase(overrides: Partial<Project>): Project {
  return {
    id: "template",
    name: "",
    sector: "Services",
    legalStatus: "Micro-entreprise",
    startDate: new Date().toISOString().slice(0, 10),
    initialCash: 0,
    seasonality: "stable",
    revenueSources: [],
    fixedExpenses: [],
    variableExpenses: [],
    investments: [],
    financing: {
      personalContribution: 0,
      honorLoan: 0,
      bankLoan: { amount: 0, annualRate: 0, months: 0 },
      subsidies: 0,
    },
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

// Les trois jeux d'exemple ci-dessous sont volontairement réalistes et
// équilibrés (besoins = ressources au centime près, l'emprunt bancaire
// étant la variable d'ajustement, comme le veut la pratique) : le modèle
// s'ouvre déjà « propre », sans avertissement de déséquilibre, pour donner
// une première impression professionnelle avant même toute modification.
function servicesExample(): Project {
  return exampleBase({
    sector: "Services",
    legalStatus: "EURL",
    seasonality: "b2b-saas",
    initialCash: 3000,
    revenueSources: [
      {
        id: "example-1",
        name: "Accompagnement mensuel (abonnement)",
        unitPrice: 450,
        volumeM1: 2,
        volumeM12: 9,
        type: "recurrent",
      },
      {
        id: "example-2",
        name: "Mission de conseil ponctuelle",
        unitPrice: 1800,
        volumeM1: 1,
        volumeM12: 3,
        type: "ponctuel",
      },
    ],
    fixedExpenses: [
      { id: "example-1", name: "Rémunération de la gérante", monthlyAmount: 1200, category: "Salaires" },
      { id: "example-2", name: "Loyer bureau partagé", monthlyAmount: 300, category: "Loyer" },
      { id: "example-3", name: "Abonnements logiciels", monthlyAmount: 120, category: "Logiciels" },
      { id: "example-4", name: "Marketing & prospection", monthlyAmount: 200, category: "Marketing" },
      { id: "example-5", name: "Comptabilité", monthlyAmount: 150, category: "Comptabilité" },
      { id: "example-6", name: "Assurance RC Pro", monthlyAmount: 60, category: "Assurances" },
    ],
    variableExpenses: [
      { id: "example-1", name: "Commission paiement en ligne", mode: "percent", percentOfRevenue: 2, category: "Autre" },
      { id: "example-2", name: "Sous-traitance ponctuelle", mode: "percent", percentOfRevenue: 3, category: "Autre" },
    ],
    investments: [
      { id: "example-1", name: "Ordinateur & équipement bureau", amountHT: 2500, amortizationYears: 3 },
      { id: "example-2", name: "Site web & identité de marque", amountHT: 1500, amortizationYears: 2 },
    ],
    financing: {
      personalContribution: 2000,
      honorLoan: 1000,
      bankLoan: { amount: 1000, annualRate: 4, months: 48 },
      subsidies: 0,
    },
  });
}

function commerceExample(): Project {
  return exampleBase({
    sector: "Commerce",
    legalStatus: "SASU",
    seasonality: "ete",
    initialCash: 6000,
    revenueSources: [
      {
        id: "example-1",
        name: "Ventes en boutique (panier moyen)",
        unitPrice: 28,
        volumeM1: 200,
        volumeM12: 480,
        type: "recurrent",
      },
      {
        id: "example-2",
        name: "Commandes spéciales & événements",
        unitPrice: 350,
        volumeM1: 1,
        volumeM12: 4,
        type: "ponctuel",
      },
    ],
    fixedExpenses: [
      { id: "example-1", name: "Rémunération du dirigeant", monthlyAmount: 1500, category: "Salaires" },
      { id: "example-2", name: "Loyer commercial", monthlyAmount: 1400, category: "Loyer" },
      { id: "example-3", name: "Salaire employé(e) polyvalent(e)", monthlyAmount: 1800, category: "Salaires" },
      { id: "example-4", name: "Marketing local & réseaux sociaux", monthlyAmount: 150, category: "Marketing" },
      { id: "example-5", name: "Comptabilité", monthlyAmount: 180, category: "Comptabilité" },
      { id: "example-6", name: "Assurance commerciale", monthlyAmount: 90, category: "Assurances" },
    ],
    variableExpenses: [
      { id: "example-1", name: "Achat marchandises / matières premières", mode: "unit", unitCost: 9, category: "Autre" },
      { id: "example-2", name: "Commission carte bancaire", mode: "percent", percentOfRevenue: 1.2, category: "Autre" },
    ],
    investments: [
      { id: "example-1", name: "Agencement & matériel de vente", amountHT: 12000, amortizationYears: 5 },
      { id: "example-2", name: "Caisse enregistreuse & TPE", amountHT: 1200, amortizationYears: 3 },
    ],
    financing: {
      personalContribution: 5000,
      honorLoan: 3000,
      bankLoan: { amount: 5200, annualRate: 4, months: 60 },
      subsidies: 0,
    },
  });
}

function artisanatExample(): Project {
  return exampleBase({
    sector: "Artisanat",
    legalStatus: "SARL",
    seasonality: "hiver",
    initialCash: 5000,
    revenueSources: [
      {
        id: "example-1",
        name: "Fabrication sur mesure (commandes)",
        unitPrice: 650,
        volumeM1: 3,
        volumeM12: 11,
        type: "ponctuel",
      },
      {
        id: "example-2",
        name: "Petites pièces & réparations",
        unitPrice: 85,
        volumeM1: 8,
        volumeM12: 24,
        type: "recurrent",
      },
    ],
    fixedExpenses: [
      { id: "example-1", name: "Rémunération du gérant", monthlyAmount: 1100, category: "Salaires" },
      { id: "example-2", name: "Loyer atelier", monthlyAmount: 650, category: "Loyer" },
      { id: "example-3", name: "Salaire apprenti / compagnon", monthlyAmount: 1500, category: "Salaires" },
      { id: "example-4", name: "Assurance atelier & matériel", monthlyAmount: 110, category: "Assurances" },
      { id: "example-5", name: "Comptabilité", monthlyAmount: 160, category: "Comptabilité" },
      { id: "example-6", name: "Marketing (salons, site vitrine)", monthlyAmount: 90, category: "Marketing" },
    ],
    variableExpenses: [
      { id: "example-1", name: "Matières premières (bois, métal...)", mode: "unit", unitCost: 40, category: "Autre" },
      { id: "example-2", name: "Consommables atelier", mode: "percent", percentOfRevenue: 3, category: "Autre" },
    ],
    investments: [
      { id: "example-1", name: "Machine-outil / équipement atelier", amountHT: 14000, amortizationYears: 7 },
      { id: "example-2", name: "Outillage complémentaire", amountHT: 2500, amortizationYears: 4 },
    ],
    financing: {
      personalContribution: 5000,
      honorLoan: 5000,
      bankLoan: { amount: 4500, annualRate: 4, months: 60 },
      subsidies: 2000,
    },
  });
}

function exampleProjectFor(id: SectorTemplateId): Project {
  if (id === "commerce") return commerceExample();
  if (id === "artisanat") return artisanatExample();
  return servicesExample();
}

const TAB_DESCRIPTIONS: [string, string][] = [
  ["Hyp", "toutes vos hypothèses (projet, revenus, charges, investissements, financement) — le seul onglet à modifier."],
  ["Revenus", "chiffre d'affaires mensuel Année 1 (montée en charge) et projections Années 2 et 3."],
  ["CR", "compte de résultat complet sur 3 ans (produits, charges, résultat net)."],
  ["Financement", "besoins, ressources et tableau d'amortissement complet de l'emprunt bancaire (60 échéances)."],
  ["Tresorerie", "budget de trésorerie mensuel Année 1 (encaissements, décaissements, TVA nette, solde cumulé)."],
  ["Seuil", "seuil de chiffre d'affaires, point mort et équivalent MRR, par année."],
  ["Suivi", "à compléter mois par mois une fois l'activité démarrée — les écarts se calculent automatiquement."],
  ["KPIs", "synthèse chiffrée des indicateurs clés."],
  ["Synthese", "chiffres clés et tableaux prêts à sélectionner pour insérer un graphique."],
];

function buildTemplateCoverSheet(meta: SectorTemplateMeta): { ws: XLSX.WorkSheet; regions: StyleRegion[] } {
  const ws: XLSX.WorkSheet = {};
  let row = 1;
  const sectionRows: number[] = [];
  const line = (text: string) => setLabel(ws, 0, row++, text);
  const sectionTitle = (text: string) => {
    sectionRows.push(row);
    line(text);
  };
  const blank = () => {
    row++;
  };

  line("FINAXIS — MODÈLE DE PRÉVISIONNEL FINANCIER");
  line(`Secteur : ${meta.label} (${meta.coversText}) — ${meta.description}`);
  blank();
  sectionTitle("COMMENT UTILISER CE FICHIER");
  line("1. Ouvrez l'onglet « Hyp » : remplacez les lignes d'exemple par vos propres chiffres");
  line("   (une ligne = une source de revenus, une charge, un investissement).");
  line("2. N'oubliez pas de renseigner le nom de votre projet (onglet Hyp, cellule B3).");
  line("3. Tous les autres onglets se recalculent automatiquement à partir de vos hypothèses");
  line("   — ne les modifiez pas directement, ce sont des formules.");
  line("4. Pour ajouter des lignes, écrivez dans les lignes vides juste en dessous des exemples");
  line("   — jusqu'à 10 sources de revenus, 20 charges fixes, 20 charges variables et 10");
  line("   investissements.");
  line("5. Ne modifiez pas l'organisation des colonnes ni les intitulés en gras de l'onglet");
  line("   « Hyp » : ce sont ces repères qui permettent au site FinAxis de relire le fichier.");
  line("6. Une fois complété, déposez ce fichier sur la page de création de projet de FinAxis");
  line("   (« Importer un projet existant »).");
  blank();
  sectionTitle("CONTENU DU CLASSEUR");
  TAB_DESCRIPTIONS.forEach(([name, desc], i) => line(`${i + 1}. ${name} — ${desc}`));
  blank();
  sectionTitle("CODE COULEUR (convention — à appliquer via la mise en forme de votre tableur si non visible)");
  line("  - Cellule d'entrée : à modifier (onglet Hyp, et les lignes « Réel (à saisir) » de Suivi)");
  line("  - Cellule de calcul : ne pas modifier (formule automatique, tous les autres onglets)");
  line("  - Cellule de résultat final : synthèse (KPIs, Synthese)");
  blank();
  sectionTitle("ATTENTION");
  line("Les hypothèses de volumes, prix et charges de ce modèle sont des exemples réalistes");
  line("destinés à faire tourner le classeur. Remplacez-les par vos propres chiffres — si besoin");
  line("validés avec votre expert-comptable, un incubateur ou votre banquier — avant toute");
  line("présentation officielle.");
  blank();
  sectionTitle("ACCÈS RAPIDE AUX ONGLETS");
  for (const [name] of TAB_DESCRIPTIONS) {
    const address = `A${row}`;
    setLabel(ws, 0, row, `→ ${name}`);
    XLSX.utils.cell_set_internal_link(ws[address], `${name}!A1`);
    row++;
  }

  ws["!cols"] = [{ wch: 90 }];
  finalizeSheet(ws);

  const regions: StyleRegion[] = [
    { kind: "title", ref: "A1:A1" },
    ...sectionRows.map((r): StyleRegion => ({ kind: "sectionLabel", ref: `A${r}` })),
  ];
  return { ws, regions };
}

/** Exporté pour les tests : construit le classeur brut et son plan de mise en forme séparément, sans passer par le téléchargement navigateur. */
export function buildWorkbookAndPlans(id: SectorTemplateId): { wb: XLSX.WorkBook; plans: SheetStylePlan[] } {
  const meta = SECTOR_TEMPLATES.find((t) => t.id === id) ?? SECTOR_TEMPLATES[0];
  const project = exampleProjectFor(meta.id);
  // Mêmes formules ET mêmes valeurs déjà calculées que le dossier final
  // (lib/finance, la source de vérité du tableau de bord) : le modèle
  // affiche déjà les bons chiffres à l'ouverture, pas seulement une fois
  // recalculé par le tableur.
  const results = computeProjectResults(project);

  const wb = XLSX.utils.book_new();
  const plans: SheetStylePlan[] = [];

  const cover = buildTemplateCoverSheet(meta);
  XLSX.utils.book_append_sheet(wb, cover.ws, "Guide");
  plans.push({ sheetName: "Guide", regions: cover.regions });

  XLSX.utils.book_append_sheet(wb, buildEmptyHypSheet(project), HYP_SHEET_NAME);
  plans.push({ sheetName: HYP_SHEET_NAME, regions: hypStylePlanRegions() });

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

  const suivi = buildSuiviSheet(results);
  XLSX.utils.book_append_sheet(wb, suivi.ws, "Suivi");
  plans.push({ sheetName: "Suivi", regions: suivi.regions });

  const kpis = buildKpiSheet(results);
  XLSX.utils.book_append_sheet(wb, kpis.ws, "KPIs");
  plans.push({ sheetName: "KPIs", regions: kpis.regions });

  const synthese = buildSyntheseSheet(project, results);
  XLSX.utils.book_append_sheet(wb, synthese.ws, "Synthese");
  plans.push({ sheetName: "Synthese", regions: synthese.regions });

  return { wb, plans };
}

/** Classeur brut (sans mise en forme) — utilisé par les tests qui inspectent les cellules directement. */
export function buildSectorTemplateWorkbook(id: SectorTemplateId): XLSX.WorkBook {
  return buildWorkbookAndPlans(id).wb;
}

const FILE_SUFFIX: Record<SectorTemplateId, string> = {
  services: "services-conseil",
  commerce: "commerce-restauration",
  artisanat: "artisanat-production",
};

export async function downloadSectorTemplate(id: SectorTemplateId) {
  const { wb, plans } = buildWorkbookAndPlans(id);
  const rawBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  const polished = await polishWorkbook(new Uint8Array(rawBuffer), plans);
  const filename = `finaxis-modele-${FILE_SUFFIX[id]}.xlsx`;
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
