"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Briefcase, Snowflake, Sun, TrendingUp } from "lucide-react";
import { useWizardStore } from "@/store/wizard-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WizardNavButtons } from "@/components/wizard/nav-buttons";
import { SECTOR_OPTIONS, LEGAL_STATUS_OPTIONS } from "@/lib/wizard/options";
import { SEASONALITY_DESCRIPTIONS, SEASONALITY_LABELS } from "@/lib/finance/seasonality";
import type { LegalStatus, Sector, SeasonalityProfile } from "@/lib/finance/types";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Donnez un nom à votre projet."),
  sector: z.string(),
  legalStatus: z.string(),
  startDate: z.string().min(1, "Indiquez une date de démarrage."),
  initialCash: z.coerce.number().min(0, "La trésorerie de départ ne peut pas être négative."),
});

type FormValues = z.infer<typeof schema>;

const SEASONALITY_ICONS: Record<SeasonalityProfile, typeof Sun> = {
  stable: Briefcase,
  ete: Sun,
  hiver: Snowflake,
  "b2b-saas": TrendingUp,
};

export function Step1Project({ onNext }: { onNext: () => void }) {
  const draft = useWizardStore((s) => s.draft);
  const setProjectInfo = useWizardStore((s) => s.setProjectInfo);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: draft.name,
      sector: draft.sector,
      legalStatus: draft.legalStatus,
      startDate: draft.startDate,
      initialCash: draft.initialCash,
    },
  });

  const values = watch();
  useEffect(() => {
    setProjectInfo({
      name: values.name,
      sector: values.sector as Sector,
      legalStatus: values.legalStatus as LegalStatus,
      startDate: values.startDate,
      initialCash: Number(values.initialCash) || 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.name, values.sector, values.legalStatus, values.startDate, values.initialCash]);

  const onSubmit = () => onNext();

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="name">Nom du projet</Label>
          <Input id="name" placeholder="Ex : Atelier Lumière" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sector">Secteur d&apos;activité</Label>
          <Select value={values.sector} onValueChange={(v) => setValue("sector", v, { shouldValidate: true })}>
            <SelectTrigger id="sector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTOR_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="legalStatus">Statut juridique prévu</Label>
          <Select
            value={values.legalStatus}
            onValueChange={(v) => setValue("legalStatus", v, { shouldValidate: true })}
          >
            <SelectTrigger id="legalStatus">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEGAL_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startDate">Date de démarrage prévue</Label>
          <Input id="startDate" type="date" {...register("startDate")} aria-invalid={!!errors.startDate} />
          {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="initialCash">Trésorerie de départ</Label>
          <div className="relative">
            <Input
              id="initialCash"
              type="number"
              min={0}
              step="0.01"
              className="pr-10"
              {...register("initialCash")}
              aria-invalid={!!errors.initialCash}
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              €
            </span>
          </div>
          {errors.initialCash && <p className="text-xs text-destructive">{errors.initialCash.message}</p>}
        </div>
      </div>

      <div className="mt-8">
        <Label>Profil de saisonnalité</Label>
        <p className="mt-1 text-sm text-muted-foreground">
          Ce choix ajuste automatiquement la répartition mensuelle de votre chiffre d&apos;affaires.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(Object.keys(SEASONALITY_LABELS) as SeasonalityProfile[]).map((profile) => {
            const Icon = SEASONALITY_ICONS[profile];
            const selected = draft.seasonality === profile;
            return (
              <button
                key={profile}
                type="button"
                onClick={() => setProjectInfo({ seasonality: profile })}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                  selected
                    ? "border-2 border-turquoise-500 bg-turquoise-50"
                    : "border-border hover:border-navy-400"
                )}
                aria-pressed={selected}
              >
                <Icon
                  className={cn("mt-0.5 h-5 w-5 shrink-0", selected ? "text-turquoise-600" : "text-muted-foreground")}
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-navy-700">{SEASONALITY_LABELS[profile]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{SEASONALITY_DESCRIPTIONS[profile]}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <WizardNavButtons showBack={false} nextDisabled={!isValid} />
    </form>
  );
}
