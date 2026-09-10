"use client";

import { Scale, Target, TrendingUp, Wallet } from "lucide-react";
import { useDraftResults } from "@/lib/wizard/use-draft-results";
import { Sparkline } from "@/components/dashboard/sparkline";
import { formatEUR } from "@/lib/finance/format";
import { cn } from "@/lib/utils";

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2" aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-turquoise-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-turquoise-500" />
    </span>
  );
}

/**
 * Aperçu chiffré du dossier, recalculé à chaque frappe à partir du même
 * moteur que le tableau de bord final (voir useDraftResults). Donne à
 * l'utilisateur un retour immédiat et précis pendant la saisie, plutôt
 * qu'une simple confirmation de champ rempli.
 *
 * `compact` : bandeau horizontal collant en haut de l'étape sur mobile.
 * Par défaut : panneau vertical complet pour la colonne latérale desktop.
 */
export function WizardLivePreview({ compact = false }: { compact?: boolean }) {
  const results = useDraftResults();
  const year1 = results.incomeStatement.years[0];
  const breakEven = results.breakEven.years[0];
  const endOfYearCash = results.cashFlow.endOfYearCash;

  const stats = [
    {
      icon: TrendingUp,
      label: "CA Année 1",
      value: formatEUR(year1.revenue),
      tone: "neutral" as const,
    },
    {
      icon: Scale,
      label: "Résultat net",
      value: formatEUR(year1.netResult),
      tone: year1.netResult >= 0 ? ("pos" as const) : ("neg" as const),
    },
    {
      icon: Wallet,
      label: "Trésorerie fin d'année",
      value: formatEUR(endOfYearCash),
      tone: endOfYearCash >= 0 ? ("pos" as const) : ("neg" as const),
    },
  ];

  if (compact) {
    return (
      <div className="relative rounded-lg border border-border bg-white/90 backdrop-blur">
        <div
          className="flex items-center gap-5 overflow-x-auto px-4 py-3"
          aria-label="Aperçu chiffré du dossier en cours de saisie"
        >
          <div className="flex shrink-0 items-center gap-1.5">
            <LiveDot />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-turquoise-700">Live</span>
          </div>
          {stats.map((s) => (
            <div key={s.label} className="flex shrink-0 items-center gap-2">
              <s.icon className="h-4 w-4 text-turquoise-600" aria-hidden />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    s.tone === "neg" ? "text-destructive" : "text-navy-700"
                  )}
                >
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* Signale que la barre se scrolle horizontalement (le dernier
            indicateur est souvent tronqué sur petit écran). */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 rounded-r-lg bg-gradient-to-l from-white/95 to-transparent"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm" aria-label="Aperçu chiffré du dossier en cours de saisie">
      <div className="flex items-center gap-2">
        <LiveDot />
        <p className="text-xs font-semibold uppercase tracking-wide text-turquoise-700">
          Aperçu en temps réel
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <s.icon className="h-4 w-4 shrink-0 text-turquoise-500" aria-hidden />
              {s.label}
            </div>
            <p
              className={cn(
                "shrink-0 text-base font-semibold tabular-nums",
                s.tone === "neg" ? "text-destructive" : "text-navy-700"
              )}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">Chiffre d&apos;affaires mensuel (année 1)</p>
        <div className="mt-2">
          <Sparkline data={results.revenue.totalMonthlyYear1} height={44} />
        </div>
      </div>

      <div className="mt-5 rounded-md bg-muted p-3 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-navy-700">
          <Target className="h-3.5 w-3.5 text-turquoise-600" aria-hidden />
          Seuil de rentabilité
        </div>
        <p className="mt-1 leading-relaxed text-muted-foreground">
          {breakEven.breakEvenRevenue > 0
            ? `${formatEUR(breakEven.breakEvenRevenue)} de CA nécessaires${
                breakEven.reached ? " — déjà atteint sur l'année 1" : ` (${breakEven.breakEvenDays} j)`
              }.`
            : "Ajoutez vos charges fixes pour calculer le seuil de rentabilité."}
        </p>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Recalculé à chaque saisie, avec le même moteur que votre tableau de bord final.
      </p>
    </div>
  );
}
