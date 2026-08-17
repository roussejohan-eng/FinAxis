import Link from "next/link";
import { Check, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardMockup } from "@/components/dashboard-mockup";
import { FadeIn } from "@/components/fade-in";

const PROOF_POINTS = [
  "Sans carte bancaire",
  "14 jours d'essai",
  "Attestation en option par expert-comptable partenaire",
];

export function Hero() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="container grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <FadeIn>
          <Badge className="mb-6">Plateforme française · Conforme RGPD</Badge>
          <h1 className="text-4xl font-semibold leading-tight text-navy-700 sm:text-5xl">
            Le dossier financier que les banques attendent.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            FinAxis génère votre prévisionnel, votre trésorerie et votre plan de financement en
            30 minutes — dans un format harmonisé, exportable et validable par un expert-comptable
            partenaire.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/wizard/nouveau-projet">Créer mon dossier</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/#comment-ca-marche">
                <PlayCircle className="h-4 w-4" aria-hidden />
                Voir une démo
              </Link>
            </Button>
          </div>

          <ul className="mt-8 flex flex-col flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground sm:flex-row sm:items-center">
            {PROOF_POINTS.map((point, i) => (
              <li key={point} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-turquoise-500" aria-hidden />
                <span>{point}</span>
                {i < PROOF_POINTS.length - 1 && (
                  <span className="hidden text-border sm:inline">·</span>
                )}
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="rounded-2xl shadow-sm">
            <DashboardMockup className="w-full" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
