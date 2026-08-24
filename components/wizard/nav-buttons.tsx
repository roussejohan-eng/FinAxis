import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WizardNavButtons({
  onBack,
  nextLabel = "Suivant",
  nextDisabled = false,
  showBack = true,
}: {
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
}) {
  return (
    <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
      {showBack ? (
        <Button type="button" variant="ghost" className="group" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          Précédent
        </Button>
      ) : (
        <span />
      )}
      <Button type="submit" className="group" disabled={nextDisabled}>
        {nextLabel}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Button>
    </div>
  );
}
