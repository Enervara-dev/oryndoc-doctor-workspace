import { cn } from "@/lib/utils";

/**
 * Oryndoc mark: a ring with a gap at "now" — the time rail motif folded into a circle.
 * Uses currentColor so it adapts to any surface.
 */
export function OryndocMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7 text-brand", className)}>
      <rect width="32" height="32" rx="7" fill="currentColor" />
      <path d="M22.5 10.2A9 9 0 1 0 25 16" fill="none" stroke="var(--od-on-primary)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="25" cy="10.5" r="2" fill="var(--od-on-primary)" />
    </svg>
  );
}

export function Wordmark({ product, className }: { product?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <OryndocMark />
      <span className="text-[17px] font-semibold text-text-primary" translate="no">
        Oryndoc
      </span>
      {product && <span className="text-[15px] text-text-tertiary">{product}</span>}
    </span>
  );
}
