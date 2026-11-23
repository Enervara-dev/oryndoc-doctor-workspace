import { type InputHTMLAttributes, type SelectHTMLAttributes, forwardRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "focus-ring h-9 rounded-sm border border-border-input bg-surface text-sm text-text-primary placeholder:text-text-tertiary disabled:bg-surface-sunken disabled:text-text-disabled";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(control, "w-full px-3", className)} {...props} />,
);
Input.displayName = "Input";

/** Search field with a visible icon and an accessible name (defaults to the placeholder). */
export function SearchInput({ className, "aria-label": ariaLabel, placeholder, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-tertiary" />
      <Input
        type="search"
        aria-label={ariaLabel ?? placeholder?.replace(/[.…]+$/, "")}
        placeholder={placeholder}
        className={cn("pl-8", className)}
        {...props}
      />
    </div>
  );
}

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(control, "px-2.5", className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";
