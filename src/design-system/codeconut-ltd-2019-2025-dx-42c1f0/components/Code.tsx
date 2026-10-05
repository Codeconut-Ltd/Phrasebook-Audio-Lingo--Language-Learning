import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

export interface CodeProps extends ComponentProps<"code"> {
  /** Renders a scrollable block instead of inline code. */
  block?: boolean;
}

/** Monospace code in Source Code Pro, inline or as a block. */
export function Code({ className, block = false, ...props }: CodeProps) {
  const code = (
    <code
      className={cn(
        "font-mono text-small text-foreground",
        block ? "block whitespace-pre" : "rounded-xs bg-surface px-1.5 py-0.5",
        className,
      )}
      {...props}
    />
  );

  if (!block) return code;
  return (
    <pre className="overflow-x-auto rounded-sm border border-border bg-surface p-4">
      {code}
    </pre>
  );
}
