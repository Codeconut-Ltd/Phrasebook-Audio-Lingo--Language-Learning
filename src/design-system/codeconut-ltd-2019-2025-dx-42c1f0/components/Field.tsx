import type { ComponentProps, ReactNode } from "react";

import { cn } from "../lib/utils";
import { Label } from "./Label";

export interface FieldProps extends ComponentProps<"div"> {
  /** Id of the control rendered as children. */
  htmlFor: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

/** Layout wrapper that pairs a control with its label, hint and error copy. */
export function Field({
  htmlFor,
  label,
  hint,
  error,
  required,
  className,
  children,
  ...props
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-small text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-small text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
