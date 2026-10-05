import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

export const containerVariants = cva("mx-auto w-full px-4 md:px-8", {
  variants: {
    width: {
      narrow: "max-w-3xl",
      content: "max-w-(--container-content)",
      wide: "max-w-7xl",
    },
  },
  defaultVariants: { width: "content" },
});

export interface ContainerProps
  extends ComponentProps<"div">,
    VariantProps<typeof containerVariants> {}

/** Centred content column. Never stretches infinitely on wide viewports. */
export function Container({ className, width, ...props }: ContainerProps) {
  return (
    <div className={cn(containerVariants({ width }), className)} {...props} />
  );
}
