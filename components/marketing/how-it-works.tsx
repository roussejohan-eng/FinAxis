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
            Un parcours guidé, un dossier bancaire prêt à présenter.
          </h2>
        </FadeIn>

        <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div
            className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block"
            aria-hidden
          />
          {STEPS.map((step, i) => (
            <FadeIn key={step.number} delay={i * 0.08}>
              <div className="relative">
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-turquoise-500 bg-white text-sm font-semibold text-turquoise-600">
                  {step.number}
                </div>
                <h3 className="mt-5 text-base font-semibold text-navy-700">{step.title}</h3>
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
