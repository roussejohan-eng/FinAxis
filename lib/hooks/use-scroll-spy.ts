"use client";

import { useEffect, useState } from "react";

/**
 * Renvoie l'id de la section actuellement la plus proche du haut de la
 * fenêtre, parmi une liste d'ids de sections observées. Utilisé pour
 * surligner l'entrée de navigation active dans la sidebar et la barre
 * mobile du tableau de bord, au fil du défilement.
 *
 * rootMargin resserre la zone de détection vers le haut du viewport,
 * pour que la section change dès qu'elle passe sous l'en-tête plutôt
 * qu'au milieu de l'écran.
 */
export function useScrollSpy(ids: string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }
        if (visible.size > 0) {
          // Parmi les sections visibles, on garde la première dans l'ordre
          // du document (celle qu'on est en train de lire).
          const firstVisible = ids.find((id) => visible.has(id));
          if (firstVisible) setActiveId(firstVisible);
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}
