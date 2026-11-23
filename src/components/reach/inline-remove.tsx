"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutateReach } from "@/lib/reach-actions";
import { Button } from "@/components/ui";

/** Small "Remove" control with an inline confirm step. Posts one Reach delete operation. */
export function InlineRemove({
  operation,
  fields,
  label,
}: {
  operation: string;
  fields: Record<string, string>;
  /** Accessible description of what is removed, e.g. "Monday 09:30 to 13:30". */
  label: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function remove() {
    setBusy(true);
    setError("");
    const form = new FormData();
    form.set("operation", operation);
    for (const [k, v] of Object.entries(fields)) form.set(k, v);
    try {
      const result = await mutateReach(form);
      if (result.ok) router.refresh();
      else setError(result.message);
    } catch {
      setError("Couldn't remove. Try again.");
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-1">
      {confirming ? (
        <>
          <Button size="sm" variant="danger" loading={busy} onClick={remove} aria-label={`Confirm removing ${label}`} autoFocus>
            Remove
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
            Keep
          </Button>
        </>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setConfirming(true)} aria-label={`Remove ${label}`}>
          Remove
        </Button>
      )}
      {error && (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}
    </span>
  );
}
