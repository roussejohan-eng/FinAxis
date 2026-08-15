export interface PricingPlan {
  id: string;
  name: string;
  priceLabel: string;
  priceSubLabel?: string;
  audience: string;
  features: string[];
  featuresIntro?: string;
  cta: string;
  href: string;
  highlighted?: boolean;
  badge?: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "decouverte",
    name: "Découverte",
    priceLabel: "0 € / mois",
    audience: "Vous voulez tester avant de vous engager",
    features: [
      "Prévisionnel Année 1 uniquement",
      "1 projet actif",
      "Export PDF avec filigrane FinAxis",
      "Support par email sous 48h",
    ],
    cta: "Commencer gratuitement",
    href: "/wizard/nouveau-projet",
  },
  {
    id: "standard",
    name: "Standard",
    priceLabel: "14,99 € HT / mois",
    priceSubLabel: "soit 17,99 € TTC",
    audience: "Créateurs solo et petites structures",
    features: [
      "Prévisionnel complet sur 3 ans",
      "Projets illimités",
      "Exports PDF et Excel sans filigrane",
      "Tableau de bord complet",
      "Support email sous 24h",
    ],
    cta: "Choisir Standard",
    href: "/wizard/nouveau-projet",
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "39,99 € HT / mois",
    priceSubLabel: "soit 47,99 € TTC",
    audience: "TPE en croissance et porteurs de projet exigeants",
    featuresIntro: "Tout Standard, plus :",
    features: [
      "Jusqu'à 3 utilisateurs",
      "Pilotage prévu vs réalisé mensuel",
      "Alertes de trésorerie automatiques",
      "Mise à jour continue du dossier bancaire",
      "Support prioritaire par chat sous 4h",
    ],
    cta: "Essayer Pro",
    href: "/wizard/nouveau-projet",
    highlighted: true,
    badge: "Le plus populaire",
  },
  {
    id: "expert",
    name: "Expert",
    priceLabel: "Sur devis",
    priceSubLabel: "À partir de 89 € HT / mois",
    audience: "Vous voulez la validation par un expert-comptable partenaire",
    featuresIntro: "Tout Pro, plus :",
    features: [
      "Revue par un expert-comptable partenaire (1 séance par trimestre incluse)",
      "Attestation de cohérence par un expert-comptable inscrit à l'Ordre (facturée en direct par le cabinet, à partir de 149 € par dossier)",
      "Accompagnement personnalisé au montage du dossier bancaire",
    ],
    cta: "Contacter un conseiller",
    href: "/wizard/nouveau-projet",
  },
];

export const B2B_PLAN = {
  title: "Vous êtes un incubateur, une CCI ou une structure d'accompagnement ?",
  description:
    "Notre licence B2B2C vous donne accès à un tableau de bord de suivi multi-porteurs, une marque blanche personnalisable et un format d'export standardisé pour vos banques partenaires.",
  priceLabel: "À partir de 300 € HT / mois par structure",
  bullets: [
    "Jusqu'à 15 porteurs actifs simultanés",
    "Onboarding et formation inclus",
    "Contrat annuel avec engagement 6 mois",
  ],
  cta: "Planifier une démo",
  href: "/contact-b2b",
};

export const PRICING_DISCLAIMER =
  "Prix hors taxes · TVA 20 % applicable · Résiliable à tout moment · Les honoraires de l'expert-comptable sont facturés en direct par le cabinet partenaire, hors abonnement FinAxis.";
