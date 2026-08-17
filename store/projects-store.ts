"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Project } from "@/lib/finance/types";

interface ProjectsStore {
  projects: Project[];
  /** false tant que la réhydratation depuis localStorage n'est pas terminée
   * côté client — évite un flash de contenu incorrect (et une erreur
   * d'hydratation React) sur les pages qui rendent un arbre différent selon
   * qu'un projet existe ou non (dashboard, liste des projets). */
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  saveProject: (project: Project) => void;
  getProject: (id: string) => Project | undefined;
  removeProject: (id: string) => void;
}

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    (set, get) => ({
      projects: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      saveProject: (project) =>
        set((s) => {
          const exists = s.projects.some((p) => p.id === project.id);
          return {
            projects: exists
              ? s.projects.map((p) => (p.id === project.id ? project : p))
              : [...s.projects, project],
          };
        }),
      getProject: (id) => get().projects.find((p) => p.id === id),
      removeProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
    }),
    {
      name: "finaxis-projects",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ projects: state.projects }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
