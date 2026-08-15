"use client";

import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useWizardStore } from "@/store/wizard-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { WizardNavButtons } from "@/components/wizard/nav-buttons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { computeRevenueProjection } from "@/lib/finance/revenues";
import { MONTH_LABELS, type Project } from "@/lib/finance/types";
import { formatEUR } from "@/lib/finance/format";

export function Step2Revenues({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const draft = useWizardStore((s) => s.draft);
  const addRevenueSource = useWizardStore((s) => s.addRevenueSource);
  const updateRevenueSource = useWizardStore((s) => s.updateRevenueSource);
  const removeRevenueSource = useWizardStore((s) => s.removeRevenueSource);

  const sources = draft.revenueSources;
  const isValid =
    sources.length >= 1 &&
    sources.every((s) => s.name.trim().length > 0 && s.unitPrice >= 0 && s.volumeM1 >= 0 && s.volumeM12 >= 0);

  const chartData = useMemo(() => {
    const synthetic: Project = {
      ...draft,
      id: "preview",
      createdAt: "",
      updatedAt: "",
    };
    const revenue = computeRevenueProjection(synthetic);
    return revenue.totalMonthlyYear1.map((value, i) => ({ month: MONTH_LABELS[i], ca: Math.round(value) }));
  }, [draft]);

  const handleCountChange = (count: number) => {
    const target = Math.max(1, Math.min(10, count));
    if (target > sources.length) {
      for (let i = sources.length; i < target; i++) addRevenueSource();
    } else if (target < sources.length) {
      const toRemove = sources.slice(target);
      toRemove.forEach((s) => removeRevenueSource(s.id));
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) onNext();
      }}
      noValidate
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-col gap-1.5 sm:max-w-xs">
            <Label htmlFor="sourceCount">Nombre de sources de revenus</Label>
            <Input
              id="sourceCount"
              type="number"
              min={1}
              max={10}
              value={sources.length}
              onChange={(e) => handleCountChange(Number(e.target.value) || 1)}
            />
          </div>

          <Accordion
            type="multiple"
            defaultValue={sources.map((s) => s.id)}
            className="mt-6 rounded-lg border border-border bg-white"
          >
            {sources.map((source, index) => (
              <AccordionItem key={source.id} value={source.id}>
                <AccordionTrigger className="px-4">
                  <span>{source.name || `Source ${index + 1}`}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label htmlFor={`name-${source.id}`}>Nom de la source</Label>
                      <Input
                        id={`name-${source.id}`}
                        placeholder='Ex : "Abonnement Standard"'
                        value={source.name}
                        onChange={(e) => updateRevenueSource(source.id, { name: e.target.value })}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`price-${source.id}`}>Prix unitaire HT</Label>
                      <div className="relative">
                        <Input
                          id={`price-${source.id}`}
                          type="number"
                          min={0}
                          step="0.01"
                          className="pr-10"
                          value={source.unitPrice}
                          onChange={(e) =>
                            updateRevenueSource(source.id, { unitPrice: Number(e.target.value) || 0 })
                          }
                        />
                        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          €
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`type-${source.id}`}>Type</Label>
                      <Select
                        value={source.type}
                        onValueChange={(v) => updateRevenueSource(source.id, { type: v as "ponctuel" | "recurrent" })}
                      >
                        <SelectTrigger id={`type-${source.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ponctuel">Ponctuel</SelectItem>
                          <SelectItem value="recurrent">Récurrent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`volM1-${source.id}`}>Volume prévu M1</Label>
                      <Input
                        id={`volM1-${source.id}`}
                        type="number"
                        min={0}
                        value={source.volumeM1}
                        onChange={(e) =>
                          updateRevenueSource(source.id, { volumeM1: Number(e.target.value) || 0 })
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`volM12-${source.id}`}>Volume prévu M12</Label>
                      <Input
                        id={`volM12-${source.id}`}
                        type="number"
                        min={0}
                        value={source.volumeM12}
                        onChange={(e) =>
                          updateRevenueSource(source.id, { volumeM12: Number(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  {sources.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-4 text-destructive hover:bg-destructive/10"
                      onClick={() => removeRevenueSource(source.id)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      Supprimer cette source
                    </Button>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-navy-700">CA mensuel — Année 1</p>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#E5E9EE" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip formatter={(value) => formatEUR(Number(value ?? 0))} />
                  <Bar dataKey="ca" fill="#1FB6C1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <WizardNavButtons onBack={onBack} nextDisabled={!isValid} />
    </form>
  );
}
