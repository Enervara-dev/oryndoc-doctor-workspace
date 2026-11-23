import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** The action that fills this space — an empty view is an invitation to act. */
  action?: React.ReactNode;
  className?: string;
  /** Compact variant for use inside panels. */
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, className, compact = false }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-12",
        className,
      )}
    >
      <Icon className="size-6 text-text-tertiary" strokeWidth={1.75} aria-hidden="true" />
      <div className="max-w-sm space-y-1">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {description && <p className="text-[13px] text-text-secondary">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
