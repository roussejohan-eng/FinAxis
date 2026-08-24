import Link from "next/link";
import { ArrowUpRight, FileOutput, LayoutDashboard, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/fade-in";
import { AmbientGlow } from "@/components/ambient-glow";

const BENEFITS = [
  {
    icon: LayoutDashboard,
    title: "Tableau de bord multi-porteurs",
    description: "Suivez l'avancement de tous vos porteurs de projet depuis un seul espace.",
  },
  {
    icon: Palette,
    title: "Charte et logo personnalisables",
    description: "Vos dossiers sortent avec votre identité, pas uniquement celle de FinAxis.",
  },
  {
    icon: FileOutput,
    title: "Export standardisé pour vos banques partenaires",
    description: "Un format homogène, reconnaissable par vos partenaires bancaires habituels.",
  },
];

export function Incubators() {
  return (
    <section id="incubateurs" className="relative overflow-hidden bg-navy-900 py-20 text-white sm:py-28">
      <AmbientGlow variant="dark" className="h-[560px]" />

      <div className="container">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <Badge variant="on-dark" className="mb-6">
            Nouveau · Programme partenaire
          </Badge>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Équipez vos{" "}
            <span className="font-serif italic font-medium text-turquoise-400">porteurs de projet</span>.
          </h2>
          <p className="mt-4 text-white/70">
            FinAxis propose une licence B2B2C pour les incubateurs, CCI, pépinières et réseaux
            d&apos;accompagnement. Vos chargés d&apos;accompagnement disposent d&apos;un tableau de
            bord de suivi de tous les porteurs, avec des dossiers standardisés à votre marque.
          </p>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {BENEFITS.map((benefit, i) => (
            <FadeIn key={benefit.title} delay={i * 0.08}>
              <div className="group h-full rounded-lg border border-white/10 bg-white/[0.03] p-6 text-center transition-all hover:-translate-y-1 hover:border-turquoise-400/40 hover:bg-white/[0.06] sm:text-left">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 sm:mx-0">
                  <benefit.icon className="h-6 w-6 text-turquoise-400" aria-hidden />
                </div>
                <h3 className="mt-5 flex items-center justify-center gap-1.5 text-base font-semibold sm:justify-start">
                  {benefit.title}
                  <ArrowUpRight
                    className="h-4 w-4 text-turquoise-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    aria-hidden
                  />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{benefit.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-14 flex justify-center">
          <Button size="lg" variant="accent" asChild>
            <Link href="/contact-b2b">Demander une démo B2B</Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
