import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

export interface LabelProps extends ComponentProps<"label"> {
  /** Marks the associated control as required. */
  required?: boolean;
}

/** Accessible label for a form control. Always wire `htmlFor` to the control id. */
export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block font-sans text-small font-semibold text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span className="text-danger" aria-hidden="true">
          {" *"}
        </span>
      ) : null}
    </label>
  );
}
