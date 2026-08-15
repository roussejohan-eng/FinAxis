import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PricingSection } from "@/components/pricing-section";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = {
  title: "Tarifs",
  description:
    "Découverte gratuite, Standard, Pro ou Expert avec validation par un expert-comptable partenaire : choisissez l'offre FinAxis adaptée à votre projet.",
};

export default function TarifsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-white py-20 sm:py-24">
          <div className="container">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-semibold text-navy-700 sm:text-5xl">Tarification</h1>
              <p className="mt-4 text-muted-foreground">
                Quatre offres claires, sans engagement, pensées pour chaque étape de votre projet.
              </p>
            </FadeIn>
            <div className="mt-14">
              <PricingSection showHeading={false} />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
