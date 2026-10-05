import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

export interface DividerProps extends ComponentProps<"hr"> {
  orientation?: "horizontal" | "vertical";
}

/** Thin rule separating content groups. */
export function Divider({
  className,
  orientation = "horizontal",
  ...props
}: DividerProps) {
  return (
    <hr
      className={cn(
        "border-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}
