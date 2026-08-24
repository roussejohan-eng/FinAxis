import { AlertCircle, FileSpreadsheet, Wallet } from "lucide-react";
import { FadeIn } from "@/components/fade-in";

const ITEMS = [
  {
    icon: FileSpreadsheet,
    title: "Les tableurs manquent de crédibilité",
    description:
      "Un fichier Excel personnel ne suit pas les codes attendus par un chargé d'affaires bancaire.",
  },
  {
    icon: Wallet,
    title: "Les experts-comptables coûtent cher au démarrage",
    description:
      "Un accompagnement complet représente un budget difficile à mobiliser avant la création.",
  },
  {
    icon: AlertCircle,
    title: "Les outils actuels génèrent des documents sans les expliquer",
    description:
      "Des chiffres sortent d'un algorithme, mais personne n'explique comment les défendre en rendez-vous.",
  },
];

export function Problem() {
  return (
    <section className="bg-muted py-20 sm:py-28">
      <div className="container">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-navy-700 sm:text-4xl">
            45 % des créateurs se lancent{" "}
            <span className="font-serif italic font-medium text-turquoise-600">sans accompagnement</span>{" "}
            financier.
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {ITEMS.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.08}>
              <div className="h-full rounded-lg border border-transparent bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-navy-100 hover:shadow-md sm:text-left">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-navy-50 sm:mx-0">
                  <item.icon className="h-6 w-6 text-turquoise-500" aria-hidden />
                </div>
                <h3 className="mt-5 text-base font-semibold text-navy-700">{item.title}</h3>
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
