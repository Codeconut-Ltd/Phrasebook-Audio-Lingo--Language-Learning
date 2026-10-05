import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

export const cardVariants = cva("rounded-sm bg-background", {
  variants: {
    variant: {
      outlined: "border border-border",
      raised: "border border-border shadow-raised",
      filled: "bg-surface",
      quiet: "",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: { variant: "outlined", padding: "md" },
});

export interface CardProps
  extends ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

/** Surface that groups related content. Compose with the Card sub-parts. */
export function Card({ className, variant, padding, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  );
}

/** Header slot of a `Card` — usually a `CardTitle` plus supporting copy. */
export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />;
}

/** Title of a `Card`. Renders an `<h3>` by default. */
export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      className={cn("font-serif text-lead font-semibold text-foreground", className)}
      {...props}
    />
  );
}

/** Secondary copy under a `CardTitle`. */
export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-small text-muted-foreground", className)} {...props} />
  );
}

/** Main body slot of a `Card`. */
export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mt-4", className)} {...props} />;
}

/** Action row of a `Card`. */
export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("mt-6 flex items-center gap-3", className)} {...props} />
  );
}
