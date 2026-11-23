import Link from "next/link";
import { ChevronRight, Stethoscope, Mic, Sparkles, ShieldCheck, type LucideIcon } from "lucide-react";
import type { Product, ProductId } from "@/lib/types";
import { cn } from "@/lib/utils";

const productIcons: Record<ProductId, LucideIcon> = {
  reach: Stethoscope,
  voice: Mic,
  assist: Sparkles,
  azure: ShieldCheck,
};

/** One product row. Only available products are links; the rest say plainly that they aren't ready. */
export function ProductCard({ product }: { product: Product; index?: number }) {
  const Icon = productIcons[product.id];
  const available = product.status === "available";
  const body = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-sm",
          available ? "bg-brand text-text-inverted" : "bg-surface-sunken text-text-tertiary",
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={cn("text-base font-semibold", available ? "text-text-primary" : "text-text-secondary")}>{product.name}</span>
          {!available && <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-medium text-text-tertiary">Not available yet</span>}
        </span>
        <span className="mt-0.5 block text-sm text-text-secondary">{product.tagline}</span>
        <span className="mt-1 block text-[13px] text-text-tertiary">{product.description}</span>
      </span>
      {available && <ChevronRight className="size-5 shrink-0 text-text-tertiary" aria-hidden="true" />}
    </>
  );
  const className = "flex items-start gap-4 px-5 py-4";
  return available ? (
    <Link prefetch={false} href={product.href} className={cn(className, "focus-ring hover:bg-surface-sunken")}>
      {body}
    </Link>
  ) : (
    <div className={className} aria-disabled="true">
      {body}
    </div>
  );
}
