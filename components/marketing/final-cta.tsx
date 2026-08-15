import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/fade-in";

export function FinalCta() {
  return (
    <section className="bg-navy-700 py-20 text-white sm:py-24">
      <div className="container text-center">
        <FadeIn>
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold sm:text-4xl">
            Prêt à construire un dossier que votre banquier prendra au sérieux ?
          </h2>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/wizard/nouveau-projet">Commencer gratuitement</Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
