"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Project } from "@/lib/finance/types";

interface ProjectsStore {
  projects: Project[];
  saveProject: (project: Project) => void;
  getProject: (id: string) => Project | undefined;
  removeProject: (id: string) => void;
}

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    (set, get) => ({
      projects: [],
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
    }
  )
);
