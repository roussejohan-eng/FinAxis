import { StyleSheet, View } from "@react-pdf/renderer";
import { PdfPage } from "../components/pdf-page";
import { PdfH1, PdfH2, PdfNote, PdfP } from "../components/typography";
import { PdfHeaderRow, PdfRow, PdfTable, Th, Td, MoneyTd } from "../components/table";
import type { Project } from "@/lib/finance/types";
import { SEASONALITY_LABELS } from "@/lib/finance/seasonality";
import { formatDate } from "@/lib/finance/format";
import { formatEUR } from "../pdf-format";

// Cette page est un rappel structuré (le détail exhaustif vit dans le
// tableau de bord et l'export Excel) : on plafonne le nombre de lignes
// affichées par tableau pour garantir qu'elle tient toujours sur une
// seule page, quelle que soit la taille du projet.
const MAX_ROWS_DISPLAYED = 12;

const styles = StyleSheet.create({
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  metaItem: {
    width: "50%",
    marginBottom: 6,
  },
});

export function AssumptionsPage({
  project,
  projectName,
  generatedDate,
}: {
  project: Project;
  projectName: string;
  generatedDate: string;
}) {
  return (
    <PdfPage projectName={projectName} generatedDate={generatedDate}>
      <PdfH1>Hypothèses du projet</PdfH1>

      <View style={styles.metaGrid} wrap={false}>
        <View style={styles.metaItem}>
          <PdfP>Secteur d&apos;activité : {project.sector}</PdfP>
        </View>
        <View style={styles.metaItem}>
          <PdfP>Statut juridique : {project.legalStatus}</PdfP>
        </View>
        <View style={styles.metaItem}>
          <PdfP>Date de démarrage : {formatDate(project.startDate)}</PdfP>
        </View>
        <View style={styles.metaItem}>
          <PdfP>Trésorerie de départ : {formatEUR(project.initialCash)}</PdfP>
        </View>
        <View style={styles.metaItem}>
          <PdfP>Profil de saisonnalité : {SEASONALITY_LABELS[project.seasonality]}</PdfP>
        </View>
      </View>

      <PdfH2>Sources de revenus</PdfH2>
      <PdfTable>
        <PdfHeaderRow>
          <Th flex={2} small>
            Nom
          </Th>
          <Th flex={1} align="right" small>
            Prix HT
          </Th>
          <Th flex={1} align="right" small>
            Volume M1
          </Th>
          <Th flex={1} align="right" small>
            Volume M12
          </Th>
          <Th flex={1} small>
            Type
          </Th>
        </PdfHeaderRow>
        {project.revenueSources.slice(0, MAX_ROWS_DISPLAYED).map((source, i) => (
          <PdfRow key={source.id} zebra={i % 2 === 1}>
            <Td flex={2} small>
              {source.name || "—"}
            </Td>
            <MoneyTd flex={1} small value={source.unitPrice} />
            <Td flex={1} align="right" small>
              {source.volumeM1}
            </Td>
            <Td flex={1} align="right" small>
              {source.volumeM12}
            </Td>
            <Td flex={1} small>
              {source.type === "recurrent" ? "Récurrent" : "Ponctuel"}
            </Td>
          </PdfRow>
        ))}
      </PdfTable>
      {project.revenueSources.length > MAX_ROWS_DISPLAYED && (
        <PdfNote style={{ marginTop: 4 }}>
          {`+ ${project.revenueSources.length - MAX_ROWS_DISPLAYED} autre(s) source(s) — détail complet dans le tableau de bord et l'export Excel.`}
        </PdfNote>
      )}

      <PdfH2>Charges fixes</PdfH2>
      {project.fixedExpenses.length === 0 ? (
        <PdfP>Aucune charge fixe saisie.</PdfP>
      ) : (
        <>
          <PdfTable>
            <PdfHeaderRow>
              <Th flex={2} small>
                Nom
              </Th>
              <Th flex={1} align="right" small>
                Montant mensuel
              </Th>
              <Th flex={1} small>
                Catégorie
              </Th>
            </PdfHeaderRow>
            {project.fixedExpenses.slice(0, MAX_ROWS_DISPLAYED).map((expense, i) => (
              <PdfRow key={expense.id} zebra={i % 2 === 1}>
                <Td flex={2} small>
                  {expense.name || "—"}
                </Td>
                <MoneyTd flex={1} small value={expense.monthlyAmount} />
                <Td flex={1} small>
                  {expense.category}
                </Td>
              </PdfRow>
            ))}
          </PdfTable>
          {project.fixedExpenses.length > MAX_ROWS_DISPLAYED && (
            <PdfNote style={{ marginTop: 4 }}>
              {`+ ${project.fixedExpenses.length - MAX_ROWS_DISPLAYED} autre(s) charge(s) fixe(s) — détail complet dans le tableau de bord et l'export Excel.`}
            </PdfNote>
          )}
        </>
      )}

      <PdfH2>Charges variables</PdfH2>
      {project.variableExpenses.length === 0 ? (
        <PdfP>Aucune charge variable saisie.</PdfP>
      ) : (
        <>
          <PdfTable>
            <PdfHeaderRow>
              <Th flex={2} small>
                Nom
              </Th>
              <Th flex={1} small>
                Mode
              </Th>
              <Th flex={1} align="right" small>
                Valeur
              </Th>
              <Th flex={1} small>
                Catégorie
              </Th>
            </PdfHeaderRow>
            {project.variableExpenses.slice(0, MAX_ROWS_DISPLAYED).map((expense, i) => (
              <PdfRow key={expense.id} zebra={i % 2 === 1}>
                <Td flex={2} small>
                  {expense.name || "—"}
                </Td>
                <Td flex={1} small>
                  {expense.mode === "percent" ? "% du CA" : "Montant × volume"}
                </Td>
                <Td flex={1} align="right" small>
                  {expense.mode === "percent"
                    ? `${expense.percentOfRevenue ?? 0} %`
                    : formatEUR(expense.unitCost ?? 0)}
                </Td>
                <Td flex={1} small>
                  {expense.category}
                </Td>
              </PdfRow>
            ))}
          </PdfTable>
          {project.variableExpenses.length > MAX_ROWS_DISPLAYED && (
            <PdfNote style={{ marginTop: 4 }}>
              {`+ ${project.variableExpenses.length - MAX_ROWS_DISPLAYED} autre(s) charge(s) variable(s) — détail complet dans le tableau de bord et l'export Excel.`}
            </PdfNote>
          )}
        </>
      )}

      <PdfH2>Investissements</PdfH2>
      {project.investments.length === 0 ? (
        <PdfP>Aucun investissement saisi.</PdfP>
      ) : (
        <>
          <PdfTable>
            <PdfHeaderRow>
              <Th flex={2} small>
                Nom
              </Th>
              <Th flex={1} align="right" small>
                Montant HT
              </Th>
              <Th flex={1} align="right" small>
                Amortissement
              </Th>
            </PdfHeaderRow>
            {project.investments.slice(0, MAX_ROWS_DISPLAYED).map((inv, i) => (
              <PdfRow key={inv.id} zebra={i % 2 === 1}>
                <Td flex={2} small>
                  {inv.name || "—"}
                </Td>
                <MoneyTd flex={1} small value={inv.amountHT} />
                <Td flex={1} align="right" small>
                  {`${inv.amortizationYears} an${inv.amortizationYears > 1 ? "s" : ""}`}
                </Td>
              </PdfRow>
            ))}
          </PdfTable>
          {project.investments.length > MAX_ROWS_DISPLAYED && (
            <PdfNote style={{ marginTop: 4 }}>
              {`+ ${project.investments.length - MAX_ROWS_DISPLAYED} autre(s) investissement(s) — détail complet dans le tableau de bord et l'export Excel.`}
            </PdfNote>
          )}
        </>
      )}
    </PdfPage>
  );
}
