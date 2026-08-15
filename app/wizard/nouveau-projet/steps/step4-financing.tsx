"use client";

import { Trash2 } from "lucide-react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useWizardStore } from "@/store/wizard-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WizardNavButtons } from "@/components/wizard/nav-buttons";
import { formatEUR } from "@/lib/finance/format";
import { cn } from "@/lib/utils";

export function Step4Financing({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const draft = useWizardStore((s) => s.draft);
  const addInvestment = useWizardStore((s) => s.addInvestment);
  const updateInvestment = useWizardStore((s) => s.updateInvestment);
  const removeInvestment = useWizardStore((s) => s.removeInvestment);
  const setFinancing = useWizardStore((s) => s.setFinancing);
  const setBankLoan = useWizardStore((s) => s.setBankLoan);

  const totalNeeds = draft.investments.reduce((sum, i) => sum + i.amountHT, 0);
  const { personalContribution, honorLoan, bankLoan, subsidies } = draft.financing;
  const totalResources = personalContribution + honorLoan + bankLoan.amount + subsidies;
  const gap = Math.round((totalResources - totalNeeds) * 100) / 100;
  const isBalanced = Math.abs(gap) < 0.5;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isBalanced) onNext();
      }}
    >
      <div>
        <Label>Investissements de départ</Label>
        <Table className="mt-3">
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Montant HT</TableHead>
              <TableHead>Durée d&apos;amortissement</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {draft.investments.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>
                  <Input
                    value={inv.name}
                    onChange={(e) => updateInvestment(inv.id, { name: e.target.value })}
                    placeholder="Ex : Matériel informatique"
                  />
                </TableCell>
                <TableCell>
                  <div className="relative w-36">
                    <Input
                      type="number"
                      min={0}
                      className="pr-8"
                      value={inv.amountHT}
                      onChange={(e) => updateInvestment(inv.id, { amountHT: Number(e.target.value) || 0 })}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      €
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="relative w-28">
                    <Input
                      type="number"
                      min={1}
                      className="pr-10"
                      value={inv.amortizationYears}
                      onChange={(e) =>
                        updateInvestment(inv.id, { amortizationYears: Number(e.target.value) || 1 })
                      }
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      ans
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Supprimer cet investissement"
                    onClick={() => removeInvestment(inv.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" aria-hidden />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={addInvestment}>
          + Ajouter un investissement
        </Button>
      </div>

      <div className="mt-10">
        <Label>Financement</Label>
        <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apport" className="text-sm font-normal text-muted-foreground">
              Apport personnel
            </Label>
            <div className="relative">
              <Input
                id="apport"
                type="number"
                min={0}
                className="pr-8"
                value={personalContribution}
                onChange={(e) => setFinancing({ personalContribution: Number(e.target.value) || 0 })}
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                €
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="honor" className="text-sm font-normal text-muted-foreground">
              Prêt d&apos;honneur à taux 0
            </Label>
            <div className="relative">
              <Input
                id="honor"
                type="number"
                min={0}
                className="pr-8"
                value={honorLoan}
                onChange={(e) => setFinancing({ honorLoan: Number(e.target.value) || 0 })}
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                €
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subsidies" className="text-sm font-normal text-muted-foreground">
              Subventions
            </Label>
            <div className="relative">
              <Input
                id="subsidies"
                type="number"
                min={0}
                className="pr-8"
                value={subsidies}
                onChange={(e) => setFinancing({ subsidies: Number(e.target.value) || 0 })}
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                €
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="loanAmount" className="text-sm font-normal text-muted-foreground">
              Emprunt bancaire
            </Label>
            <div className="relative">
              <Input
                id="loanAmount"
                type="number"
                min={0}
                className="pr-8"
                value={bankLoan.amount}
                onChange={(e) => setBankLoan({ amount: Number(e.target.value) || 0 })}
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                €
              </span>
            </div>
          </div>

          {bankLoan.amount > 0 && (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="loanRate" className="text-sm font-normal text-muted-foreground">
                  Taux d&apos;intérêt annuel
                </Label>
                <div className="relative">
                  <Input
                    id="loanRate"
                    type="number"
                    min={0}
                    step="0.1"
                    className="pr-8"
                    value={bankLoan.annualRate}
                    onChange={(e) => setBankLoan({ annualRate: Number(e.target.value) || 0 })}
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="loanMonths" className="text-sm font-normal text-muted-foreground">
                  Durée
                </Label>
                <div className="relative">
                  <Input
                    id="loanMonths"
                    type="number"
                    min={1}
                    className="pr-16"
                    value={bankLoan.months}
                    onChange={(e) => setBankLoan({ months: Number(e.target.value) || 1 })}
                  />
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    mois
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          "mt-8 flex flex-col gap-2 rounded-lg border p-4 text-sm sm:flex-row sm:items-center sm:justify-between",
          isBalanced ? "border-turquoise-200 bg-turquoise-50 text-navy-700" : "border-destructive/30 bg-destructive/5 text-navy-700"
        )}
      >
        <div className="flex items-center gap-2">
          {isBalanced ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-turquoise-600" aria-hidden />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" aria-hidden />
          )}
          <span>
            Total besoins = <strong>{formatEUR(totalNeeds)}</strong> · Total ressources ={" "}
            <strong>{formatEUR(totalResources)}</strong> · Écart ={" "}
            <strong className={!isBalanced ? "text-destructive" : undefined}>{formatEUR(gap)}</strong>
          </span>
        </div>
        {!isBalanced && (
          <span className="text-xs text-destructive">
            L&apos;écart doit être nul pour passer à l&apos;étape suivante.
          </span>
        )}
      </div>

      <WizardNavButtons onBack={onBack} nextDisabled={!isBalanced} />
    </form>
  );
}
