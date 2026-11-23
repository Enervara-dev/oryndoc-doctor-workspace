import type { TrendPoint } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface TrendChartProps {
  data: TrendPoint[];
  colorVar?: string;
  height?: number;
  suffix?: string;
  /** Accessible name, e.g. "Appointments per week". */
  title: string;
}

const label = (raw: string) => (/^\d{4}-\d{2}-\d{2}/.test(raw) ? formatDate(raw, { year: undefined }) : raw);

/** Column chart with direct value labels and a screen-reader data table. */
export function TrendChart({ data, colorVar = "var(--color-chart-1)", height = 140, suffix = "", title }: TrendChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  if (data.length === 0) return <p className="py-8 text-center text-[13px] text-text-tertiary">No data for this period yet.</p>;

  return (
    <figure>
      <div aria-hidden="true">
        <div className="flex items-stretch gap-1.5 border-b border-chart-grid" style={{ height }}>
          {data.map((point) => (
            <div key={point.label} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-medium text-text-secondary tabular-nums">
                {point.value}
                {suffix}
              </span>
              <div className="flex w-full flex-1 items-end justify-center">
                <div
                  className="w-full max-w-10 rounded-t-[3px]"
                  style={{ height: `${Math.max((point.value / max) * 100, 2)}%`, background: colorVar }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex gap-1.5">
          {data.map((point) => (
            <span key={point.label} className="flex-1 truncate text-center text-[11px] text-text-tertiary tabular-nums">
              {label(point.label)}
            </span>
          ))}
        </div>
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Week starting</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.label}>
              <td>{label(p.label)}</td>
              <td>
                {p.value}
                {suffix}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
