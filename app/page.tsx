import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/marketing/hero";
import { Problem } from "@/components/marketing/problem";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { WhatYouGet } from "@/components/marketing/what-you-get";
import { Incubators } from "@/components/marketing/incubators";
import { HybridApproach } from "@/components/marketing/hybrid-approach";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";
import { PricingSection } from "@/components/pricing-section";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = {
  title: "FinAxis — comprendre, prévoir, réussir",
  description:
    "FinAxis génère votre prévisionnel, votre trésorerie et votre plan de financement en 30 minutes, dans un format harmonisé, exportable et validable par un expert-comptable partenaire.",
};

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <WhatYouGet />

        <section id="tarifs" className="bg-white py-20 sm:py-28">
          <div className="container">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold text-navy-700 sm:text-4xl">Tarification</h2>
              <p className="mt-4 text-muted-foreground">
                Quatre offres claires, sans engagement, pensées pour chaque étape de votre projet.
              </p>
            </FadeIn>
            <div className="mt-12">
              <PricingSection showHeading={false} />
            </div>
          </div>
        </section>

        <Incubators />
        <HybridApproach />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
