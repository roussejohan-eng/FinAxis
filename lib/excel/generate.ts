import * as XLSX from "xlsx";
import type { Project } from "@/lib/finance/types";
import type { ProjectResults } from "@/lib/finance";
import { SEASONALITY_COEFFICIENTS, SEASONALITY_LABELS } from "@/lib/finance/seasonality";
import { EUR_FORMAT, PCT_FORMAT, finalizeSheet, setFormula, setLabel, setValue } from "./sheet-helpers";

// -- Gabarit de la feuille "Hypothèses" --------------------------------
// Nombre de lignes réservées par tableau : les lignes en excédent restent
// vides (et valent 0 dans les formules SUM/SUMIF), ce qui permet à
// l'utilisateur d'ajouter des lignes dans la plage réservée sans casser
// les formules des autres feuilles.
const MAX_SOURCES = 10;
const MAX_FIXED = 20;
const MAX_VARIABLE = 20;
const MAX_INVESTMENTS = 10;
const LOAN_MONTHS_TEMPLATE = 60;

const HYP_SOURCES_ROW = 18; // 18..27
const HYP_FIXED_ROW = 31; // 31..50
const HYP_VARIABLE_ROW = 54; // 54..73
const HYP_INVEST_ROW = 77; // 77..86
const HYP_COEF_LABEL_ROW = 97;
const HYP_COEF_ROW = 98;

const MONTH_COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // colonnes B..M (0-indexées à partir de B=1)
const MONTH_NAMES = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function buildHypSheet(project: Project): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};

  setLabel(ws, 0, 1, "FinAxis — Hypothèses du projet");
  setLabel(ws, 0, 3, "Nom du projet");
  setValue(ws, 1, 3, project.name || "Projet sans nom");
  setLabel(ws, 0, 4, "Secteur d'activité");
  setValue(ws, 1, 4, project.sector);
  setLabel(ws, 0, 5, "Statut juridique");
  setValue(ws, 1, 5, project.legalStatus);
  setLabel(ws, 0, 6, "Date de démarrage");
  setValue(ws, 1, 6, project.startDate);
  setLabel(ws, 0, 7, "Trésorerie de départ (€)");
  setValue(ws, 1, 7, project.initialCash, EUR_FORMAT);
  setLabel(ws, 0, 8, "Profil de saisonnalité");
  setValue(ws, 1, 8, SEASONALITY_LABELS[project.seasonality]);
  setLabel(ws, 0, 9, "Croissance Année 2 (%)");
  setValue(ws, 1, 9, 30);
  setLabel(ws, 0, 10, "Croissance Année 3 (%)");
  setValue(ws, 1, 10, 25);
  setLabel(ws, 0, 11, "Taux de TVA (%)");
  setValue(ws, 1, 11, 20);
  setLabel(ws, 0, 12, "Taux IS réduit (%)");
  setValue(ws, 1, 12, 15);
  setLabel(ws, 0, 13, "Taux IS normal (%)");
  setValue(ws, 1, 13, 25);
  setLabel(ws, 0, 14, "Seuil IS réduit (€)");
  setValue(ws, 1, 14, 42500, EUR_FORMAT);

  // Sources de revenus
  setLabel(ws, 0, 16, "Sources de revenus");
  setLabel(ws, 1, 17, "Nom");
  setLabel(ws, 2, 17, "Prix unitaire HT");
  setLabel(ws, 3, 17, "Volume M1");
  setLabel(ws, 4, 17, "Volume M12");
  setLabel(ws, 5, 17, "Type");
  for (let i = 0; i < MAX_SOURCES; i++) {
    const row = HYP_SOURCES_ROW + i;
    const source = project.revenueSources[i];
    if (source) {
      setValue(ws, 1, row, source.name);
      setValue(ws, 2, row, source.unitPrice, EUR_FORMAT);
      setValue(ws, 3, row, source.volumeM1);
      setValue(ws, 4, row, source.volumeM12);
      setValue(ws, 5, row, source.type);
    }
  }

  // Charges fixes
  setLabel(ws, 0, 29, "Charges fixes");
  setLabel(ws, 1, 30, "Nom");
  setLabel(ws, 2, 30, "Montant mensuel HT");
  setLabel(ws, 3, 30, "Catégorie");
  for (let i = 0; i < MAX_FIXED; i++) {
    const row = HYP_FIXED_ROW + i;
    const expense = project.fixedExpenses[i];
    if (expense) {
      setValue(ws, 1, row, expense.name);
      setValue(ws, 2, row, expense.monthlyAmount, EUR_FORMAT);
      setValue(ws, 3, row, expense.category);
    }
  }

  // Charges variables
  setLabel(ws, 0, 52, "Charges variables");
  setLabel(ws, 1, 53, "Nom");
  setLabel(ws, 2, 53, "Mode (percent / unit)");
  setLabel(ws, 3, 53, "% du CA");
  setLabel(ws, 4, 53, "Coût unitaire HT");
  setLabel(ws, 5, 53, "Catégorie");
  for (let i = 0; i < MAX_VARIABLE; i++) {
    const row = HYP_VARIABLE_ROW + i;
    const expense = project.variableExpenses[i];
    if (expense) {
      setValue(ws, 1, row, expense.name);
      setValue(ws, 2, row, expense.mode);
      setValue(ws, 3, row, expense.percentOfRevenue ?? 0);
      setValue(ws, 4, row, expense.unitCost ?? 0, EUR_FORMAT);
      setValue(ws, 5, row, expense.category);
    }
  }

  // Investissements
  setLabel(ws, 0, 75, "Investissements");
  setLabel(ws, 1, 76, "Nom");
  setLabel(ws, 2, 76, "Montant HT");
  setLabel(ws, 3, 76, "Durée amortissement (ans)");
  for (let i = 0; i < MAX_INVESTMENTS; i++) {
    const row = HYP_INVEST_ROW + i;
    const inv = project.investments[i];
    if (inv) {
      setValue(ws, 1, row, inv.name);
      setValue(ws, 2, row, inv.amountHT, EUR_FORMAT);
      setValue(ws, 3, row, inv.amortizationYears);
    }
  }

  // Financement
  setLabel(ws, 0, 88, "Financement");
  setLabel(ws, 0, 89, "Apport personnel (€)");
  setValue(ws, 1, 89, project.financing.personalContribution, EUR_FORMAT);
  setLabel(ws, 0, 90, "Prêt d'honneur (€)");
  setValue(ws, 1, 90, project.financing.honorLoan, EUR_FORMAT);
  setLabel(ws, 0, 91, "Emprunt bancaire — montant (€)");
  setValue(ws, 1, 91, project.financing.bankLoan.amount, EUR_FORMAT);
  setLabel(ws, 0, 92, "Emprunt bancaire — taux annuel (%)");
  setValue(ws, 1, 92, project.financing.bankLoan.annualRate);
  setLabel(ws, 0, 93, "Emprunt bancaire — durée (mois)");
  setValue(ws, 1, 93, project.financing.bankLoan.months);
  setLabel(ws, 0, 94, "Subventions (€)");
  setValue(ws, 1, 94, project.financing.subsidies, EUR_FORMAT);

  // Coefficients de saisonnalité (profil sélectionné), normalisés moyenne = 1
  const coefficients = SEASONALITY_COEFFICIENTS[project.seasonality];
  const avg = coefficients.reduce((a, b) => a + b, 0) / 12;
  setLabel(ws, 0, HYP_COEF_LABEL_ROW - 1, "Coefficients de saisonnalité mensuels (profil sélectionné)");
  MONTH_COLS.forEach((col, i) => {
    setLabel(ws, col, HYP_COEF_LABEL_ROW, MONTH_NAMES[i]);
    setValue(ws, col, HYP_COEF_ROW, Math.round((coefficients[i] / avg) * 1000) / 1000);
  });

  finalizeSheet(ws);
  return ws;
}

function buildRevenusSheet(): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  setLabel(ws, 0, 1, "FinAxis — Revenus");

  setLabel(ws, 0, 3, "Source");
  MONTH_COLS.forEach((col, i) => setLabel(ws, col, 3, MONTH_NAMES[i]));
  setLabel(ws, 13, 3, "Total Année 1");

  for (let i = 0; i < MAX_SOURCES; i++) {
    const row = 4 + i;
    const hypRow = HYP_SOURCES_ROW + i;
    setFormula(ws, 0, row, `Hyp!B${hypRow}`);
    MONTH_COLS.forEach((col) => {
      const colLetter = XLSX.utils.encode_col(col);
      const formula = `(Hyp!$D$${hypRow}+(Hyp!$E$${hypRow}-Hyp!$D$${hypRow})*(COLUMN()-2)/11)*Hyp!$C$${hypRow}*Hyp!${colLetter}$${HYP_COEF_ROW}`;
      setFormula(ws, col, row, formula, EUR_FORMAT);
    });
    setFormula(ws, 13, row, `SUM(B${row}:M${row})`, EUR_FORMAT);
  }

  const totalRow = 15;
  setLabel(ws, 0, totalRow, "Total CA mensuel");
  MONTH_COLS.forEach((col) => {
    const colLetter = XLSX.utils.encode_col(col);
    setFormula(ws, col, totalRow, `SUM(${colLetter}4:${colLetter}13)`, EUR_FORMAT);
  });
  setFormula(ws, 13, totalRow, `SUM(B${totalRow}:M${totalRow})`, EUR_FORMAT);

  setLabel(ws, 0, 17, "Total Année 2");
  setFormula(ws, 13, 17, `N${totalRow}*(1+Hyp!$B$9/100)`, EUR_FORMAT);
  setLabel(ws, 0, 18, "Total Année 3");
  setFormula(ws, 13, 18, `N17*(1+Hyp!$B$10/100)`, EUR_FORMAT);

  // Volumes mensuels par source (unités vendues), utilisés par les charges variables "à l'unité"
  setLabel(ws, 0, 20, "Volumes mensuels par source (unités)");
  setLabel(ws, 0, 21, "Source");
  MONTH_COLS.forEach((col, i) => setLabel(ws, col, 21, MONTH_NAMES[i]));

  for (let i = 0; i < MAX_SOURCES; i++) {
    const row = 22 + i;
    const hypRow = HYP_SOURCES_ROW + i;
    setFormula(ws, 0, row, `Hyp!B${hypRow}`);
    MONTH_COLS.forEach((col) => {
      const formula = `Hyp!$D$${hypRow}+(Hyp!$E$${hypRow}-Hyp!$D$${hypRow})*(COLUMN()-2)/11`;
      setFormula(ws, col, row, formula);
    });
  }

  setLabel(ws, 0, 33, "Volume total");
  MONTH_COLS.forEach((col) => {
    const colLetter = XLSX.utils.encode_col(col);
    setFormula(ws, col, 33, `SUM(${colLetter}22:${colLetter}31)`);
  });

  finalizeSheet(ws);
  return ws;
}

function buildFinancementSheet(): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  setLabel(ws, 0, 1, "FinAxis — Plan de financement");

  setLabel(ws, 0, 3, "Besoins");
  setLabel(ws, 0, 4, "Investissements");
  setFormula(ws, 1, 4, `SUM(Hyp!C${HYP_INVEST_ROW}:C${HYP_INVEST_ROW + MAX_INVESTMENTS - 1})`, EUR_FORMAT);
  setLabel(ws, 0, 5, "Besoin en fonds de roulement (BFR, 1 mois de charges)");
  setFormula(ws, 1, 5, `SUM(Hyp!C${HYP_FIXED_ROW}:C${HYP_FIXED_ROW + MAX_FIXED - 1})+CR!B5/12`, EUR_FORMAT);
  setLabel(ws, 0, 6, "Trésorerie de départ");
  setFormula(ws, 1, 6, "Hyp!B7", EUR_FORMAT);
  setLabel(ws, 0, 7, "Total besoins");
  setFormula(ws, 1, 7, "SUM(B4:B6)", EUR_FORMAT);

  setLabel(ws, 0, 9, "Ressources");
  setLabel(ws, 0, 10, "Apport personnel");
  setFormula(ws, 1, 10, "Hyp!B89", EUR_FORMAT);
  setLabel(ws, 0, 11, "Prêt d'honneur");
  setFormula(ws, 1, 11, "Hyp!B90", EUR_FORMAT);
  setLabel(ws, 0, 12, "Emprunt bancaire");
  setFormula(ws, 1, 12, "Hyp!B91", EUR_FORMAT);
  setLabel(ws, 0, 13, "Subventions");
  setFormula(ws, 1, 13, "Hyp!B94", EUR_FORMAT);
  setLabel(ws, 0, 14, "Total ressources");
  setFormula(ws, 1, 14, "SUM(B10:B13)", EUR_FORMAT);

  setLabel(ws, 0, 16, "Écart (ressources − besoins)");
  setFormula(ws, 1, 16, "B14-B7", EUR_FORMAT);

  // Taux mensuel et mensualité de l'emprunt (cellules d'aide)
  setLabel(ws, 8, 1, "Taux mensuel");
  setFormula(ws, 9, 1, "Hyp!B92/100/12");
  setLabel(ws, 8, 2, "Mensualité");
  setFormula(
    ws,
    9,
    2,
    "IF(OR(Hyp!B91<=0,Hyp!B93<=0),0,IF(J1=0,Hyp!B91/Hyp!B93,PMT(J1,Hyp!B93,-Hyp!B91)))",
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
  for (let period = 1; period <= LOAN_MONTHS_TEMPLATE; period++) {
    const row = firstDataRow + period - 1;
    setValue(ws, 0, row, period);
    if (period === 1) {
      setFormula(ws, 1, row, "Hyp!$B$91", EUR_FORMAT);
    } else {
      setFormula(ws, 1, row, `F${row - 1}`, EUR_FORMAT);
    }
    setFormula(ws, 2, row, `IF(A${row}<=Hyp!$B$93,$J$2,0)`, EUR_FORMAT);
    setFormula(ws, 4, row, `B${row}*$J$1`, EUR_FORMAT);
    setFormula(ws, 3, row, `IF(A${row}<=Hyp!$B$93,MIN(C${row}-E${row},B${row}),0)`, EUR_FORMAT);
    setFormula(ws, 5, row, `MAX(B${row}-D${row},0)`, EUR_FORMAT);
  }

  // Sous-totaux d'intérêts par année, utilisés par le compte de résultat
  const yearInterestRow = firstDataRow + LOAN_MONTHS_TEMPLATE + 1;
  setLabel(ws, 0, yearInterestRow, "Intérêts Année 1");
  setFormula(ws, 1, yearInterestRow, `SUM(E${firstDataRow}:E${firstDataRow + 11})`, EUR_FORMAT);
  setLabel(ws, 0, yearInterestRow + 1, "Intérêts Année 2");
  setFormula(ws, 1, yearInterestRow + 1, `SUM(E${firstDataRow + 12}:E${firstDataRow + 23})`, EUR_FORMAT);
  setLabel(ws, 0, yearInterestRow + 2, "Intérêts Année 3");
  setFormula(ws, 1, yearInterestRow + 2, `SUM(E${firstDataRow + 24}:E${firstDataRow + 35})`, EUR_FORMAT);

  finalizeSheet(ws);
  return ws;
}

const FIN_INTEREST_Y1_ROW = 20 + LOAN_MONTHS_TEMPLATE + 1;

function buildCompteResultatSheet(): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  setLabel(ws, 0, 1, "FinAxis — Compte de résultat");

  setLabel(ws, 1, 3, "Année 1");
  setLabel(ws, 2, 3, "Année 2");
  setLabel(ws, 3, 3, "Année 3");

  setLabel(ws, 0, 4, "Produits d'exploitation");
  setFormula(ws, 1, 4, "Revenus!N15", EUR_FORMAT);
  setFormula(ws, 2, 4, "Revenus!N17", EUR_FORMAT);
  setFormula(ws, 3, 4, "Revenus!N18", EUR_FORMAT);

  const pctSum = `SUMIF(Hyp!$C$${HYP_VARIABLE_ROW}:$C$${HYP_VARIABLE_ROW + MAX_VARIABLE - 1},"percent",Hyp!$D$${HYP_VARIABLE_ROW}:$D$${HYP_VARIABLE_ROW + MAX_VARIABLE - 1})`;
  const unitSum = `SUMIF(Hyp!$C$${HYP_VARIABLE_ROW}:$C$${HYP_VARIABLE_ROW + MAX_VARIABLE - 1},"unit",Hyp!$E$${HYP_VARIABLE_ROW}:$E$${HYP_VARIABLE_ROW + MAX_VARIABLE - 1})`;

  setLabel(ws, 0, 5, "Charges variables");
  setFormula(ws, 1, 5, `(${pctSum}/100)*B4+${unitSum}*Revenus!$N$33`, EUR_FORMAT);
  setFormula(ws, 2, 5, "IF(B4=0,0,B5*(C4/B4))", EUR_FORMAT);
  setFormula(ws, 3, 5, "IF(B4=0,0,B5*(D4/B4))", EUR_FORMAT);

  setLabel(ws, 0, 6, "Marge sur coûts variables");
  setFormula(ws, 1, 6, "B4-B5", EUR_FORMAT);
  setFormula(ws, 2, 6, "C4-C5", EUR_FORMAT);
  setFormula(ws, 3, 6, "D4-D5", EUR_FORMAT);

  const fixedAnnual = `SUM(Hyp!$C$${HYP_FIXED_ROW}:$C$${HYP_FIXED_ROW + MAX_FIXED - 1})*12`;
  const depreciation = (yearCol: string) =>
    `SUMPRODUCT((Hyp!$D$${HYP_INVEST_ROW}:$D$${HYP_INVEST_ROW + MAX_INVESTMENTS - 1}>=${yearCol})*Hyp!$C$${HYP_INVEST_ROW}:$C$${HYP_INVEST_ROW + MAX_INVESTMENTS - 1}/(Hyp!$D$${HYP_INVEST_ROW}:$D$${HYP_INVEST_ROW + MAX_INVESTMENTS - 1}+(Hyp!$D$${HYP_INVEST_ROW}:$D$${HYP_INVEST_ROW + MAX_INVESTMENTS - 1}=0)))`;

  setLabel(ws, 0, 7, "Charges fixes (dont dotations aux amortissements)");
  setFormula(ws, 1, 7, `${fixedAnnual}+${depreciation("1")}`, EUR_FORMAT);
  setFormula(ws, 2, 7, `${fixedAnnual}+${depreciation("2")}`, EUR_FORMAT);
  setFormula(ws, 3, 7, `${fixedAnnual}+${depreciation("3")}`, EUR_FORMAT);

  setLabel(ws, 0, 8, "Résultat d'exploitation");
  setFormula(ws, 1, 8, "B6-B7", EUR_FORMAT);
  setFormula(ws, 2, 8, "C6-C7", EUR_FORMAT);
  setFormula(ws, 3, 8, "D6-D7", EUR_FORMAT);

  setLabel(ws, 0, 9, "Intérêts d'emprunt");
  setFormula(ws, 1, 9, `Financement!B${FIN_INTEREST_Y1_ROW}`, EUR_FORMAT);
  setFormula(ws, 2, 9, `Financement!B${FIN_INTEREST_Y1_ROW + 1}`, EUR_FORMAT);
  setFormula(ws, 3, 9, `Financement!B${FIN_INTEREST_Y1_ROW + 2}`, EUR_FORMAT);

  const isFormula = (rbtCell: string) =>
    `IF(${rbtCell}<=0,0,IF(${rbtCell}<=Hyp!$B$14,${rbtCell}*Hyp!$B$12/100,Hyp!$B$14*Hyp!$B$12/100+(${rbtCell}-Hyp!$B$14)*Hyp!$B$13/100))`;

  setLabel(ws, 0, 10, "Résultat avant impôt");
  setFormula(ws, 1, 10, "B8-B9", EUR_FORMAT);
  setFormula(ws, 2, 10, "C8-C9", EUR_FORMAT);
  setFormula(ws, 3, 10, "D8-D9", EUR_FORMAT);

  setLabel(ws, 0, 11, "Impôt sur les sociétés");
  setFormula(ws, 1, 11, isFormula("B10"), EUR_FORMAT);
  setFormula(ws, 2, 11, isFormula("C10"), EUR_FORMAT);
  setFormula(ws, 3, 11, isFormula("D10"), EUR_FORMAT);

  setLabel(ws, 0, 12, "Résultat net");
  setFormula(ws, 1, 12, "B10-B11", EUR_FORMAT);
  setFormula(ws, 2, 12, "C10-C11", EUR_FORMAT);
  setFormula(ws, 3, 12, "D10-D11", EUR_FORMAT);

  finalizeSheet(ws);
  return ws;
}

function buildTresorerieSheet(): XLSX.WorkSheet {
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

  for (let month = 1; month <= 12; month++) {
    const row = 3 + month;
    setLabel(ws, 0, row, MONTH_NAMES[month - 1]);

    setFormula(ws, 8, row, `INDEX(Revenus!$B$15:$M$15,ROW()-3)`, EUR_FORMAT);
    setFormula(
      ws,
      7,
      row,
      `${fixedMonthly}+(${pctSum}/100)*I${row}+${unitSum}*INDEX(Revenus!$B$33:$M$33,ROW()-3)+IF(ROW()=4,${investmentsTotal},0)`,
      EUR_FORMAT
    );

    setFormula(ws, 1, row, `I${row}*(1+Hyp!$B$11/100)`, EUR_FORMAT);
    setFormula(ws, 2, row, `H${row}*(1+Hyp!$B$11/100)+INDEX(Financement!$C$20:$C$79,ROW()-3)`, EUR_FORMAT);

    const collected = `I${row}*Hyp!$B$11/100`;
    const deductible = `H${row}*Hyp!$B$11/100`;
    const prevCredit = month === 1 ? "0" : `G${row - 1}`;
    const netBeforeCap = `(${collected})-(${deductible})-(${prevCredit})`;

    setFormula(ws, 3, row, `MAX(${netBeforeCap},0)`, EUR_FORMAT);
    setFormula(ws, 6, row, `MAX(-(${netBeforeCap}),0)`, EUR_FORMAT);

    setFormula(ws, 4, row, `B${row}-C${row}-D${row}`, EUR_FORMAT);
    setFormula(ws, 5, row, month === 1 ? `Hyp!$B$7+E${row}` : `F${row - 1}+E${row}`, EUR_FORMAT);
  }

  finalizeSheet(ws);
  return ws;
}

function buildSeuilSheet(): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  setLabel(ws, 0, 1, "FinAxis — Seuil de rentabilité");

  setLabel(ws, 1, 3, "Année 1");
  setLabel(ws, 2, 3, "Année 2");
  setLabel(ws, 3, 3, "Année 3");

  const cols = ["B", "C", "D"];
  setLabel(ws, 0, 4, "Marge sur coûts variables");
  cols.forEach((c, i) => setFormula(ws, i + 1, 4, `CR!${c}6`, EUR_FORMAT));

  setLabel(ws, 0, 5, "Taux de marge sur coûts variables");
  cols.forEach((c, i) => setFormula(ws, i + 1, 5, `IF(CR!${c}4=0,0,${c}4/CR!${c}4)`, PCT_FORMAT));

  setLabel(ws, 0, 6, "Charges fixes");
  cols.forEach((c, i) => setFormula(ws, i + 1, 6, `CR!${c}7`, EUR_FORMAT));

  setLabel(ws, 0, 7, "Seuil de rentabilité");
  cols.forEach((c, i) => setFormula(ws, i + 1, 7, `IF(${c}5=0,0,${c}6/${c}5)`, EUR_FORMAT));

  setLabel(ws, 0, 8, "Point mort (jours)");
  cols.forEach((c, i) =>
    setFormula(ws, i + 1, 8, `IF(CR!${c}4=0,0,MIN(${c}7/CR!${c}4*360,360))`)
  );

  setLabel(ws, 0, 9, "Équivalent MRR");
  cols.forEach((c, i) => setFormula(ws, i + 1, 9, `${c}7/12`, EUR_FORMAT));

  finalizeSheet(ws);
  return ws;
}

function buildKpiSheet(): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  setLabel(ws, 0, 1, "FinAxis — KPIs");

  setLabel(ws, 0, 3, "CA annuel Année 1");
  setFormula(ws, 1, 3, "CR!B4", EUR_FORMAT);
  setLabel(ws, 0, 4, "Résultat net Année 1");
  setFormula(ws, 1, 4, "CR!B12", EUR_FORMAT);
  setLabel(ws, 0, 5, "Trésorerie fin Année 1");
  setFormula(ws, 1, 5, "Tresorerie!F15", EUR_FORMAT);
  setLabel(ws, 0, 6, "Charges totales Année 1");
  setFormula(ws, 1, 6, "CR!B5+CR!B7", EUR_FORMAT);
  setLabel(ws, 0, 7, "Taux de marge brute");
  setFormula(ws, 1, 7, "IF(CR!B4=0,0,CR!B6/CR!B4)", PCT_FORMAT);
  setLabel(ws, 0, 8, "Marge nette");
  setFormula(ws, 1, 8, "IF(CR!B4=0,0,CR!B12/CR!B4)", PCT_FORMAT);
  setLabel(ws, 0, 9, "Seuil de rentabilité Année 1");
  setFormula(ws, 1, 9, "Seuil!B7", EUR_FORMAT);
  setLabel(ws, 0, 10, "Point mort Année 1 (jours)");
  setFormula(ws, 1, 10, "Seuil!B8");

  finalizeSheet(ws);
  return ws;
}

function buildGuideSheet(project: Project): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const lines: string[] = [
    "FinAxis — Dossier financier prévisionnel",
    `Projet : ${project.name || "Projet sans nom"}`,
    "",
    "Mode d'emploi",
    "Ce classeur contient des formules Excel réelles : modifiez les hypothèses",
    "de l'onglet « Hypothèses » et les autres onglets se recalculent automatiquement.",
    "",
    "Code couleur (convention, à appliquer via la mise en forme conditionnelle de votre tableur si non visible) :",
    "  - Bleu : cellule d'entrée (à modifier)",
    "  - Noir : cellule de calcul (formule)",
    "  - Vert : cellule de résultat final",
    "",
    "Onglets",
    "  1. Guide — ce mode d'emploi",
    "  2. Hypothèses — toutes les entrées du wizard (projet, revenus, charges, investissements, financement)",
    "  3. Revenus — chiffre d'affaires mensuel Année 1 et projections Années 2 et 3",
    "  4. Compte de résultat — compte de résultat sur 3 ans",
    "  5. Plan de financement — besoins / ressources et tableau d'amortissement de l'emprunt",
    "  6. Trésorerie — budget de trésorerie mensuel Année 1",
    "  7. Seuil de rentabilité — seuil et point mort par année",
    "  8. KPIs — synthèse chiffrée",
    "",
    "Limites connues",
    "  - Les dotations aux amortissements s'arrêtent à la durée saisie, comme dans le tableau de bord.",
    "  - Le tableau d'amortissement de l'emprunt est généré sur 60 périodes ; au-delà, complétez",
    "    manuellement le modèle si votre emprunt est plus long.",
    "",
    "Ce document est un prévisionnel construit à partir de vos hypothèses. Il n'a pas valeur",
    "d'attestation comptable. Généré avec FinAxis.",
  ];
  lines.forEach((line, i) => setLabel(ws, 0, i + 1, line));
  finalizeSheet(ws);
  return ws;
}

// `results` n'est pas consommé directement : toutes les valeurs du classeur
// proviennent de formules Excel recalculées depuis l'onglet Hypothèses.
// Le paramètre est conservé pour garder une signature symétrique avec
// downloadProjectPdf(project, results) et pour un usage futur (ex. valeurs
// pré-calculées en cache).
export function buildProjectWorkbook(project: Project, results: ProjectResults): XLSX.WorkBook {
  void results;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildGuideSheet(project), "Guide");
  XLSX.utils.book_append_sheet(wb, buildHypSheet(project), "Hyp");
  XLSX.utils.book_append_sheet(wb, buildRevenusSheet(), "Revenus");
  XLSX.utils.book_append_sheet(wb, buildCompteResultatSheet(), "CR");
  XLSX.utils.book_append_sheet(wb, buildFinancementSheet(), "Financement");
  XLSX.utils.book_append_sheet(wb, buildTresorerieSheet(), "Tresorerie");
  XLSX.utils.book_append_sheet(wb, buildSeuilSheet(), "Seuil");
  XLSX.utils.book_append_sheet(wb, buildKpiSheet(), "KPIs");
  return wb;
}

function slugify(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .toLowerCase() || "projet"
  );
}

export function downloadProjectExcel(project: Project, results: ProjectResults) {
  const wb = buildProjectWorkbook(project, results);
  const filename = `finaxis-${slugify(project.name)}-dossier-financier.xlsx`;
  XLSX.writeFile(wb, filename, { compression: true });
}
