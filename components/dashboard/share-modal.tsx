"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FormValues {
  email: string;
  message: string;
}

export function ShareModal({
  open,
  onOpenChange,
  projectName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
}) {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      email: "",
      message: `Bonjour,\n\nJe vous partage mon dossier financier prévisionnel « ${projectName} » généré avec FinAxis, pour relecture.\n\nMerci d'avance,`,
    },
  });

  const onSubmit = (values: FormValues) => {
    // eslint-disable-next-line no-console
    console.log("[dashboard] Partage du dossier avec un expert-comptable", {
      project: projectName,
      ...values,
    });
    setSent(true);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setSent(false);
          reset();
        }
      }}
    >
      <DialogContent>
        {sent ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-turquoise-500" aria-hidden />
            <p className="mt-4 text-sm font-medium text-navy-700">
              Votre dossier a été partagé. Votre expert-comptable recevra une invitation par email.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Partager avec mon expert-comptable</DialogTitle>
              <DialogDescription>
                Envoyez un lien de consultation de votre dossier à votre expert-comptable partenaire.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="share-email">Email de l&apos;expert-comptable</Label>
                <Input id="share-email" type="email" required {...register("email")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="share-message">Message</Label>
                <Textarea id="share-message" rows={5} {...register("message")} />
              </div>
              <DialogFooter>
                <Button type="submit">Envoyer</Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
