import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

export const textVariants = cva("font-sans", {
  variants: {
    size: {
      small: "text-small",
      body: "text-body",
      lead: "text-lead",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      accent: "text-accent",
    },
    weight: {
      regular: "font-normal",
      semibold: "font-semibold",
    },
  },
  defaultVariants: { size: "body", tone: "default", weight: "regular" },
});

export interface TextProps
  extends ComponentProps<"p">,
    VariantProps<typeof textVariants> {
  /** Render as a `<span>` for inline copy. */
  as?: "p" | "span" | "div";
}

/** Body copy in the brand sans. Keep measure comfortable with `max-w-*`. */
export function Text({
  className,
  size,
  tone,
  weight,
  as: Tag = "p",
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn(textVariants({ size, tone, weight }), className)}
      {...props}
    />
  );
}
