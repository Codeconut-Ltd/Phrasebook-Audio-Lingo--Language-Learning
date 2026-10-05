import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

export const textLinkVariants = cva(
  "font-sans underline-offset-4 transition-colors duration-150",
  {
    variants: {
      variant: {
        inline: "text-link underline hover:text-link-hover",
        standalone: "text-link no-underline hover:underline hover:text-link-hover",
        quiet: "text-muted-foreground no-underline hover:text-foreground",
      },
    },
    defaultVariants: { variant: "inline" },
  },
);

export interface TextLinkProps
  extends ComponentProps<"a">,
    VariantProps<typeof textLinkVariants> {
  /** Adds `target="_blank"` with safe rel attributes. */
  external?: boolean;
}

/** Navigational link, styled for body copy and standalone use. */
export function TextLink({
  className,
  variant,
  external = false,
  ...props
}: TextLinkProps) {
  return (
    <a
      className={cn(textLinkVariants({ variant }), className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : null)}
      {...props}
    />
  );
}
