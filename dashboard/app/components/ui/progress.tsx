import * as React from "react";
import { cn } from "~/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0-100 for determinate, null/undefined for indeterminate */
  value?: number | null;
  label?: string;
}

function Progress({ className, value, label, ...props }: ProgressProps) {
  const isIndeterminate = value == null;

  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {label && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>
          {!isIndeterminate && (
            <span className="font-medium tabular-nums">
              {Math.round(value!)}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        {isIndeterminate ? (
          <div className="h-full w-1/3 animate-indeterminate rounded-full bg-primary" />
        ) : (
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, value!))}%` }}
          />
        )}
      </div>
    </div>
  );
}

export { Progress };
