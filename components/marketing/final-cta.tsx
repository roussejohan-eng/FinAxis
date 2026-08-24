import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/fade-in";
import { AmbientGlow } from "@/components/ambient-glow";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-navy-700 py-20 text-white sm:py-24">
      <AmbientGlow variant="dark" className="h-[420px]" />

      <div className="container text-center">
        <FadeIn>
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold sm:text-4xl">
            Prêt à construire un dossier que votre banquier{" "}
            <span className="font-serif italic font-medium text-turquoise-400">prendra au sérieux</span> ?
          </h2>
          <Button size="lg" variant="accent" className="mt-8" asChild>
            <Link href="/wizard/nouveau-projet">Commencer gratuitement</Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
