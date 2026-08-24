import Link from "next/link";
import { PlayCircle, ShieldCheck, Timer, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardMockup } from "@/components/dashboard-mockup";
import { FadeIn } from "@/components/fade-in";

const PROOF_POINTS = [
  { icon: Wallet, label: "Sans carte bancaire" },
  { icon: Timer, label: "14 jours d'essai" },
  { icon: ShieldCheck, label: "Attestation en option par expert-comptable partenaire" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Bandeau abstrait décoratif — pas de photo/rendu 3D, tout en SVG,
          pour un rendu premium et dynamique sans casser le fond blanc. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] overflow-hidden" aria-hidden>
        <svg
          className="absolute left-1/2 top-[-60px] h-[780px] w-[1600px] -translate-x-1/2 blur-3xl"
          viewBox="0 0 1600 780"
          fill="none"
        >
          <defs>
            <radialGradient id="hero-blob-navy" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0F2A44" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#0F2A44" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hero-blob-turquoise" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1FB6C1" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#1FB6C1" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="180" cy="220" rx="460" ry="300" fill="url(#hero-blob-navy)" />
          <ellipse cx="1320" cy="160" rx="440" ry="300" fill="url(#hero-blob-turquoise)" />
        </svg>
      </div>

      <div className="container grid items-center gap-12 pb-16 pt-20 lg:grid-cols-2 lg:pb-20 lg:pt-28">
        <FadeIn>
          <Badge className="mb-6">Plateforme française · Conforme RGPD</Badge>
          <h1 className="text-4xl font-semibold leading-[1.1] text-navy-700 sm:text-5xl">
            Le dossier financier que les banques{" "}
            <span className="font-serif italic font-medium text-turquoise-600">attendent</span>.
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
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="rounded-2xl shadow-sm">
            <DashboardMockup className="w-full" />
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={0.15}>
        <div className="border-t border-border bg-white">
          <div className="container flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
            {PROOF_POINTS.map((point) => (
              <div key={point.label} className="flex flex-1 items-center gap-3 py-5 sm:justify-center sm:px-6">
                <point.icon className="h-4 w-4 shrink-0 text-turquoise-500" aria-hidden />
                <span className="text-sm text-navy-700">{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
