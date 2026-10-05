import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

export interface TextareaProps extends ComponentProps<"textarea"> {
  invalid?: boolean;
}

/** Multi-line text control for longer, free-form copy. */
export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full rounded-sm border bg-background px-3 py-2 font-sans text-body text-foreground placeholder:text-muted-foreground transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        invalid ? "border-danger" : "border-border-strong hover:border-brown",
        className,
      )}
      {...props}
    />
  );
}
