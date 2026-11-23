import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner, sets aria-busy and blocks repeat submits. */
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-brand text-text-inverted hover:bg-brand-hover active:bg-brand-active",
  secondary:
    "bg-surface text-text-primary border border-border-input hover:bg-surface-sunken active:bg-surface-sunken",
  ghost: "bg-transparent text-text-secondary hover:bg-surface-sunken hover:text-text-primary",
  danger: "bg-danger text-text-inverted hover:bg-[var(--od-danger-hover)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-11 px-5 text-[15px] gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "focus-ring inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm font-medium whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
