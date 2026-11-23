import { cn } from "@/lib/utils";

const sizeStyles = {
  sm: "size-7 text-[11px]",
  md: "size-9 text-[13px]",
  lg: "size-12 text-base",
};

// Restrained tints from the token palette — identity aid, not decoration.
const palette = [
  "bg-brand-subtle text-brand-text",
  "bg-info-subtle text-info",
  "bg-surface-sunken text-text-secondary",
  "bg-warning-subtle text-warning",
];

function hashColor(input: string): string {
  const sum = input.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palette[sum % palette.length];
}

/** Two letters from a person's name, ignoring digits and punctuation. */
export function initialsFrom(name: string): string {
  const words = name
    .replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, "")
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}]/gu, ""))
    .filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

interface AvatarProps {
  /** Pre-computed initials (legacy) — clamped to two characters. */
  initials?: string;
  /** Preferred: the person's name; initials are derived safely. */
  name?: string;
  size?: keyof typeof sizeStyles;
  className?: string;
}

export function Avatar({ initials, name, size = "md", className }: AvatarProps) {
  const label = name ? initialsFrom(name) : initialsFrom(initials ?? "?");
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizeStyles[size],
        hashColor(name ?? label),
        className,
      )}
    >
      {label}
    </span>
  );
}
