import { View } from "@react-pdf/renderer";
import { PdfPage } from "../components/pdf-page";
import { PdfH1, PdfH2, PdfP } from "../components/typography";

export function MethodologyPage({
  projectName,
  generatedDate,
}: {
  projectName: string;
  generatedDate: string;
}) {
  return (
    <PdfPage projectName={projectName} generatedDate={generatedDate}>
      <PdfH1>Note méthodologique</PdfH1>

      <PdfH2>Chiffre d&apos;affaires</PdfH2>
      <PdfP>
        Le chiffre d&apos;affaires mensuel de l&apos;année 1 est interpolé linéairement entre le volume
        saisi au mois 1 et celui saisi au mois 12, puis ajusté par un coefficient de saisonnalité
        mensuel (moyenne 1 sur l&apos;année, donc sans effet sur le total annuel). Les années 2 et 3
        appliquent une croissance simple de respectivement +30 % et +25 % au chiffre d&apos;affaires
        annuel de l&apos;année précédente.
      </PdfP>

      <PdfH2>TVA</PdfH2>
      <PdfP>
        Le taux de TVA appliqué est de 20 % sur les produits et les charges. La TVA nette due chaque
        mois correspond à la TVA collectée diminuée de la TVA déductible ; lorsque la TVA déductible
        est supérieure, l&apos;excédent constitue un crédit de TVA reporté sur le(s) mois suivant(s).
      </PdfP>

      <PdfH2>Impôt sur les sociétés</PdfH2>
      <PdfP>
        L&apos;impôt sur les sociétés est calculé de façon simplifiée : 15 % sur la tranche du résultat
        imposable jusqu&apos;à 42 500 €, puis 25 % au-delà. Aucun report en avant des déficits
        n&apos;est modélisé.
      </PdfP>

      <PdfH2>Amortissements et emprunt</PdfH2>
      <PdfP>
        Les investissements sont amortis linéairement sur la durée indiquée par l&apos;utilisateur. La
        mensualité de l&apos;emprunt bancaire est calculée selon la formule standard d&apos;annuité
        constante (PMT) à partir du montant emprunté, du taux annuel et de la durée saisis.
      </PdfP>

      <PdfH2>Trésorerie</PdfH2>
      <PdfP>
        Le budget de trésorerie suppose que les encaissements et décaissements interviennent le mois
        de la vente ou de l&apos;achat, sans délai de règlement (hypothèse simplificatrice).
      </PdfP>

      <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: "#E5E9EE", paddingTop: 12 }}>
        <PdfP style={{ fontStyle: "italic" }}>
          Ce document est un prévisionnel construit à partir des hypothèses saisies par
          l&apos;utilisateur. Il n&apos;a pas valeur d&apos;attestation comptable.
        </PdfP>
      </View>
    </PdfPage>
  );
}
