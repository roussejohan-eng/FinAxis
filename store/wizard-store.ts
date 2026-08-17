"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Financing,
  FixedExpense,
  Investment,
  LegalStatus,
  Project,
  RevenueSource,
  Sector,
  SeasonalityProfile,
  VariableExpense,
} from "@/lib/finance/types";

export interface WizardDraft {
  id: string;
  name: string;
  sector: Sector;
  legalStatus: LegalStatus;
  startDate: string;
  initialCash: number;
  seasonality: SeasonalityProfile;
  revenueSources: RevenueSource[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  investments: Investment[];
  financing: Financing;
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const defaultDraft = (): WizardDraft => ({
  id: "",
  name: "",
  sector: "Services",
  legalStatus: "Micro-entreprise",
  startDate: new Date().toISOString().slice(0, 10),
  initialCash: 0,
  seasonality: "stable",
  revenueSources: [
    { id: uid(), name: "Vente principale", unitPrice: 0, volumeM1: 0, volumeM12: 0, type: "recurrent" },
  ],
  fixedExpenses: [],
  variableExpenses: [],
  investments: [],
  financing: {
    personalContribution: 0,
    honorLoan: 0,
    bankLoan: { amount: 0, annualRate: 0, months: 60 },
    subsidies: 0,
  },
});

interface WizardStore {
  draft: WizardDraft;
  currentStep: number;
  /** false tant que la réhydratation depuis localStorage n'est pas terminée
   * côté client — le brouillon sauvegardé (et l'étape en cours) ne peut
   * différer du rendu serveur qu'une fois cette valeur passée à true. */
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setCurrentStep: (step: number) => void;
  setProjectInfo: (patch: Partial<Pick<WizardDraft, "name" | "sector" | "legalStatus" | "startDate" | "initialCash" | "seasonality">>) => void;

  addRevenueSource: () => void;
  updateRevenueSource: (id: string, patch: Partial<RevenueSource>) => void;
  removeRevenueSource: (id: string) => void;

  addFixedExpense: () => void;
  updateFixedExpense: (id: string, patch: Partial<FixedExpense>) => void;
  removeFixedExpense: (id: string) => void;
  setFixedExpenses: (expenses: FixedExpense[]) => void;

  addVariableExpense: () => void;
  updateVariableExpense: (id: string, patch: Partial<VariableExpense>) => void;
  removeVariableExpense: (id: string) => void;
  setVariableExpenses: (expenses: VariableExpense[]) => void;

  addInvestment: () => void;
  updateInvestment: (id: string, patch: Partial<Investment>) => void;
  removeInvestment: (id: string) => void;

  setFinancing: (patch: Partial<Financing>) => void;
  setBankLoan: (patch: Partial<Financing["bankLoan"]>) => void;

  loadDraftFromProject: (project: Project) => void;
  reset: () => void;
  toProject: () => Project;
}

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      draft: defaultDraft(),
      currentStep: 0,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),

      setCurrentStep: (step) => set({ currentStep: step }),

      setProjectInfo: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),

      addRevenueSource: () =>
        set((s) => ({
          draft: {
            ...s.draft,
            revenueSources: [
              ...s.draft.revenueSources,
              { id: uid(), name: `Source ${s.draft.revenueSources.length + 1}`, unitPrice: 0, volumeM1: 0, volumeM12: 0, type: "recurrent" },
            ],
          },
        })),
      updateRevenueSource: (id, patch) =>
        set((s) => ({
          draft: {
            ...s.draft,
            revenueSources: s.draft.revenueSources.map((r) => (r.id === id ? { ...r, ...patch } : r)),
          },
        })),
      removeRevenueSource: (id) =>
        set((s) => ({
          draft: { ...s.draft, revenueSources: s.draft.revenueSources.filter((r) => r.id !== id) },
        })),

      addFixedExpense: () =>
        set((s) => ({
          draft: {
            ...s.draft,
            fixedExpenses: [
              ...s.draft.fixedExpenses,
              { id: uid(), name: "", monthlyAmount: 0, category: "Autre" },
            ],
          },
        })),
      updateFixedExpense: (id, patch) =>
        set((s) => ({
          draft: {
            ...s.draft,
            fixedExpenses: s.draft.fixedExpenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          },
        })),
      removeFixedExpense: (id) =>
        set((s) => ({ draft: { ...s.draft, fixedExpenses: s.draft.fixedExpenses.filter((e) => e.id !== id) } })),
      setFixedExpenses: (expenses) => set((s) => ({ draft: { ...s.draft, fixedExpenses: expenses } })),

      addVariableExpense: () =>
        set((s) => ({
          draft: {
            ...s.draft,
            variableExpenses: [
              ...s.draft.variableExpenses,
              { id: uid(), name: "", mode: "percent", percentOfRevenue: 0, category: "Autre" },
            ],
          },
        })),
      updateVariableExpense: (id, patch) =>
        set((s) => ({
          draft: {
            ...s.draft,
            variableExpenses: s.draft.variableExpenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          },
        })),
      removeVariableExpense: (id) =>
        set((s) => ({
          draft: { ...s.draft, variableExpenses: s.draft.variableExpenses.filter((e) => e.id !== id) },
        })),
      setVariableExpenses: (expenses) => set((s) => ({ draft: { ...s.draft, variableExpenses: expenses } })),

      addInvestment: () =>
        set((s) => ({
          draft: {
            ...s.draft,
            investments: [...s.draft.investments, { id: uid(), name: "", amountHT: 0, amortizationYears: 3 }],
          },
        })),
      updateInvestment: (id, patch) =>
        set((s) => ({
          draft: {
            ...s.draft,
            investments: s.draft.investments.map((i) => (i.id === id ? { ...i, ...patch } : i)),
          },
        })),
      removeInvestment: (id) =>
        set((s) => ({ draft: { ...s.draft, investments: s.draft.investments.filter((i) => i.id !== id) } })),

      setFinancing: (patch) => set((s) => ({ draft: { ...s.draft, financing: { ...s.draft.financing, ...patch } } })),
      setBankLoan: (patch) =>
        set((s) => ({
          draft: {
            ...s.draft,
            financing: { ...s.draft.financing, bankLoan: { ...s.draft.financing.bankLoan, ...patch } },
          },
        })),

      loadDraftFromProject: (project) =>
        set({
          draft: {
            id: project.id,
            name: project.name,
            sector: project.sector,
            legalStatus: project.legalStatus,
            startDate: project.startDate,
            initialCash: project.initialCash,
            seasonality: project.seasonality,
            revenueSources: project.revenueSources,
            fixedExpenses: project.fixedExpenses,
            variableExpenses: project.variableExpenses,
            investments: project.investments,
            financing: project.financing,
          },
          currentStep: 0,
        }),

      reset: () => set({ draft: defaultDraft(), currentStep: 0 }),

      toProject: () => {
        const { draft } = get();
        const now = new Date().toISOString();
        return {
          ...draft,
          id: draft.id || uid(),
          createdAt: now,
          updatedAt: now,
        };
      },
    }),
    {
      name: "finaxis-wizard-draft",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ draft: state.draft, currentStep: state.currentStep }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
