"use client";

import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Trash2, Upload } from "lucide-react";
import { useWizardStore } from "@/store/wizard-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WizardNavButtons } from "@/components/wizard/nav-buttons";
import { FIXED_EXPENSE_CATEGORIES } from "@/lib/wizard/options";
import { formatEUR, formatPercent } from "@/lib/finance/format";
import type { FixedExpenseCategory } from "@/lib/finance/types";

export function Step3Expenses({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const draft = useWizardStore((s) => s.draft);
  const addFixedExpense = useWizardStore((s) => s.addFixedExpense);
  const updateFixedExpense = useWizardStore((s) => s.updateFixedExpense);
  const removeFixedExpense = useWizardStore((s) => s.removeFixedExpense);
  const setFixedExpenses = useWizardStore((s) => s.setFixedExpenses);
  const addVariableExpense = useWizardStore((s) => s.addVariableExpense);
  const updateVariableExpense = useWizardStore((s) => s.updateVariableExpense);
  const removeVariableExpense = useWizardStore((s) => s.removeVariableExpense);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const totalFixed = draft.fixedExpenses.reduce((sum, e) => sum + e.monthlyAmount, 0);
  const totalVariablePct = draft.variableExpenses
    .filter((e) => e.mode === "percent")
    .reduce((sum, e) => sum + (e.percentOfRevenue ?? 0), 0);

  const ratio = useMemo(() => {
    if (totalFixed === 0 && totalVariablePct === 0) return null;
    return { fixed: totalFixed, variablePct: totalVariablePct };
  }, [totalFixed, totalVariablePct]);

  const handleFile = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

      let imported = 0;
      const newExpenses = rows
        .map((row) => {
          const name = String(row["Nom"] ?? row["nom"] ?? row["Name"] ?? Object.values(row)[0] ?? "").trim();
          const amountRaw = row["Montant"] ?? row["montant"] ?? row["Amount"] ?? Object.values(row)[1];
          const amount = Number(amountRaw) || 0;
          const categoryRaw = String(row["Catégorie"] ?? row["categorie"] ?? row["Category"] ?? Object.values(row)[2] ?? "Autre");
          const category = (FIXED_EXPENSE_CATEGORIES.find((c) => c === categoryRaw) ??
            "Autre") as FixedExpenseCategory;
          if (!name) return null;
          imported += 1;
          return { id: `${Date.now()}-${Math.random()}`, name, monthlyAmount: amount, category };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

      setFixedExpenses([...draft.fixedExpenses, ...newExpenses]);
      setImportMessage(
        imported > 0
          ? `${imported} charge${imported > 1 ? "s" : ""} importée${imported > 1 ? "s" : ""} depuis « ${file.name} ».`
          : `Aucune ligne exploitable trouvée dans « ${file.name} ». Colonnes attendues : Nom, Montant, Catégorie.`
      );
    } catch {
      setImportMessage("Impossible de lire ce fichier. Formats acceptés : .xlsx, .csv.");
    }
  };

  const isValid = true; // Étape valide même sans charge saisie

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) onNext();
      }}
    >
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted px-6 py-8 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
      >
        <Upload className="h-6 w-6 text-turquoise-500" aria-hidden />
        <p className="text-sm font-medium text-navy-700">
          Glissez-déposez un fichier .xlsx ou .csv de vos charges fixes
        </p>
        <p className="text-xs text-muted-foreground">Colonnes attendues : Nom, Montant, Catégorie</p>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()}>
          Choisir un fichier
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        {importMessage && <p className="mt-1 text-xs text-turquoise-700">{importMessage}</p>}
      </div>

      <Tabs defaultValue="fixed" className="mt-8">
        <TabsList>
          <TabsTrigger value="fixed">Charges fixes</TabsTrigger>
          <TabsTrigger value="variable">Charges variables</TabsTrigger>
        </TabsList>

        <TabsContent value="fixed">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Montant mensuel</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {draft.fixedExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <Input
                      value={expense.name}
                      onChange={(e) => updateFixedExpense(expense.id, { name: e.target.value })}
                      placeholder="Ex : Loyer local"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="relative w-36">
                      <Input
                        type="number"
                        min={0}
                        className="pr-8"
                        value={expense.monthlyAmount}
                        onChange={(e) =>
                          updateFixedExpense(expense.id, { monthlyAmount: Number(e.target.value) || 0 })
                        }
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        €
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={expense.category}
                      onValueChange={(v) => updateFixedExpense(expense.id, { category: v as FixedExpenseCategory })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIXED_EXPENSE_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Supprimer cette charge"
                      onClick={() => removeFixedExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={addFixedExpense}>
            + Ajouter une charge
          </Button>
        </TabsContent>

        <TabsContent value="variable">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {draft.variableExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <Input
                      value={expense.name}
                      onChange={(e) => updateVariableExpense(expense.id, { name: e.target.value })}
                      placeholder="Ex : Commission plateforme"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={expense.mode}
                      onValueChange={(v) => updateVariableExpense(expense.id, { mode: v as "percent" | "unit" })}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">% du CA</SelectItem>
                        <SelectItem value="unit">Montant unitaire × volume</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {expense.mode === "percent" ? (
                      <div className="relative w-28">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          className="pr-7"
                          value={expense.percentOfRevenue ?? 0}
                          onChange={(e) =>
                            updateVariableExpense(expense.id, { percentOfRevenue: Number(e.target.value) || 0 })
                          }
                        />
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          %
                        </span>
                      </div>
                    ) : (
                      <div className="relative w-28">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          className="pr-8"
                          value={expense.unitCost ?? 0}
                          onChange={(e) =>
                            updateVariableExpense(expense.id, { unitCost: Number(e.target.value) || 0 })
                          }
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          €
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={expense.category}
                      onValueChange={(v) => updateVariableExpense(expense.id, { category: v as FixedExpenseCategory })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIXED_EXPENSE_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Supprimer cette charge"
                      onClick={() => removeVariableExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={addVariableExpense}>
            + Ajouter
          </Button>
        </TabsContent>
      </Tabs>

      {ratio && (
        <div className="mt-8 rounded-lg bg-muted p-4 text-sm text-navy-700">
          Charges fixes mensuelles : <strong>{formatEUR(ratio.fixed)}</strong> · Charges
          variables : <strong>{formatPercent(ratio.variablePct / 100)}</strong> du chiffre d&apos;affaires
          (hors charges à l&apos;unité)
        </div>
      )}

      <WizardNavButtons onBack={onBack} nextDisabled={!isValid} />
    </form>
  );
}
