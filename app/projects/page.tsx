"use client";

import Link from "next/link";
import { FolderKanban, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useProjectsStore } from "@/store/projects-store";
import { Button } from "@/components/ui/button";
import { formatDate, formatEUR } from "@/lib/finance/format";
import { computeProjectResults } from "@/lib/finance";

export default function ProjectsPage() {
  const projects = useProjectsStore((s) => s.projects);
  const removeProject = useProjectsStore((s) => s.removeProject);

  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh] bg-muted py-16">
        <div className="container max-w-4xl">
          <h1 className="text-3xl font-semibold text-navy-700">Mes projets</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Vos dossiers financiers, sauvegardés localement dans ce navigateur.
          </p>

          {projects.length === 0 ? (
            <div className="mt-10 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-white py-16 text-center">
              <FolderKanban className="h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">Vous n&apos;avez pas encore créé de projet.</p>
              <Button asChild>
                <Link href="/wizard/nouveau-projet">Créer mon premier dossier</Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-8 flex flex-col gap-3">
              {projects.map((project) => {
                const results = computeProjectResults(project);
                return (
                  <li
                    key={project.id}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <Link href={`/dashboard/${project.id}`} className="text-base font-semibold text-navy-700 hover:text-turquoise-600">
                        {project.name || "Projet sans nom"}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {project.sector} · Démarrage le {formatDate(project.startDate)} · CA An 1{" "}
                        {formatEUR(results.incomeStatement.years[0].revenue)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/${project.id}`}>Ouvrir</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Supprimer ce projet"
                        onClick={() => removeProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
