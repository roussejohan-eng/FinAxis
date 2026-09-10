import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/dashboard/sparkline";
import { cn } from "@/lib/utils";

export function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  badge,
  sparklineData,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: { value: string; positive: boolean };
  badge?: { label: string; positive: boolean };
  /** Série mensuelle optionnelle (12 valeurs) affichée en mini-graphique. */
  sparklineData?: number[];
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-turquoise-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-turquoise-50">
          <Icon className="h-4.5 w-4.5 text-turquoise-600" aria-hidden />
        </div>
        {badge && (
          <Badge variant={badge.positive ? "success" : "danger"}>{badge.label}</Badge>
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-2xl font-semibold text-navy-700" title={value}>
        {value}
      </p>
      {trend && (
        <p className={cn("mt-1 text-xs font-medium", trend.positive ? "text-[#16A34A]" : "text-destructive")}>
          {trend.value}
        </p>
      )}
      {sparklineData && (
        <div className={trend ? "mt-3" : "mt-4"}>
          <Sparkline data={sparklineData} height={28} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
