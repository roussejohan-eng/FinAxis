"use client";

import { useMemo } from "react";
import { useWizardStore } from "@/store/wizard-store";
import { computeProjectResults, type Project } from "@/lib/finance";

/**
 * Calcule l'intégralité des résultats financiers (le même moteur que le
 * tableau de bord final) à partir du brouillon en cours de saisie dans
 * l'assistant. Permet d'afficher un aperçu chiffré qui se met à jour en
 * temps réel, avant même que le dossier ne soit généré.
 *
 * Le moteur est pur et défensif (pas de division par zéro, pas
 * d'exception sur des valeurs à 0) : il peut tourner sans risque à
 * chaque frappe, même sur un brouillon encore incomplet.
 */
export function useDraftResults() {
  const draft = useWizardStore((s) => s.draft);

  return useMemo(() => {
    const synthetic: Project = {
      ...draft,
      id: "preview",
      createdAt: "",
      updatedAt: "",
    };
    return computeProjectResults(synthetic);
  }, [draft]);
}
