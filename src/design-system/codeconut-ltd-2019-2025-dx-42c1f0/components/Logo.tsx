import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "../lib/utils";
import symbolSrc from "../assets/logos/codeconut-symbol.png";
import wordmarkSrc from "../assets/logos/codeconut-wordmark.svg";

export const logoVariants = cva("inline-flex items-center", {
  variants: {
    size: {
      sm: "h-6",
      md: "h-8",
      lg: "h-12",
    },
  },
  defaultVariants: { size: "md" },
});

export interface LogoProps
  extends ComponentProps<"span">,
    VariantProps<typeof logoVariants> {
  /**
   * `symbol` = pictorial mark only, `wordmark` = logotype only.
   * Never recolour or redraw these marks.
   */
  variant?: "symbol" | "wordmark";
}

/** Official Codeconut brand marks. Whitespace scales with the mark size. */
export function Logo({
  className,
  size,
  variant = "wordmark",
  ...props
}: LogoProps) {
  return (
    <span className={cn(logoVariants({ size }), className)} {...props}>
      {variant === "symbol" ? (
        <img
          src={symbolSrc}
          alt="Codeconut"
          className="h-full w-auto dark:invert"
        />
      ) : (
        <img
          src={wordmarkSrc}
          alt="codeconut.io"
          className="h-[60%] w-auto dark:invert"
        />
      )}
    </span>
  );
}
