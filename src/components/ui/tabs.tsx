"use client";

import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  /** Accessible name for the group, e.g. "View". */
  label?: string;
}

/**
 * Segmented view switcher. Implemented as pressed-state buttons (not ARIA
 * tabs) because the content below is filtered in place rather than swapped
 * between separate tab panels.
 */
export function Tabs({ items, value, onChange, className, label = "View" }: TabsProps) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex items-center gap-0.5 rounded-sm bg-surface-sunken p-0.5", className)}>
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(item.value)}
            className={cn(
              "focus-ring inline-flex h-8 items-center gap-1.5 rounded-[5px] px-3 text-sm font-medium transition-colors",
              isActive ? "bg-surface text-text-primary shadow-[0_0_0_1px_var(--od-border)]" : "text-text-secondary hover:text-text-primary",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className={cn("tabular-nums text-xs", isActive ? "text-text-secondary" : "text-text-tertiary")}>{item.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
