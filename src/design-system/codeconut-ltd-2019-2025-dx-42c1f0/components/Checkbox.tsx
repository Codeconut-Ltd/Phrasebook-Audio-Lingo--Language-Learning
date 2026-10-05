import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

export interface CheckboxProps extends Omit<ComponentProps<"input">, "type"> {
  label: string;
  description?: string;
}

/** Boolean choice with an always-visible label. */
export function Checkbox({
  className,
  label,
  description,
  id,
  ...props
}: CheckboxProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        className="mt-1 size-4 shrink-0 rounded-xs border border-border-strong accent-accent disabled:opacity-50"
        {...props}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="font-sans text-body text-foreground">
          {label}
        </label>
        {description ? (
          <span className="text-small text-muted-foreground">{description}</span>
        ) : null}
      </div>
    </div>
  );
}
