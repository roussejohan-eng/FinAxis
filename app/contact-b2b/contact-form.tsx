"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STRUCTURE_TYPES = [
  { value: "incubateur", label: "Incubateur" },
  { value: "cci", label: "CCI" },
  { value: "pepiniere", label: "Pépinière" },
  { value: "reseau", label: "Réseau d'accompagnement" },
  { value: "autre", label: "Autre" },
] as const;

const schema = z.object({
  structureName: z.string().min(2, "Indiquez le nom de votre structure."),
  structureType: z.enum(["incubateur", "cci", "pepiniere", "reseau", "autre"], {
    required_error: "Sélectionnez un type de structure.",
  }),
  entrepreneursPerYear: z.coerce.number().min(1, "Indiquez un nombre de porteurs accompagnés."),
  contactName: z.string().min(2, "Indiquez le nom du contact."),
  role: z.string().min(2, "Indiquez votre fonction."),
  email: z.string().email("Adresse email professionnelle invalide."),
  phone: z.string().min(6, "Indiquez un numéro de téléphone valide."),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ContactB2bForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    // Pas de backend en V2 : on journalise la demande et on affiche une
    // confirmation. À terme, ce point branchera un webhook (Zapier, Make,
    // ou endpoint interne) — voir README pour le plan de migration.
    // eslint-disable-next-line no-console
    console.log("[contact-b2b] Nouvelle demande de démo B2B", values);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-border bg-white p-10 text-center shadow-sm">
        <CheckCircle2 className="h-10 w-10 text-turquoise-500" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold text-navy-700">Demande envoyée</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Nous vous recontactons sous 48h.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8"
      noValidate
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="structureName">Nom de la structure</Label>
          <Input id="structureName" {...register("structureName")} aria-invalid={!!errors.structureName} />
          {errors.structureName && (
            <p className="text-xs text-destructive">{errors.structureName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="structureType">Type de structure</Label>
          <Select onValueChange={(v) => setValue("structureType", v as FormValues["structureType"])}>
            <SelectTrigger id="structureType">
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              {STRUCTURE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.structureType && (
            <p className="text-xs text-destructive">{errors.structureType.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="entrepreneursPerYear">Nombre de porteurs accompagnés par an</Label>
          <Input
            id="entrepreneursPerYear"
            type="number"
            min={1}
            {...register("entrepreneursPerYear")}
            aria-invalid={!!errors.entrepreneursPerYear}
          />
          {errors.entrepreneursPerYear && (
            <p className="text-xs text-destructive">{errors.entrepreneursPerYear.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contactName">Nom du contact</Label>
          <Input id="contactName" {...register("contactName")} aria-invalid={!!errors.contactName} />
          {errors.contactName && <p className="text-xs text-destructive">{errors.contactName.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="role">Fonction</Label>
          <Input id="role" {...register("role")} aria-invalid={!!errors.role} />
          {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email professionnel</Label>
          <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" type="tel" {...register("phone")} aria-invalid={!!errors.phone} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" rows={4} {...register("message")} />
        </div>
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Envoi en cours…" : "Envoyer la demande"}
      </Button>
    </form>
  );
}
