

import * as React from "react";
import clsx from "clsx";

export type ListProps = {
  /**
   * Children are typically <RequestCard /> elements.
   * We intentionally do not wrap each child in <li> to avoid layout side effects.
   */
  children: React.ReactNode;
  /** Vertical stack (default) or responsive grid */
  variant?: "stack" | "grid";
  /** Grid columns preset (only used when variant === 'grid') */
  gridCols?: 1 | 2 | 3 | 4;
  className?: string;
  /** Optional ARIA label if the list represents a collection */
  ariaLabel?: string;
};

function gridColsClass(cols: 1 | 2 | 3 | 4) {
  switch (cols) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    case 4:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    default:
      return "grid-cols-1";
  }
}

/**
 * Presentational wrapper used to render a list of request cards.
 * - Pure layout component (no data fetching or business logic)
 * - Keeps DOM minimal to avoid interfering with card semantics
 */
export default function List({
  children,
  variant = "stack",
  gridCols = 1,
  className,
  ariaLabel,
}: ListProps) {
  const base =
    variant === "grid"
      ? clsx("grid gap-6 sm:gap-8", gridColsClass(gridCols))
      : "flex flex-col gap-6";

  return (
    <div className={clsx(base, className)} aria-label={ariaLabel} role={ariaLabel ? "list" : undefined}>
      {children}
    </div>
  );
}