"use client";
import { useId, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { mutateReach } from "@/lib/reach-actions";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Submits a Reach mutation through the `mutateReach` server action.
 * - `confirm`: destructive operations show an explicit second step first.
 * - `bare`: render without the panel chrome (when the parent already is one).
 * The result is announced in a live region next to the submit button.
 */
export function LiveForm({
  operation,
  children,
  label = "Save",
  onSaved,
  tone = "primary",
  confirm,
  bare = false,
  title,
  description,
  className,
}: {
  operation: string;
  children?: ReactNode;
  label?: string;
  onSaved?: () => void;
  tone?: "primary" | "secondary" | "danger";
  /** Question shown before a destructive submit, e.g. "Cancel this appointment?" */
  confirm?: string;
  bare?: boolean;
  title?: string;
  description?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const headingId = useId();

  async function submit() {
    if (!form.current) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await mutateReach(new FormData(form.current));
      setOk(result.ok);
      setMessage(result.message);
      if (result.ok) {
        setConfirming(false);
        router.refresh();
        onSaved?.();
      }
    } catch {
      setOk(false);
      setMessage("Couldn't save. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      ref={form}
      aria-labelledby={title ? headingId : undefined}
      className={cn(!bare && "rounded-md border border-border bg-surface p-4", "space-y-3", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (confirm && !confirming) {
          setConfirming(true);
          return;
        }
        void submit();
      }}
    >
      {title && (
        <div>
          <h3 id={headingId} className="text-sm font-semibold text-text-primary">
            {title}
          </h3>
          {description && <p className="mt-0.5 text-[13px] text-text-secondary">{description}</p>}
        </div>
      )}
      <input type="hidden" name="operation" value={operation} />
      <fieldset disabled={busy} className="min-w-0 space-y-3">
        {children}
        {confirming ? (
          <div role="alertdialog" aria-label={confirm} className="rounded-sm border border-danger/30 bg-danger-subtle p-3">
            <p className="text-sm font-medium text-danger">{confirm}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="submit" variant="danger" size="sm" loading={busy} autoFocus>
                {busy ? "Working…" : `Yes, ${label.toLowerCase()}`}
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setConfirming(false)}>
                Keep it
              </Button>
            </div>
          </div>
        ) : (
          <Button type="submit" variant={tone} size="md" loading={busy}>
            {busy ? "Saving…" : label}
          </Button>
        )}
      </fieldset>
      <div aria-live="polite" className="empty:hidden">
        {message && (
          <p className={cn("flex items-start gap-1.5 text-[13px]", ok ? "text-success" : "text-danger")}>
            {ok ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            ) : (
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            {message}
          </p>
        )}
      </div>
    </form>
  );
}

export const fieldControlClass =
  "focus-ring block h-9 w-full rounded-sm border border-border-input bg-surface px-3 text-sm text-text-primary placeholder:text-text-tertiary disabled:bg-surface-sunken disabled:text-text-disabled";

export function Field({
  name,
  label,
  type = "text",
  value,
  required = true,
  hint,
  autoComplete,
  inputMode,
  min,
  max,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  value?: string | number;
  required?: boolean;
  hint?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  min?: string | number;
  max?: string | number;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[13px] font-medium text-text-primary">
        {label}
        {!required && <span className="font-normal text-text-tertiary"> (optional)</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        autoComplete={autoComplete ?? "off"}
        inputMode={inputMode}
        min={min}
        max={max}
        placeholder={placeholder}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={fieldControlClass}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-text-tertiary">
          {hint}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  name,
  label,
  required = true,
  children,
  hint,
  defaultValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
  defaultValue?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[13px] font-medium text-text-primary">
        {label}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={cn(fieldControlClass, "px-2.5")}
      >
        {children}
      </select>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-text-tertiary">
          {hint}
        </p>
      )}
    </div>
  );
}
