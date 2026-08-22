// Métadonnées légères des 3 modèles Excel par secteur — séparées de
// sector-templates.ts (qui importe `xlsx` et construit les classeurs) pour
// pouvoir être importées statiquement par l'UI (le bouton de choix de
// modèle) sans alourdir le bundle client avec la bibliothèque xlsx : la
// génération du fichier reste chargée dynamiquement, seulement au clic.
export type SectorTemplateId = "services" | "commerce" | "artisanat";

export interface SectorTemplateMeta {
  id: SectorTemplateId;
  label: string;
  coversText: string;
  description: string;
}

export const SECTOR_TEMPLATES: SectorTemplateMeta[] = [
  {
    id: "services",
    label: "Services & Conseil",
    coversText: "Services, Tech / SaaS",
    description: "Prestations et abonnements — revenus récurrents, charges surtout fixes.",
  },
  {
    id: "commerce",
    label: "Commerce & Restauration",
    coversText: "Commerce, Restauration",
    description: "Vente au détail — volumes élevés, marge sur marchandises, saisonnalité.",
  },
  {
    id: "artisanat",
    label: "Artisanat & Production",
    coversText: "Artisanat, Industrie",
    description: "Fabrication ou prestation technique — investissement matériel, matières premières.",
  },
];
