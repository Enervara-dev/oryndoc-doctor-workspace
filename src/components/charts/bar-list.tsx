interface BarListItem {
  label: string;
  value: number;
  colorVar?: string;
}

interface BarListProps {
  items: BarListItem[];
  valueFormatter?: (value: number) => string;
  /** Show each value's share of the total beside it. */
  showShare?: boolean;
  emptyText?: string;
}

/** Labelled horizontal bars. Values are always printed, so colour carries no meaning on its own. */
export function BarList({ items, valueFormatter, showShare = false, emptyText = "No data for this period yet." }: BarListProps) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const total = items.reduce((sum, i) => sum + i.value, 0);
  if (items.length === 0 || total === 0) return <p className="py-6 text-center text-[13px] text-text-tertiary">{emptyText}</p>;

  return (
    <dl className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
            <dt className="min-w-0 truncate text-text-secondary">{item.label}</dt>
            <dd className="shrink-0 text-text-primary tabular-nums">
              <span className="font-semibold">{valueFormatter ? valueFormatter(item.value) : item.value}</span>
              {showShare && <span className="text-text-tertiary"> ({Math.round((item.value / total) * 100)}%)</span>}
            </dd>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken" aria-hidden="true">
            <div
              className="h-full rounded-full"
              style={{ width: `${(item.value / max) * 100}%`, background: item.colorVar ?? "var(--color-chart-1)" }}
            />
          </div>
        </div>
      ))}
    </dl>
  );
}
