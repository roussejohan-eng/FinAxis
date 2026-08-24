import { ArrowUpRight } from "lucide-react";
import { FadeIn } from "@/components/fade-in";

const STEPS = [
  {
    number: "01",
    title: "Vous décrivez votre projet",
    description: "Secteur, statut juridique, date de démarrage et saisonnalité.",
  },
  {
    number: "02",
    title: "Vous saisissez vos hypothèses",
    description: "Revenus, charges, investissements et financement.",
  },
  {
    number: "03",
    title: "FinAxis calcule tous vos états financiers",
    description: "Compte de résultat, trésorerie, TVA, plan de financement.",
  },
  {
    number: "04",
    title: "Vous exportez ou faites valider par un expert",
    description: "PDF et Excel prêts à présenter, attestation en option.",
  },
];

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="bg-white py-20 sm:py-28">
      <div className="container">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold text-navy-700 sm:text-4xl">
            Un parcours guidé, un dossier bancaire{" "}
            <span className="font-serif italic font-medium text-turquoise-600">prêt à présenter</span>.
          </h2>
        </FadeIn>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <FadeIn key={step.number} delay={i * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-lg border border-border bg-white p-6 transition-all hover:-translate-y-1 hover:border-navy-700 hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-semibold tracking-wide text-turquoise-600">
                    {step.number}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-navy-300 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-5 text-base font-semibold leading-snug text-navy-700">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
