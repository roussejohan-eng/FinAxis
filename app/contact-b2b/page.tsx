import type { Metadata } from "next";
import { FileOutput, LayoutDashboard, Palette } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactB2bForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Discutons de votre structure",
  description:
    "Incubateurs, CCI, pépinières et réseaux d'accompagnement : demandez une démo de la licence B2B2C FinAxis.",
};

const BENEFITS = [
  {
    icon: LayoutDashboard,
    title: "Tableau de bord multi-porteurs",
    description: "Suivez l'avancement de tous vos porteurs de projet depuis un seul espace.",
  },
  {
    icon: Palette,
    title: "Charte et logo personnalisables",
    description: "Vos dossiers sortent avec votre identité, pas uniquement celle de FinAxis.",
  },
  {
    icon: FileOutput,
    title: "Export standardisé pour vos banques partenaires",
    description: "Un format homogène, reconnaissable par vos partenaires bancaires habituels.",
  },
];

export default function ContactB2bPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-muted py-16 sm:py-24">
        <div className="container grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="text-3xl font-semibold text-navy-700 sm:text-4xl">
              Discutons de{" "}
              <span className="font-serif italic font-medium text-turquoise-600">votre structure</span>
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Décrivez votre structure d&apos;accompagnement, un conseiller FinAxis vous recontacte
              sous 48h pour organiser une démonstration de la licence B2B2C.
            </p>

            <div className="mt-10">
              <ContactB2bForm />
            </div>
          </div>

          <aside>
            <div className="rounded-lg border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
              <h2 className="text-base font-semibold text-navy-700">
                Pourquoi les structures d&apos;accompagnement choisissent FinAxis
              </h2>
              <ul className="mt-6 flex flex-col gap-6">
                {BENEFITS.map((benefit) => (
                  <li
                    key={benefit.title}
                    className="group flex gap-4 rounded-lg p-2 -m-2 transition-colors hover:bg-navy-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-turquoise-50 transition-transform group-hover:scale-105">
                      <benefit.icon className="h-5 w-5 text-turquoise-600" aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy-700">{benefit.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
