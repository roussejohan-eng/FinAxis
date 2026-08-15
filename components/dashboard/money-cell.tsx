import { TableCell } from "@/components/ui/table";
import { formatEUR } from "@/lib/finance/format";
import { cn } from "@/lib/utils";

export function MoneyCell({
  value,
  bold,
  highlight,
  className,
}: {
  value: number;
  bold?: boolean;
  /** Colore en vert les valeurs positives (réservé aux lignes de résultat/marge). */
  highlight?: boolean;
  className?: string;
}) {
  return (
    <TableCell
      className={cn(
        "text-right tabular-nums",
        bold && "font-semibold",
        value < 0 && "text-destructive",
        value >= 0 && highlight && "text-[#16A34A]",
        className
      )}
    >
      {formatEUR(value, 0)}
    </TableCell>
  );
}
