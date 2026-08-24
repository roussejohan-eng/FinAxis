import { Rocket, ShieldCheck } from "lucide-react";
import { FadeIn } from "@/components/fade-in";

export function HybridApproach() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-navy-700 sm:text-4xl">
            L&apos;outil, plus{" "}
            <span className="font-serif italic font-medium text-turquoise-600">l&apos;expert</span> quand
            vous en avez besoin.
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <FadeIn>
            <div className="h-full rounded-lg border border-border p-8 transition-all hover:-translate-y-1 hover:border-turquoise-200 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-turquoise-50">
                <Rocket className="h-6 w-6 text-turquoise-600" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-navy-700">Autonomie guidée</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Un parcours pas à pas vous accompagne dans la saisie de vos hypothèses, avec des
                explications à chaque étape. Vous gardez la main sur vos chiffres, sans dépendre
                d&apos;un rendez-vous pour avancer.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="h-full rounded-lg border border-border p-8 transition-all hover:-translate-y-1 hover:border-turquoise-200 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-turquoise-50">
                <ShieldCheck className="h-6 w-6 text-turquoise-600" aria-hidden />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-navy-700">
                Attestation de cohérence par expert-comptable partenaire
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Quand vous êtes prêt à présenter votre dossier, un expert-comptable partenaire peut
                relire vos hypothèses et délivrer une attestation de cohérence, sous sa propre
                responsabilité professionnelle.
              </p>
            </div>
          </FadeIn>
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
          L&apos;attestation de cohérence est délivrée par un expert-comptable partenaire inscrit à
          l&apos;Ordre, sous sa responsabilité et sa lettre de mission. FinAxis ne fournit pas de
          services d&apos;expertise comptable.
        </p>
      </div>
    </section>
  );
}
