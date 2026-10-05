import type { ComponentProps } from "react";

import { cn } from "../lib/utils";
import { fieldControlVariants } from "./Input";

export interface SelectProps extends Omit<ComponentProps<"select">, "size"> {
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
}

/** Native single-choice control for a known, short list of options. */
export function Select({ className, size, invalid, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(fieldControlVariants({ size, invalid }), "pr-8", className)}
      {...props}
    />
  );
}
