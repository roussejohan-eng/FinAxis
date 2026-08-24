import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // CTA principal : bleu marine plein — sobre, cohérent avec un
        // document destiné à être pris au sérieux par un banquier. Le
        // turquoise est réservé aux accents (icônes, badges, liens,
        // graphiques) et au variant "accent" ci-dessous, pour les CTA
        // posés sur fond marine où le marine serait illisible.
        default: "bg-navy-700 text-white shadow-sm hover:bg-navy-800",
        // À utiliser uniquement pour un CTA sur fond sombre (sections marine).
        accent: "bg-turquoise-500 text-white shadow-sm hover:bg-turquoise-600",
        secondary:
          "bg-navy-50 text-navy-700 shadow-sm hover:bg-navy-100 border border-navy-100",
        outline:
          "border border-navy-700 bg-transparent text-navy-700 hover:bg-navy-50 dark:border-white/30 dark:text-white dark:hover:bg-white/10",
        ghost: "hover:bg-navy-50 text-navy-700 dark:text-white dark:hover:bg-white/10",
        link: "text-turquoise-600 underline-offset-4 hover:underline",
        destructive: "bg-destructive text-white shadow-sm hover:bg-destructive/90",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
