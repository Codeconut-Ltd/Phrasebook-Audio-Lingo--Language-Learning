import type { ComponentProps } from "react";

import { cn } from "../lib/utils";

export interface TableProps extends ComponentProps<"table"> {
  /** Tighter row height for dense, data-heavy views. */
  dense?: boolean;
}

/** Data table wrapper. Always provide a `<caption>` or an `aria-label`. */
export function Table({ className, dense = false, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-sm border border-border">
      <table
        data-dense={dense || undefined}
        className={cn(
          "w-full border-collapse font-sans text-body text-foreground",
          className,
        )}
        {...props}
      />
    </div>
  );
}

/** Table head group. */
export function TableHead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("bg-surface", className)} {...props} />;
}

/** Table body group. */
export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={className} {...props} />;
}

/** Table row. */
export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn("border-b border-border last:border-0", className)}
      {...props}
    />
  );
}

/** Header cell. Set `scope` for accessible row/column association. */
export function TableHeaderCell({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-2 text-left text-small font-semibold text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** Data cell. */
export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-top", className)} {...props} />;
}
