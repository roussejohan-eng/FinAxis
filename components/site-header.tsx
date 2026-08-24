"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/#incubateurs", label: "Incubateurs" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" aria-label="FinAxis, accueil">
          <Logo />
        </Link>

        <nav
          className="hidden items-center gap-1 rounded-full border border-border bg-navy-50/60 p-1 md:flex"
          aria-label="Navigation principale"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-navy-700 transition-colors hover:bg-white hover:text-turquoise-600 hover:shadow-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/#tarifs">Voir une démo</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/wizard/nouveau-projet">Créer mon dossier</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-navy-700 md:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-border bg-white md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="container flex flex-col gap-1 py-4" aria-label="Navigation mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-3 text-sm font-medium text-navy-700 hover:bg-navy-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            <Button variant="outline" asChild>
              <Link href="/#tarifs" onClick={() => setOpen(false)}>
                Voir une démo
              </Link>
            </Button>
            <Button asChild>
              <Link href="/wizard/nouveau-projet" onClick={() => setOpen(false)}>
                Créer mon dossier
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
