import {
  BarChart3,
  Landmark,
  PieChart,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { FadeIn } from "@/components/fade-in";

const ITEMS = [
  {
    icon: TrendingUp,
    title: "Compte de résultat prévisionnel 3 ans",
    description: "Produits, charges, marges et résultat net, année par année.",
  },
  {
    icon: Landmark,
    title: "Plan de financement",
    description: "Besoins et ressources détaillés, avec tableau d'amortissement d'emprunt.",
  },
  {
    icon: Wallet,
    title: "Budget de trésorerie mensuel",
    description: "Encaissements, décaissements et solde cumulé, mois par mois.",
  },
  {
    icon: Receipt,
    title: "Budget de TVA",
    description: "TVA collectée, déductible et nette à reverser chaque mois.",
  },
  {
    icon: PieChart,
    title: "Seuil de rentabilité et point mort",
    description: "Le chiffre d'affaires à atteindre, et en combien de jours.",
  },
  {
    icon: BarChart3,
    title: "Tableau de bord de KPIs",
    description: "Les indicateurs clés de votre projet, visualisés en un coup d'œil.",
  },
];

export function WhatYouGet() {
  return (
    <section className="bg-muted py-20 sm:py-28">
      <div className="container">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-navy-700 sm:text-4xl">
            Tout ce qu&apos;un banquier demande, dans un seul document.
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.05}>
              <div className="h-full rounded-lg border border-border bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-turquoise-50">
                  <item.icon className="h-5 w-5 text-turquoise-600" aria-hidden />
                </div>
                <h3 className="mt-4 text-base font-semibold text-navy-700">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
