import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/fade-in";
import { AmbientGlow } from "@/components/ambient-glow";
import { B2B_PLAN, PRICING_DISCLAIMER, PRICING_PLANS } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function PricingSection({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <div>
      {showHeading && (
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-navy-700 sm:text-4xl">
            Une offre adaptée à{" "}
            <span className="font-serif italic font-medium text-turquoise-600">chaque étape</span> de
            votre projet.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Commencez gratuitement, passez à l&apos;offre supérieure quand votre projet grandit.
          </p>
        </FadeIn>
      )}

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PRICING_PLANS.map((plan, i) => (
          <FadeIn key={plan.id} delay={i * 0.06}>
            <div
              className={cn(
                "relative flex h-full flex-col rounded-lg border bg-white p-6 shadow-sm transition-all hover:-translate-y-1",
                plan.highlighted
                  ? "border-2 border-turquoise-500 hover:shadow-lg hover:shadow-turquoise-500/10"
                  : "border-border hover:border-turquoise-200 hover:shadow-md"
              )}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-turquoise-500 text-white">
                  {plan.badge}
                </Badge>
              )}
              <h3 className="text-lg font-semibold text-navy-700">{plan.name}</h3>
              <p className="mt-3 text-2xl font-semibold text-navy-700">{plan.priceLabel}</p>
              {plan.priceSubLabel && (
                <p className="mt-0.5 text-sm text-muted-foreground">{plan.priceSubLabel}</p>
              )}
              <p className="mt-3 text-sm text-muted-foreground">{plan.audience}</p>

              <div className="mt-6 flex-1">
                {plan.featuresIntro && (
                  <p className="mb-2 text-sm font-medium text-navy-700">{plan.featuresIntro}</p>
                )}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-navy-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-turquoise-500" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                asChild
                className="mt-6 w-full"
                variant={plan.highlighted ? "default" : "outline"}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          </FadeIn>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-3xl text-center text-xs text-muted-foreground">
        {PRICING_DISCLAIMER}
      </p>

      <FadeIn className="mt-10">
        <div className="relative overflow-hidden rounded-lg bg-navy-700 p-8 text-white sm:p-10">
          <AmbientGlow variant="dark" className="h-[320px]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h3 className="text-2xl font-semibold">{B2B_PLAN.title}</h3>
              <p className="mt-3 text-white/70">{B2B_PLAN.description}</p>
              <ul className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
                {B2B_PLAN.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 shrink-0 text-turquoise-400" aria-hidden />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <p className="text-lg font-semibold text-turquoise-400">{B2B_PLAN.priceLabel}</p>
              <Button asChild size="lg" variant="accent">
                <Link href={B2B_PLAN.href}>{B2B_PLAN.cta}</Link>
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
