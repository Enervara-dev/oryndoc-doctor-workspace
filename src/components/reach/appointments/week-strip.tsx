"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, cn, formatDate, pluralize } from "@/lib/utils";

interface WeekStripProps {
  /** First day shown ("YYYY-MM-DD", clinic calendar). */
  weekStart: string;
  selectedDate: string;
  today: string;
  onSelectDate: (date: string) => void;
  onShiftWeek: (direction: -1 | 1) => void;
  countByDate: Record<string, number>;
}

/** Seven-day picker built entirely on calendar-date strings (no timezone arithmetic). */
export function WeekStrip({ weekStart, selectedDate, today, onSelectDate, onShiftWeek, countByDate }: WeekStripProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const range = `${formatDate(days[0], { year: undefined })} to ${formatDate(days[6])}`;

  return (
    <div className="flex items-center gap-2" role="group" aria-label={`Week of ${range}`}>
      <button
        type="button"
        aria-label="Previous week"
        onClick={() => onShiftWeek(-1)}
        className="focus-ring flex size-9 shrink-0 items-center justify-center rounded-sm text-text-secondary hover:bg-surface-sunken"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      <ol className="grid flex-1 grid-cols-7 gap-1">
        {days.map((iso) => {
          const isSelected = iso === selectedDate;
          const isToday = iso === today;
          const count = countByDate[iso] ?? 0;
          return (
            <li key={iso}>
              <button
                type="button"
                onClick={() => onSelectDate(iso)}
                aria-pressed={isSelected}
                aria-label={`${formatDate(iso, { weekday: "long", month: "long" })}${isToday ? ", today" : ""}, ${pluralize(count, "appointment")}`}
                className={cn(
                  "focus-ring relative flex w-full flex-col items-center gap-0.5 rounded-sm px-1 py-1.5 transition-colors",
                  isSelected ? "bg-brand text-text-inverted" : "hover:bg-surface-sunken",
                )}
              >
                <span className={cn("text-xs font-medium", isSelected ? "text-text-inverted" : "text-text-tertiary")}>
                  {formatDate(iso, { weekday: "short", day: undefined, month: undefined, year: undefined })}
                </span>
                <span
                  className={cn(
                    "text-base font-semibold tabular-nums",
                    isSelected ? "text-text-inverted" : isToday ? "text-brand-text" : "text-text-primary",
                  )}
                >
                  {Number(iso.slice(8, 10))}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "text-[11px] leading-none tabular-nums",
                    isSelected ? "text-text-inverted/90" : "text-text-tertiary",
                    count === 0 && "invisible",
                  )}
                >
                  {count}
                </span>
                {isToday && !isSelected && (
                  <span aria-hidden="true" className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand" />
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        aria-label="Next week"
        onClick={() => onShiftWeek(1)}
        className="focus-ring flex size-9 shrink-0 items-center justify-center rounded-sm text-text-secondary hover:bg-surface-sunken"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
