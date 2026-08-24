"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/logo";
import { WizardProgressBar } from "@/components/wizard/progress-bar";
import { useWizardStore } from "@/store/wizard-store";
import { useProjectsStore } from "@/store/projects-store";
import { WIZARD_STEP_LABELS } from "@/lib/wizard/options";
import { Step1Project } from "./steps/step1-project";
import { Step2Revenues } from "./steps/step2-revenues";
import { Step3Expenses } from "./steps/step3-expenses";
import { Step4Financing } from "./steps/step4-financing";
import { Step5Recap } from "./steps/step5-recap";

const STEP_DESCRIPTIONS = [
  "Les informations générales qui cadrent votre prévisionnel.",
  "Décrivez vos sources de chiffre d'affaires et leur montée en charge.",
  "Listez vos charges fixes et variables, ou importez-les depuis un tableur.",
  "Vos investissements de départ et la façon dont vous les financez.",
  "Vérifiez vos hypothèses avant de générer votre dossier financier.",
];

function WizardContent() {
  const currentStep = useWizardStore((s) => s.currentStep);
  const setCurrentStep = useWizardStore((s) => s.setCurrentStep);
  const loadDraftFromProject = useWizardStore((s) => s.loadDraftFromProject);
  const hasHydrated = useWizardStore((s) => s.hasHydrated);
  const getProject = useProjectsStore((s) => s.getProject);
  const projectsHydrated = useProjectsStore((s) => s.hasHydrated);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!projectsHydrated) return;
    const editId = searchParams.get("edit");
    if (editId) {
      const project = getProject(editId);
      if (project) loadDraftFromProject(project);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, projectsHydrated]);

  const goNext = () => setCurrentStep(Math.min(currentStep + 1, 4));
  const goBack = () => setCurrentStep(Math.max(currentStep - 1, 0));
  const goTo = (step: number) => setCurrentStep(step);

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b border-border bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" aria-label="FinAxis, accueil">
            <Logo />
          </Link>
          <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-navy-700">
            Enregistrer et quitter
          </Link>
        </div>
      </header>

      <div className="relative overflow-hidden border-b border-border bg-white py-6">
        <div className="container max-w-3xl">
          <WizardProgressBar currentStep={currentStep} onStepClick={goTo} />
        </div>
      </div>

      <main className="container max-w-3xl py-12">
        <h1 className="text-2xl font-semibold text-navy-700">
          {WIZARD_STEP_LABELS[currentStep]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{STEP_DESCRIPTIONS[currentStep]}</p>

        <div className="mt-8 rounded-lg border border-border bg-white p-6 shadow-sm transition-shadow sm:p-8">
          {/* Les champs de chaque étape lisent leurs valeurs initiales du
              brouillon persisté au montage (react-hook-form ne les relit pas
              automatiquement). Tant que le store ne s'est pas réhydraté
              depuis localStorage, on n'affiche donc rien plutôt que de
              monter le formulaire avec un brouillon vide qu'il ne
              rafraîchira pas ensuite. */}
          {hasHydrated && currentStep === 0 && <Step1Project onNext={goNext} />}
          {hasHydrated && currentStep === 1 && <Step2Revenues onNext={goNext} onBack={goBack} />}
          {hasHydrated && currentStep === 2 && <Step3Expenses onNext={goNext} onBack={goBack} />}
          {hasHydrated && currentStep === 3 && <Step4Financing onNext={goNext} onBack={goBack} />}
          {hasHydrated && currentStep === 4 && <Step5Recap onBack={goBack} onGoToStep={goTo} />}
        </div>
      </main>
    </div>
  );
}

export default function WizardPage() {
  return (
    <Suspense fallback={null}>
      <WizardContent />
    </Suspense>
  );
}
