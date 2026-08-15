"use client";

import { Check } from "lucide-react";
import { WIZARD_STEP_LABELS } from "@/lib/wizard/options";
import { cn } from "@/lib/utils";

export function WizardProgressBar({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <ol className="flex items-start justify-between gap-2" aria-label="Progression du dossier">
      {WIZARD_STEP_LABELS.map((label, i) => {
        const isDone = i < currentStep;
        const isCurrent = i === currentStep;
        const isClickable = isDone;

        return (
          <li key={label} className="flex flex-1 flex-col items-center text-center">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "h-px flex-1",
                  i === 0 ? "invisible" : isDone ? "bg-turquoise-500" : "bg-border"
                )}
                aria-hidden
              />
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(i)}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Étape ${i + 1} : ${label}${isDone ? " (complétée)" : ""}`}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isCurrent && "border-turquoise-500 bg-turquoise-500 text-white",
                  isDone && !isCurrent && "border-turquoise-500 bg-white text-turquoise-600 hover:bg-turquoise-50",
                  !isDone && !isCurrent && "border-border bg-white text-muted-foreground",
                  isClickable && "cursor-pointer"
                )}
              >
                {isDone ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
              </button>
              <div
                className={cn(
                  "h-px flex-1",
                  i === WIZARD_STEP_LABELS.length - 1 ? "invisible" : isDone ? "bg-turquoise-500" : "bg-border"
                )}
                aria-hidden
              />
            </div>
            <span
              className={cn(
                "mt-2 hidden text-xs font-medium sm:block",
                isCurrent ? "text-navy-700" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
