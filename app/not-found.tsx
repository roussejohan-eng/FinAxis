import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AmbientGlow } from "@/components/ambient-glow";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="relative flex min-h-[70vh] items-center overflow-hidden bg-white">
        <AmbientGlow variant="light" className="h-[520px]" />
        <div className="container relative py-24 text-center">
          <p className="font-serif text-8xl italic font-medium text-turquoise-500 sm:text-9xl">404</p>
          <h1 className="mt-4 text-2xl font-semibold text-navy-700 sm:text-3xl">
            Cette page n&apos;existe pas, ou plus.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Le lien est peut-être obsolète, ou l&apos;adresse mal orthographiée. Repartez de l&apos;accueil
            ou de votre espace projets.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4" aria-hidden />
                Retour à l&apos;accueil
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/projects">
                <Compass className="h-4 w-4" aria-hidden />
                Mes projets
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
