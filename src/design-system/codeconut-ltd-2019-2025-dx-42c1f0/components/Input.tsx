import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

export const fieldControlVariants = cva(
  "w-full rounded-sm border bg-background font-sans text-foreground placeholder:text-muted-foreground transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-8 px-2 text-small",
        md: "h-10 px-3 text-body",
        lg: "h-12 px-4 text-lead",
      },
      invalid: {
        true: "border-danger",
        false: "border-border-strong hover:border-brown",
      },
    },
    defaultVariants: { size: "md", invalid: false },
  },
);

export interface InputProps
  extends Omit<ComponentProps<"input">, "size">,
    VariantProps<typeof fieldControlVariants> {}

/** Single-line text control. Pair with `Field` for label, hint and error copy. */
export function Input({ className, size, invalid, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(fieldControlVariants({ size, invalid }), className)}
      {...props}
    />
  );
}
