"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { useWizardStore } from "@/store/wizard-store";
import { useProjectsStore } from "@/store/projects-store";
import { Button } from "@/components/ui/button";
import { formatDate, formatEUR } from "@/lib/finance/format";
import { SEASONALITY_LABELS } from "@/lib/finance/seasonality";

function RecapSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 transition-all hover:border-turquoise-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy-700">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-xs font-medium text-turquoise-600 hover:underline"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          Modifier
        </button>
      </div>
      <div className="mt-3 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export function Step5Recap({ onBack, onGoToStep }: { onBack: () => void; onGoToStep: (step: number) => void }) {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const toProject = useWizardStore((s) => s.toProject);
  const reset = useWizardStore((s) => s.reset);
  const saveProject = useProjectsStore((s) => s.saveProject);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    const project = toProject();
    saveProject(project);
    const id = project.id;
    reset();
    router.push(`/dashboard/${id}`);
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-4">
        <RecapSection title="Votre projet" onEdit={() => onGoToStep(0)}>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            <div className="flex justify-between sm:justify-start sm:gap-2">
              <dt className="font-medium text-navy-700">Nom :</dt>
              <dd>{draft.name || "—"}</dd>
            </div>
            <div className="flex justify-between sm:justify-start sm:gap-2">
              <dt className="font-medium text-navy-700">Secteur :</dt>
              <dd>{draft.sector}</dd>
            </div>
            <div className="flex justify-between sm:justify-start sm:gap-2">
              <dt className="font-medium text-navy-700">Statut :</dt>
              <dd>{draft.legalStatus}</dd>
            </div>
            <div className="flex justify-between sm:justify-start sm:gap-2">
              <dt className="font-medium text-navy-700">Démarrage :</dt>
              <dd>{formatDate(draft.startDate)}</dd>
            </div>
            <div className="flex justify-between sm:justify-start sm:gap-2">
              <dt className="font-medium text-navy-700">Trésorerie de départ :</dt>
              <dd>{formatEUR(draft.initialCash)}</dd>
            </div>
            <div className="flex justify-between sm:justify-start sm:gap-2">
              <dt className="font-medium text-navy-700">Saisonnalité :</dt>
              <dd>{SEASONALITY_LABELS[draft.seasonality]}</dd>
            </div>
          </dl>
        </RecapSection>

        <RecapSection title="Vos revenus" onEdit={() => onGoToStep(1)}>
          <ul className="space-y-1">
            {draft.revenueSources.map((s) => (
              <li key={s.id} className="flex justify-between gap-4">
                <span>{s.name || "Source sans nom"}</span>
                <span className="text-navy-700">
                  {formatEUR(s.unitPrice)} · {s.volumeM1} → {s.volumeM12} u/mois
                </span>
              </li>
            ))}
          </ul>
        </RecapSection>

        <RecapSection title="Vos charges" onEdit={() => onGoToStep(2)}>
          <p>
            {draft.fixedExpenses.length} charge{draft.fixedExpenses.length !== 1 && "s"} fixe
            {draft.fixedExpenses.length !== 1 && "s"} ·{" "}
            {formatEUR(draft.fixedExpenses.reduce((sum, e) => sum + e.monthlyAmount, 0))} / mois
          </p>
          <p className="mt-1">
            {draft.variableExpenses.length} charge{draft.variableExpenses.length !== 1 && "s"} variable
            {draft.variableExpenses.length !== 1 && "s"}
          </p>
        </RecapSection>

        <RecapSection title="Investissements et financement" onEdit={() => onGoToStep(3)}>
          <p>
            {draft.investments.length} investissement{draft.investments.length !== 1 && "s"} ·{" "}
            {formatEUR(draft.investments.reduce((sum, i) => sum + i.amountHT, 0))}
          </p>
          <p className="mt-1">
            Apport {formatEUR(draft.financing.personalContribution)} · Prêt d&apos;honneur{" "}
            {formatEUR(draft.financing.honorLoan)} · Emprunt {formatEUR(draft.financing.bankLoan.amount)} ·
            Subventions {formatEUR(draft.financing.subsidies)}
          </p>
        </RecapSection>
      </div>

      <div className="mt-10 border-t border-border pt-6">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={generating}
          onClick={handleGenerate}
        >
          {generating ? "Génération en cours…" : "Générer mon dossier financier"}
        </Button>
      </div>

      <div className="mt-4 flex justify-start">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Précédent
        </Button>
      </div>
    </div>
  );
}
