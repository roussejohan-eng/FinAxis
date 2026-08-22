import * as XLSX from "xlsx";
import { YEAR2_GROWTH, YEAR3_GROWTH, type Project } from "@/lib/finance/types";
import type { ProjectResults } from "@/lib/finance";
import { EUR_FORMAT, PCT_FORMAT, finalizeSheet, setFormula, setLabel, setValue } from "./sheet-helpers";
import {
  MAX_FIXED,
  MAX_INVESTMENTS,
  MAX_SOURCES,
  MAX_VARIABLE,
  ROW as HYP,
} from "./project-sheet-layout";

// -- Onglets analytiques, entièrement pilotés par formules -------------
// Partagés entre le dossier exporté (generate.ts, sur les vraies données
// d'un projet) et les modèles de départ par secteur (sector-templates.ts,
// sur un projet d'exemple) : aucune de ces feuilles n'a de logique propre à
// un secteur, elles ne font que référencer la feuille « Hyp » du même
// classeur par formule — ce qui garantit que le modèle téléchargé se
// comporte à l'identique du dossier final une fois les hypothèses saisies.
//
// Chaque cellule de formule reçoit AUSSI sa valeur déjà calculée (calculée
// ici en JS avec exactement la même logique que lib/finance, la source de
// vérité du tableau de bord) : SheetJS n'évalue pas les formules, et une
// cellule de formule sans valeur en cache s'afficherait vide (voire serait
// supprimée à l'écriture, voir sheet-helpers.ts) tant que l'utilisateur n'a
// pas forcé un recalcul dans son tableur. La formule reste éditable :
// modifier une hypothèse dans « Hyp » recalcule tout le reste normalement.
export const LOAN_MONTHS_TEMPLATE = 60;

const HYP_SOURCES_ROW = HYP.sourcesStart; // 18..27
const HYP_FIXED_ROW = HYP.fixedStart; // 31..50
const HYP_VARIABLE_ROW = HYP.variableStart; // 54..73
const HYP_INVEST_ROW = HYP.investStart; // 77..86
const HYP_COEF_ROW = 98;

export const MONTH_COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // colonnes B..M (0-indexées à partir de B=1)
export const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function pct(numerator: number, denominator: number): number {
  return denominator !== 0 ? numerator / denominator : 0;
}

/** Volume vendu d'une source au mois donné (1-indexé) — même interpolation linéaire que la formule Excel. */
function sourceVolumeAtMonth(volumeM1: number, volumeM12: number, month: number): number {
  return volumeM1 + ((volumeM12 - volumeM1) * (month - 1)) / 11;
}

export function buildRevenusSheet(project: Project, results: ProjectResults): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  setLabel(ws, 0, 1, "FinAxis — Revenus");

  setLabel(ws, 0, 3, "Source");
  MONTH_COLS.forEach((col, i) => setLabel(ws, col, 3, MONTH_NAMES[i]));
  setLabel(ws, 13, 3, "Total Année 1");

  const { revenue } = results;

  for (let i = 0; i < MAX_SOURCES; i++) {
    const row = 4 + i;
    const hypRow = HYP_SOURCES_ROW + i;
    const source = project.revenueSources[i];
    const bySource = revenue.bySourceMonthlyYear1[i];
    setFormula(ws, 0, row, `Hyp!B${hypRow}`, 0); // le nom est un texte : la valeur cache n'est pas affichée telle quelle par Excel, qui recalcule le texte depuis la formule dès l'ouverture
    let sourceTotal = 0;
    MONTH_COLS.forEach((col, m) => {
      const colLetter = XLSX.utils.encode_col(col);
      const formula = `(Hyp!$D$${hypRow}+(Hyp!$E$${hypRow}-Hyp!$D$${hypRow})*(COLUMN()-2)/11)*Hyp!$C$${hypRow}*Hyp!${colLetter}$${HYP_COEF_ROW}`;
      const value = bySource?.monthly[m] ?? 0;
      sourceTotal += value;
      setFormula(ws, col, row, formula, value, EUR_FORMAT);
    });
    setFormula(ws, 13, row, `SUM(B${row}:M${row})`, sourceTotal, EUR_FORMAT);
    void source;
  }

  const totalRow = 15;
  setLabel(ws, 0, totalRow, "Total CA mensuel");
  MONTH_COLS.forEach((col, m) => {
    const colLetter = XLSX.utils.encode_col(col);
    setFormula(ws, col, totalRow, `SUM(${colLetter}4:${colLetter}13)`, revenue.totalMonthlyYear1[m], EUR_FORMAT);
  });
  setFormula(ws, 13, totalRow, `SUM(B${totalRow}:M${totalRow})`, revenue.totalYear1, EUR_FORMAT);

  setLabel(ws, 0, 17, "Total Année 2");
  setFormula(ws, 13, 17, `N${totalRow}*(1+Hyp!$B$9/100)`, revenue.totalYear2, EUR_FORMAT);
  setLabel(ws, 0, 18, "Total Année 3");
  setFormula(ws, 13, 18, `N17*(1+Hyp!$B$10/100)`, revenue.totalYear3, EUR_FORMAT);

  // Volumes mensuels par source (unités vendues), utilisés par les charges variables "à l'unité"
  setLabel(ws, 0, 20, "Volumes mensuels par source (unités)");
  setLabel(ws, 0, 21, "Source");
  MONTH_COLS.forEach((col, i) => setLabel(ws, col, 21, MONTH_NAMES[i]));

  const volumesByMonth: number[] = new Array(12).fill(0);
  for (let i = 0; i < MAX_SOURCES; i++) {
    const row = 22 + i;
    const hypRow = HYP_SOURCES_ROW + i;
    const source = project.revenueSources[i];
    setFormula(ws, 0, row, `Hyp!B${hypRow}`, 0);
    MONTH_COLS.forEach((col, m) => {
      const formula = `Hyp!$D$${hypRow}+(Hyp!$E$${hypRow}-Hyp!$D$${hypRow})*(COLUMN()-2)/11`;
      const value = source ? sourceVolumeAtMonth(source.volumeM1, source.volumeM12, m + 1) : 0;
      volumesByMonth[m] += value;
      setFormula(ws, col, row, formula, value);
    });
  }

  setLabel(ws, 0, 33, "Volume total");
  MONTH_COLS.forEach((col, m) => {
    const colLetter = XLSX.utils.encode_col(col);
    setFormula(ws, col, 33, `SUM(${colLetter}22:${colLetter}31)`, volumesByMonth[m]);
  });

  finalizeSheet(ws);
  return ws;
}

export function buildFinancementSheet(project: Project, results: ProjectResults): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  setLabel(ws, 0, 1, "FinAxis — Plan de financement");

  const { financing } = results;

  setLabel(ws, 0, 3, "Besoins");
  setLabel(ws, 0, 4, "Investissements");
  setFormula(
    ws,
    1,
    4,
    `SUM(Hyp!C${HYP_INVEST_ROW}:C${HYP_INVEST_ROW + MAX_INVESTMENTS - 1})`,
    financing.needs.investments,
    EUR_FORMAT
  );
  setLabel(ws, 0, 5, "Besoin en fonds de roulement (BFR, 1 mois de charges)");
  setFormula(
    ws,
    1,
    5,
    `SUM(Hyp!C${HYP_FIXED_ROW}:C${HYP_FIXED_ROW + MAX_FIXED - 1})+CR!B5/12`,
    financing.needs.workingCapital,
    EUR_FORMAT
  );
  setLabel(ws, 0, 6, "Trésorerie de départ");
  setFormula(ws, 1, 6, "Hyp!B7", financing.needs.initialCash, EUR_FORMAT);
  setLabel(ws, 0, 7, "Total besoins");
  setFormula(ws, 1, 7, "SUM(B4:B6)", financing.needs.total, EUR_FORMAT);

  setLabel(ws, 0, 9, "Ressources");
  setLabel(ws, 0, 10, "Apport personnel");
  setFormula(ws, 1, 10, "Hyp!B89", financing.resources.personalContribution, EUR_FORMAT);
  setLabel(ws, 0, 11, "Prêt d'honneur");
  setFormula(ws, 1, 11, "Hyp!B90", financing.resources.honorLoan, EUR_FORMAT);
  setLabel(ws, 0, 12, "Emprunt bancaire");
  setFormula(ws, 1, 12, "Hyp!B91", financing.resources.bankLoan, EUR_FORMAT);
  setLabel(ws, 0, 13, "Subventions");
  setFormula(ws, 1, 13, "Hyp!B94", financing.resources.subsidies, EUR_FORMAT);
  setLabel(ws, 0, 14, "Total ressources");
  setFormula(ws, 1, 14, "SUM(B10:B13)", financing.resources.total, EUR_FORMAT);

  setLabel(ws, 0, 16, "Écart (ressources − besoins)");
  setFormula(ws, 1, 16, "B14-B7", financing.gap, EUR_FORMAT);

  // Taux mensuel et mensualité de l'emprunt (cellules d'aide)
  const monthlyRate = project.financing.bankLoan.annualRate / 100 / 12;
  setLabel(ws, 8, 1, "Taux mensuel");
  setFormula(ws, 9, 1, "Hyp!B92/100/12", monthlyRate);
  setLabel(ws, 8, 2, "Mensualité");
  setFormula(
    ws,
    9,
    2,
    "IF(OR(Hyp!B91<=0,Hyp!B93<=0),0,IF(J1=0,Hyp!B91/Hyp!B93,PMT(J1,Hyp!B93,-Hyp!B91)))",
    financing.monthlyPayment,
    EUR_FORMAT
  );

  setLabel(ws, 0, 18, "Tableau d'amortissement de l'emprunt bancaire");
  setLabel(ws, 0, 19, "Période");
  setLabel(ws, 1, 19, "Capital restant dû (début)");
  setLabel(ws, 2, 19, "Échéance");
  setLabel(ws, 3, 19, "Capital remboursé");
  setLabel(ws, 4, 19, "Intérêts");
  setLabel(ws, 5, 19, "Capital en fin");

  const firstDataRow = 20;
  const months = project.financing.bankLoan.months;
  for (let period = 1; period <= LOAN_MONTHS_TEMPLATE; period++) {
    const row = firstDataRow + period - 1;
    // Au-delà de la durée réelle de l'emprunt (mais dans les 60 lignes du
    // gabarit), tout reste à 0 — l'emprunt est déjà soldé, comme le
    // calculerait la formule elle-même (IF(période<=durée,...,0)).
    const scheduleRow = period <= months ? results.financing.amortizationSchedule[period - 1] : undefined;
    const start = scheduleRow?.remainingCapitalStart ?? 0;
    const payment = scheduleRow?.payment ?? 0;
    const principal = scheduleRow?.principal ?? 0;
    const interest = scheduleRow?.interest ?? 0;
    const end = scheduleRow?.remainingCapitalEnd ?? 0;

    setValue(ws, 0, row, period);
    if (period === 1) {
      setFormula(ws, 1, row, "Hyp!$B$91", start, EUR_FORMAT);
    } else {
      setFormula(ws, 1, row, `F${row - 1}`, start, EUR_FORMAT);
    }
    setFormula(ws, 2, row, `IF(A${row}<=Hyp!$B$93,$J$2,0)`, payment, EUR_FORMAT);
    setFormula(ws, 4, row, `B${row}*$J$1`, interest, EUR_FORMAT);
    setFormula(ws, 3, row, `IF(A${row}<=Hyp!$B$93,MIN(C${row}-E${row},B${row}),0)`, principal, EUR_FORMAT);
    setFormula(ws, 5, row, `MAX(B${row}-D${row},0)`, end, EUR_FORMAT);
  }

  // Sous-totaux d'intérêts par année, utilisés par le compte de résultat
  const yearInterestRow = firstDataRow + LOAN_MONTHS_TEMPLATE + 1;
  setLabel(ws, 0, yearInterestRow, "Intérêts Année 1");
  setFormula(
    ws,
    1,
    yearInterestRow,
    `SUM(E${firstDataRow}:E${firstDataRow + 11})`,
    financing.yearlyInterest[0].interest,
    EUR_FORMAT
  );
  setLabel(ws, 0, yearInterestRow + 1, "Intérêts Année 2");
  setFormula(
    ws,
    1,
    yearInterestRow + 1,
    `SUM(E${firstDataRow + 12}:E${firstDataRow + 23})`,
    financing.yearlyInterest[1].interest,
    EUR_FORMAT
  );
  setLabel(ws, 0, yearInterestRow + 2, "Intérêts Année 3");
  setFormula(
    ws,
    1,
    yearInterestRow + 2,
    `SUM(E${firstDataRow + 24}:E${firstDataRow + 35})`,
    financing.yearlyInterest[2].interest,
    EUR_FORMAT
  );

  finalizeSheet(ws);
  return ws;
}

export const FIN_INTEREST_Y1_ROW = 20 + LOAN_MONTHS_TEMPLATE + 1;

export function buildCompteResultatSheet(results: ProjectResults): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  setLabel(ws, 0, 1, "FinAxis — Compte de résultat");

  setLabel(ws, 1, 3, "Année 1");
  setLabel(ws, 2, 3, "Année 2");
  setLabel(ws, 3, 3, "Année 3");

  const [y1, y2, y3] = results.incomeStatement.years;

  setLabel(ws, 0, 4, "Produits d'exploitation");
  setFormula(ws, 1, 4, "Revenus!N15", y1.revenue, EUR_FORMAT);
  setFormula(ws, 2, 4, "Revenus!N17", y2.revenue, EUR_FORMAT);
  setFormula(ws, 3, 4, "Revenus!N18", y3.revenue, EUR_FORMAT);

  const pctSum = `SUMIF(Hyp!$C$${HYP_VARIABLE_ROW}:$C$${HYP_VARIABLE_ROW + MAX_VARIABLE - 1},"percent",Hyp!$D$${HYP_VARIABLE_ROW}:$D$${HYP_VARIABLE_ROW + MAX_VARIABLE - 1})`;
  const unitSum = `SUMIF(Hyp!$C$${HYP_VARIABLE_ROW}:$C$${HYP_VARIABLE_ROW + MAX_VARIABLE - 1},"unit",Hyp!$E$${HYP_VARIABLE_ROW}:$E$${HYP_VARIABLE_ROW + MAX_VARIABLE - 1})`;

  setLabel(ws, 0, 5, "Charges variables");
  setFormula(ws, 1, 5, `(${pctSum}/100)*B4+${unitSum}*Revenus!$N$33`, y1.variableExpenses, EUR_FORMAT);
  setFormula(ws, 2, 5, "IF(B4=0,0,B5*(C4/B4))", y2.variableExpenses, EUR_FORMAT);
  setFormula(ws, 3, 5, "IF(B4=0,0,B5*(D4/B4))", y3.variableExpenses, EUR_FORMAT);

  setLabel(ws, 0, 6, "Marge sur coûts variables");
  setFormula(ws, 1, 6, "B4-B5", y1.contributionMargin, EUR_FORMAT);
  setFormula(ws, 2, 6, "C4-C5", y2.contributionMargin, EUR_FORMAT);
  setFormula(ws, 3, 6, "D4-D5", y3.contributionMargin, EUR_FORMAT);

  const fixedAnnual = `SUM(Hyp!$C$${HYP_FIXED_ROW}:$C$${HYP_FIXED_ROW + MAX_FIXED - 1})*12`;
  const depreciation = (yearCol: string) =>
    `SUMPRODUCT((Hyp!$D$${HYP_INVEST_ROW}:$D$${HYP_INVEST_ROW + MAX_INVESTMENTS - 1}>=${yearCol})*Hyp!$C$${HYP_INVEST_ROW}:$C$${HYP_INVEST_ROW + MAX_INVESTMENTS - 1}/(Hyp!$D$${HYP_INVEST_ROW}:$D$${HYP_INVEST_ROW + MAX_INVESTMENTS - 1}+(Hyp!$D$${HYP_INVEST_ROW}:$D$${HYP_INVEST_ROW + MAX_INVESTMENTS - 1}=0)))`;

  setLabel(ws, 0, 7, "Charges fixes (dont dotations aux amortissements)");
  setFormula(ws, 1, 7, `${fixedAnnual}+${depreciation("1")}`, y1.fixedExpenses, EUR_FORMAT);
  setFormula(ws, 2, 7, `${fixedAnnual}+${depreciation("2")}`, y2.fixedExpenses, EUR_FORMAT);
  setFormula(ws, 3, 7, `${fixedAnnual}+${depreciation("3")}`, y3.fixedExpenses, EUR_FORMAT);

  setLabel(ws, 0, 8, "Résultat d'exploitation");
  setFormula(ws, 1, 8, "B6-B7", y1.operatingResult, EUR_FORMAT);
  setFormula(ws, 2, 8, "C6-C7", y2.operatingResult, EUR_FORMAT);
  setFormula(ws, 3, 8, "D6-D7", y3.operatingResult, EUR_FORMAT);

  setLabel(ws, 0, 9, "Intérêts d'emprunt");
  setFormula(ws, 1, 9, `Financement!B${FIN_INTEREST_Y1_ROW}`, y1.interest, EUR_FORMAT);
  setFormula(ws, 2, 9, `Financement!B${FIN_INTEREST_Y1_ROW + 1}`, y2.interest, EUR_FORMAT);
  setFormula(ws, 3, 9, `Financement!B${FIN_INTEREST_Y1_ROW + 2}`, y3.interest, EUR_FORMAT);

  const isFormula = (rbtCell: string) =>
    `IF(${rbtCell}<=0,0,IF(${rbtCell}<=Hyp!$B$14,${rbtCell}*Hyp!$B$12/100,Hyp!$B$14*Hyp!$B$12/100+(${rbtCell}-Hyp!$B$14)*Hyp!$B$13/100))`;

  setLabel(ws, 0, 10, "Résultat avant impôt");
  setFormula(ws, 1, 10, "B8-B9", y1.resultBeforeTax, EUR_FORMAT);
  setFormula(ws, 2, 10, "C8-C9", y2.resultBeforeTax, EUR_FORMAT);
  setFormula(ws, 3, 10, "D8-D9", y3.resultBeforeTax, EUR_FORMAT);

  setLabel(ws, 0, 11, "Impôt sur les sociétés");
  setFormula(ws, 1, 11, isFormula("B10"), y1.corporateTax, EUR_FORMAT);
  setFormula(ws, 2, 11, isFormula("C10"), y2.corporateTax, EUR_FORMAT);
  setFormula(ws, 3, 11, isFormula("D10"), y3.corporateTax, EUR_FORMAT);

  setLabel(ws, 0, 12, "Résultat net");
  setFormula(ws, 1, 12, "B10-B11", y1.netResult, EUR_FORMAT);
  setFormula(ws, 2, 12, "C10-C11", y2.netResult, EUR_FORMAT);
  setFormula(ws, 3, 12, "D10-D11", y3.netResult, EUR_FORMAT);

  finalizeSheet(ws);
  return ws;
}

export function buildTresorerieSheet(results: ProjectResults): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  setLabel(ws, 0, 1, "FinAxis — Trésorerie (année 1)");

  setLabel(ws, 0, 3, "Mois");
  setLabel(ws, 1, 3, "Encaissements TTC");
  setLabel(ws, 2, 3, "Décaissements TTC");
  setLabel(ws, 3, 3, "TVA nette");
  setLabel(ws, 4, 3, "Flux net");
  setLabel(ws, 5, 3, "Trésorerie cumulée");
  setLabel(ws, 6, 3, "Crédit TVA reporté (aide)");
  setLabel(ws, 7, 3, "Achats HT (aide)");
  setLabel(ws, 8, 3, "CA HT (aide)");

  const pctSum = `SUMIF(Hyp!$C$${HYP_VARIABLE_ROW}:$C$${HYP_VARIABLE_ROW + MAX_VARIABLE - 1},"percent",Hyp!$D$${HYP_VARIABLE_ROW}:$D$${HYP_VARIABLE_ROW + MAX_VARIABLE - 1})`;
  const unitSum = `SUMIF(Hyp!$C$${HYP_VARIABLE_ROW}:$C$${HYP_VARIABLE_ROW + MAX_VARIABLE - 1},"unit",Hyp!$E$${HYP_VARIABLE_ROW}:$E$${HYP_VARIABLE_ROW + MAX_VARIABLE - 1})`;
  const fixedMonthly = `SUM(Hyp!$C$${HYP_FIXED_ROW}:$C$${HYP_FIXED_ROW + MAX_FIXED - 1})`;
  const investmentsTotal = `SUM(Hyp!$C$${HYP_INVEST_ROW}:$C$${HYP_INVEST_ROW + MAX_INVESTMENTS - 1})`;

  const { revenue, expenses, vat, cashFlow } = results;
  const investmentsMonth1 = results.financing.needs.investments;

  for (let month = 1; month <= 12; month++) {
    const row = 3 + month;
    const i = month - 1;
    setLabel(ws, 0, row, MONTH_NAMES[i]);

    const caHT = revenue.totalMonthlyYear1[i];
    const achatsHT = expenses.variableMonthlyYear1[i] + expenses.totalFixedMonthly + (i === 0 ? investmentsMonth1 : 0);

    setFormula(ws, 8, row, `INDEX(Revenus!$B$15:$M$15,ROW()-3)`, caHT, EUR_FORMAT);
    setFormula(
      ws,
      7,
      row,
      `${fixedMonthly}+(${pctSum}/100)*I${row}+${unitSum}*INDEX(Revenus!$B$33:$M$33,ROW()-3)+IF(ROW()=4,${investmentsTotal},0)`,
      achatsHT,
      EUR_FORMAT
    );

    setFormula(ws, 1, row, `I${row}*(1+Hyp!$B$11/100)`, cashFlow.months[i].cashIn, EUR_FORMAT);
    setFormula(
      ws,
      2,
      row,
      `H${row}*(1+Hyp!$B$11/100)+INDEX(Financement!$C$20:$C$79,ROW()-3)`,
      cashFlow.months[i].cashOut,
      EUR_FORMAT
    );

    const collected = `I${row}*Hyp!$B$11/100`;
    const deductible = `H${row}*Hyp!$B$11/100`;
    const prevCredit = month === 1 ? "0" : `G${row - 1}`;
    const netBeforeCap = `(${collected})-(${deductible})-(${prevCredit})`;

    setFormula(ws, 3, row, `MAX(${netBeforeCap},0)`, vat.months[i].netDue, EUR_FORMAT);
    setFormula(ws, 6, row, `MAX(-(${netBeforeCap}),0)`, vat.months[i].creditCarriedForward, EUR_FORMAT);

    setFormula(ws, 4, row, `B${row}-C${row}-D${row}`, cashFlow.months[i].netFlow, EUR_FORMAT);
    setFormula(
      ws,
      5,
      row,
      month === 1 ? `Hyp!$B$7+E${row}` : `F${row - 1}+E${row}`,
      cashFlow.months[i].cumulativeCash,
      EUR_FORMAT
    );
  }

  finalizeSheet(ws);
  return ws;
}

export function buildSeuilSheet(results: ProjectResults): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  setLabel(ws, 0, 1, "FinAxis — Seuil de rentabilité");

  setLabel(ws, 1, 3, "Année 1");
  setLabel(ws, 2, 3, "Année 2");
  setLabel(ws, 3, 3, "Année 3");

  const cols = ["B", "C", "D"];
  const years = results.incomeStatement.years;
  const breakEven = results.breakEven.years;

  setLabel(ws, 0, 4, "Marge sur coûts variables");
  cols.forEach((c, i) => setFormula(ws, i + 1, 4, `CR!${c}6`, years[i].contributionMargin, EUR_FORMAT));

  setLabel(ws, 0, 5, "Taux de marge sur coûts variables");
  cols.forEach((c, i) =>
    setFormula(ws, i + 1, 5, `IF(CR!${c}4=0,0,${c}4/CR!${c}4)`, pct(years[i].contributionMargin, years[i].revenue), PCT_FORMAT)
  );

  setLabel(ws, 0, 6, "Charges fixes");
  cols.forEach((c, i) => setFormula(ws, i + 1, 6, `CR!${c}7`, years[i].fixedExpenses, EUR_FORMAT));

  setLabel(ws, 0, 7, "Seuil de rentabilité");
  cols.forEach((c, i) => setFormula(ws, i + 1, 7, `IF(${c}5=0,0,${c}6/${c}5)`, breakEven[i].breakEvenRevenue, EUR_FORMAT));

  setLabel(ws, 0, 8, "Point mort (jours)");
  cols.forEach((c, i) =>
    setFormula(ws, i + 1, 8, `IF(CR!${c}4=0,0,MIN(${c}7/CR!${c}4*360,360))`, breakEven[i].breakEvenDays)
  );

  setLabel(ws, 0, 9, "Équivalent MRR");
  cols.forEach((c, i) => setFormula(ws, i + 1, 9, `${c}7/12`, breakEven[i].mrrEquivalent, EUR_FORMAT));

  finalizeSheet(ws);
  return ws;
}

export function buildKpiSheet(results: ProjectResults): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  setLabel(ws, 0, 1, "FinAxis — KPIs");

  const y1 = results.incomeStatement.years[0];

  setLabel(ws, 0, 3, "CA annuel Année 1");
  setFormula(ws, 1, 3, "CR!B4", y1.revenue, EUR_FORMAT);
  setLabel(ws, 0, 4, "Résultat net Année 1");
  setFormula(ws, 1, 4, "CR!B12", y1.netResult, EUR_FORMAT);
  setLabel(ws, 0, 5, "Trésorerie fin Année 1");
  setFormula(ws, 1, 5, "Tresorerie!F15", results.cashFlow.endOfYearCash, EUR_FORMAT);
  setLabel(ws, 0, 6, "Charges totales Année 1");
  setFormula(ws, 1, 6, "CR!B5+CR!B7", y1.variableExpenses + y1.fixedExpenses, EUR_FORMAT);
  setLabel(ws, 0, 7, "Taux de marge brute");
  setFormula(ws, 1, 7, "IF(CR!B4=0,0,CR!B6/CR!B4)", results.incomeStatement.grossMarginRate, PCT_FORMAT);
  setLabel(ws, 0, 8, "Marge nette");
  setFormula(ws, 1, 8, "IF(CR!B4=0,0,CR!B12/CR!B4)", results.incomeStatement.netMarginRate, PCT_FORMAT);
  setLabel(ws, 0, 9, "Seuil de rentabilité Année 1");
  setFormula(ws, 1, 9, "Seuil!B7", results.breakEven.years[0].breakEvenRevenue, EUR_FORMAT);
  setLabel(ws, 0, 10, "Point mort Année 1 (jours)");
  setFormula(ws, 1, 10, "Seuil!B8", results.breakEven.years[0].breakEvenDays);

  finalizeSheet(ws);
  return ws;
}

/**
 * Onglet « Suivi réel vs budget » : à remplir mois par mois une fois
 * l'activité démarrée. Le budget est repris automatiquement des onglets
 * Revenus/Trésorerie ; seules les lignes « Réel (à saisir) » sont des
 * valeurs éditables (0 par défaut), l'écart se calcule tout seul.
 */
export function buildSuiviSheet(results: ProjectResults): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  setLabel(ws, 0, 1, "FinAxis — Suivi réel vs budget (année 1)");
  setLabel(
    ws,
    0,
    2,
    "À compléter mois par mois avec vos chiffres réels une fois l'activité démarrée — les écarts se calculent automatiquement."
  );

  MONTH_COLS.forEach((col, i) => setLabel(ws, col, 4, MONTH_NAMES[i]));

  function block(startRow: number, title: string, budgetByMonth: number[]) {
    setLabel(ws, 0, startRow, title);
    setLabel(ws, 0, startRow + 1, "Budget (prévisionnel)");
    setLabel(ws, 0, startRow + 2, "Réel (à saisir)");
    setLabel(ws, 0, startRow + 3, "Écart (Réel − Budget)");
    MONTH_COLS.forEach((col, m) => {
      const colLetter = XLSX.utils.encode_col(col);
      const budget = budgetByMonth[m];
      setFormula(ws, col, startRow + 1, budgetFormula(col, title), budget, EUR_FORMAT);
      setValue(ws, col, startRow + 2, 0, EUR_FORMAT);
      setFormula(ws, col, startRow + 3, `${colLetter}${startRow + 2}-${colLetter}${startRow + 1}`, -budget, EUR_FORMAT);
    });
    return startRow + 5;
  }

  function budgetFormula(col: number, title: string): string {
    const colLetter = XLSX.utils.encode_col(col);
    if (title.startsWith("CHIFFRE")) return `Revenus!${colLetter}15`;
    const trRow = 3 + col;
    return `Tresorerie!F${trRow}`;
  }

  let row = 6;
  row = block(row, "CHIFFRE D'AFFAIRES HT", results.revenue.totalMonthlyYear1);
  block(
    row,
    "TRÉSORERIE CUMULÉE",
    results.cashFlow.months.map((m) => m.cumulativeCash)
  );

  finalizeSheet(ws);
  return ws;
}

/**
 * Onglet « Synthèse » : chiffres clés et tableaux prêts à sélectionner
 * pour insérer un graphique (Insertion > Graphique dans Excel/Sheets).
 * Contrairement au classeur de référence, ce classeur n'embarque pas de
 * graphique natif : la bibliothèque de génération xlsx utilisée par le
 * site (SheetJS, édition communautaire) ne sait pas écrire d'objets
 * graphique dans le fichier — seule la version payante le permet. Les
 * données sont donc livrées toutes prêtes, à un clic d'un graphique.
 */
export function buildSyntheseSheet(project: Project, results: ProjectResults): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  setLabel(ws, 0, 1, "FinAxis — Synthèse");
  setLabel(
    ws,
    0,
    2,
    "Chiffres clés et tableaux prêts à transformer en graphique (sélectionnez une plage puis Insertion > Graphique)."
  );

  const years = results.incomeStatement.years;
  const y3 = years[2];

  setLabel(ws, 0, 4, "CHIFFRES CLÉS");
  setLabel(ws, 0, 5, "CA HT Année 3");
  setFormula(ws, 1, 5, "CR!D4", y3.revenue, EUR_FORMAT);
  setLabel(ws, 0, 6, "Résultat net Année 3");
  setFormula(ws, 1, 6, "CR!D12", y3.netResult, EUR_FORMAT);
  setLabel(ws, 0, 7, "Marge nette Année 3");
  setFormula(ws, 1, 7, "IF(CR!D4=0,0,CR!D12/CR!D4)", pct(y3.netResult, y3.revenue), PCT_FORMAT);
  setLabel(ws, 0, 8, "Trésorerie fin Année 1");
  setFormula(ws, 1, 8, "Tresorerie!F15", results.cashFlow.endOfYearCash, EUR_FORMAT);
  setLabel(ws, 0, 9, "Point mort Année 1 (jours)");
  setFormula(ws, 1, 9, "Seuil!B8", results.breakEven.years[0].breakEvenDays);

  setLabel(ws, 0, 11, "CHIFFRE D'AFFAIRES HT PAR SOURCE — 3 ANS");
  setLabel(ws, 1, 12, "Année 1");
  setLabel(ws, 2, 12, "Année 2");
  setLabel(ws, 3, 12, "Année 3");
  // Mêmes taux de croissance globaux que Revenus!N17/N18 (Hyp!$B$9/$B$10),
  // appliqués par source : cohérent avec la formule de la feuille Synthese.
  const growthY2 = YEAR2_GROWTH;
  const growthY3 = YEAR3_GROWTH;
  const sourceYear1: number[] = [];
  for (let i = 0; i < MAX_SOURCES; i++) {
    const row = 13 + i;
    const revenusRow = 4 + i;
    const hypRow = HYP_SOURCES_ROW + i;
    const source = project.revenueSources[i];
    const y1Value = results.revenue.bySourceMonthlyYear1[i]?.monthly.reduce((a, b) => a + b, 0) ?? 0;
    sourceYear1.push(y1Value);
    const y2Value = source ? y1Value * (1 + growthY2) : 0;
    const y3Value = source ? y2Value * (1 + growthY3) : 0;
    setFormula(ws, 0, row, `IF(Hyp!B${hypRow}="","",Hyp!B${hypRow})`, 0);
    setFormula(ws, 1, row, `IF($A${row}="","",Revenus!N${revenusRow})`, source ? y1Value : 0, EUR_FORMAT);
    setFormula(ws, 2, row, `IF($A${row}="","",B${row}*(1+Hyp!$B$9/100))`, source ? y2Value : 0, EUR_FORMAT);
    setFormula(ws, 3, row, `IF($A${row}="","",C${row}*(1+Hyp!$B$10/100))`, source ? y3Value : 0, EUR_FORMAT);
  }
  const totalSourcesRow = 13 + MAX_SOURCES;
  setLabel(ws, 0, totalSourcesRow, "Total");
  setFormula(ws, 1, totalSourcesRow, "CR!B4", years[0].revenue, EUR_FORMAT);
  setFormula(ws, 2, totalSourcesRow, "CR!C4", years[1].revenue, EUR_FORMAT);
  setFormula(ws, 3, totalSourcesRow, "CR!D4", years[2].revenue, EUR_FORMAT);

  const repartitionRow = totalSourcesRow + 2;
  setLabel(ws, 0, repartitionRow, "RÉPARTITION DU CA — ANNÉE 3");
  for (let i = 0; i < MAX_SOURCES; i++) {
    const row = repartitionRow + 1 + i;
    const sourceRow = 13 + i;
    const source = project.revenueSources[i];
    const y1Value = sourceYear1[i];
    const y3Value = source ? y1Value * (1 + growthY2) * (1 + growthY3) : 0;
    setFormula(ws, 0, row, `IF($A$${sourceRow}="","",$A$${sourceRow})`, 0);
    setFormula(
      ws,
      1,
      row,
      `IF($A${row}="","",IF(D$${totalSourcesRow}=0,0,D${sourceRow}/D$${totalSourcesRow}))`,
      source ? pct(y3Value, years[2].revenue) : 0,
      PCT_FORMAT
    );
  }

  const tresoRow = repartitionRow + 2 + MAX_SOURCES;
  setLabel(ws, 0, tresoRow, "TRÉSORERIE CUMULÉE — ANNÉE 1");
  MONTH_COLS.forEach((col, i) => setLabel(ws, col - 1, tresoRow + 1, MONTH_NAMES[i]));
  MONTH_COLS.forEach((col, i) => {
    setFormula(ws, col - 1, tresoRow + 2, `Tresorerie!F${4 + i}`, results.cashFlow.months[i].cumulativeCash, EUR_FORMAT);
  });

  const resultRow = tresoRow + 4;
  setLabel(ws, 0, resultRow, "RÉSULTAT NET — 3 ANS");
  setLabel(ws, 1, resultRow + 1, "Année 1");
  setLabel(ws, 2, resultRow + 1, "Année 2");
  setLabel(ws, 3, resultRow + 1, "Année 3");
  setFormula(ws, 1, resultRow + 2, "CR!B12", years[0].netResult, EUR_FORMAT);
  setFormula(ws, 2, resultRow + 2, "CR!C12", years[1].netResult, EUR_FORMAT);
  setFormula(ws, 3, resultRow + 2, "CR!D12", years[2].netResult, EUR_FORMAT);

  finalizeSheet(ws);
  return ws;
}
