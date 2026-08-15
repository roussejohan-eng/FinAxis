import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FadeIn } from "@/components/fade-in";

const FAQ_ITEMS = [
  {
    question: "Puis-je essayer sans carte bancaire ?",
    answer:
      "Oui. L'offre Découverte est gratuite et ne demande aucune carte bancaire. Vous pouvez créer un projet complet sur l'année 1 et exporter un PDF avec filigrane pour évaluer l'outil.",
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "Vos hypothèses sont traitées dans le respect du RGPD. Dans cette version, vos projets sont stockés localement dans votre navigateur ; aucune donnée financière n'est transmise à un serveur tiers sans votre action explicite (par exemple lors d'un partage avec un expert-comptable).",
  },
  {
    question: "Combien de temps prend la création d'un dossier ?",
    answer:
      "Le parcours guidé en 5 étapes prend en moyenne 30 minutes pour un premier projet, une fois vos hypothèses de revenus et de charges rassemblées.",
  },
  {
    question: "Qu'est-ce que l'attestation de cohérence ?",
    answer:
      "C'est un document délivré par un expert-comptable partenaire inscrit à l'Ordre, qui a relu la cohérence de vos hypothèses et de vos calculs. Elle est facturée en direct par le cabinet et n'est pas une certification FinAxis.",
  },
  {
    question: "Puis-je modifier mon dossier après création ?",
    answer:
      "Oui, à tout moment. Le bouton « Modifier les hypothèses » du tableau de bord vous ramène au parcours de saisie, pré-rempli avec vos données existantes.",
  },
  {
    question: "Que se passe-t-il si je résilie ?",
    answer:
      "Votre abonnement s'arrête à la fin de la période en cours, sans engagement supplémentaire. Vos projets restent accessibles en lecture ; les exports PDF et Excel déjà téléchargés vous restent acquis.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="bg-muted py-20 sm:py-28">
      <div className="container">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-navy-700 sm:text-4xl">Questions fréquentes</h2>
        </FadeIn>

        <FadeIn delay={0.08} className="mx-auto mt-12 max-w-2xl rounded-lg border border-border bg-white px-6">
          <Accordion type="single" collapsible>
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  );
}
