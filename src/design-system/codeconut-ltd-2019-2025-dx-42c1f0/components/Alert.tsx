import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "../lib/utils";

export const alertVariants = cva(
  "rounded-sm border-l-4 bg-surface px-4 py-3 font-sans",
  {
    variants: {
      tone: {
        info: "border-l-info",
        success: "border-l-success",
        warning: "border-l-warning",
        danger: "border-l-danger",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

export interface AlertProps
  extends ComponentProps<"div">,
    VariantProps<typeof alertVariants> {
  title?: string;
  children?: ReactNode;
}

/** Inline message communicating a state or result of an action. */
export function Alert({ className, tone, title, children, ...props }: AlertProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    >
      {title ? (
        <p className="text-body font-semibold text-foreground">{title}</p>
      ) : null}
      {children ? (
        <div className="text-small text-muted-foreground">{children}</div>
      ) : null}
    </div>
  );
}
