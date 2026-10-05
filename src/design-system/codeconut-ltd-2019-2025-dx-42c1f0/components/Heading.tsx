import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

/**
 * Type scale follows the CI ratio 1 : 1.250 and steps down one size on
 * viewports <= 768px.
 */
export const headingVariants = cva("font-serif font-bold text-foreground", {
  variants: {
    level: {
      1: "text-h2 md:text-h1",
      2: "text-h3 md:text-h2",
      3: "text-lead md:text-h3",
      4: "text-body md:text-h4",
    },
    tone: {
      default: "",
      muted: "text-muted-foreground",
      accent: "text-accent",
    },
  },
  defaultVariants: { level: 2, tone: "default" },
});

export interface HeadingProps
  extends Omit<ComponentProps<"h2">, "color">,
    VariantProps<typeof headingVariants> {
  /** Semantic heading level; also drives the rendered element. */
  level?: 1 | 2 | 3 | 4;
}

/** Section heading in the brand serif. Pick `level` for document structure. */
export function Heading({ className, level = 2, tone, ...props }: HeadingProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
  return (
    <Tag className={cn(headingVariants({ level, tone }), className)} {...props} />
  );
}
