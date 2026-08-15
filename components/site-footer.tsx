import Link from "next/link";
import { Logo } from "@/components/logo";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Produit",
    links: [
      { label: "Tarifs", href: "/tarifs" },
      { label: "Démo", href: "/#tarifs" },
      { label: "Nouveautés", href: "/#" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Blog", href: "/#" },
      { label: "Guide bancaire", href: "/#" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "/#" },
      { label: "Contact", href: "/contact-b2b" },
      { label: "Partenaires", href: "/contact-b2b" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales", href: "/#" },
      { label: "CGU", href: "/#" },
      { label: "Politique de confidentialité", href: "/#" },
      { label: "RGPD", href: "/#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="container py-16">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Logo variant="light" showTagline taglineClassName="text-white/50" />
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-turquoise-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-center gap-2 py-6 text-center text-xs text-white/40 sm:flex-row">
          <p>© 2026 FinAxis. Comprendre, prévoir, réussir.</p>
        </div>
      </div>
    </footer>
  );
}
