import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-turquoise-50 text-turquoise-700",
        navy: "border-transparent bg-navy-50 text-navy-700",
        outline: "border-border text-foreground",
        success: "border-transparent bg-[#EAF9EE] text-[#16A34A]",
        danger: "border-transparent bg-[#FDECEC] text-[#DC2626]",
        "on-dark": "border-turquoise-500/40 bg-turquoise-500/10 text-turquoise-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
