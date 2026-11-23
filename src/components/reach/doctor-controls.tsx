"use client";
import { useState } from "react";
import { Copy, UserPlus } from "lucide-react";
import { Button, Drawer } from "@/components/ui";
import { LiveForm, Field } from "./live-form";
import { useWorkspace } from "./shell/workspace-context";

/** "Add doctor" action for the page header. Same `doctor` operation as before. */
export function DoctorControls() {
  const { permissions, userId } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  if (!permissions.includes("doctors_staff:manage")) return null;
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="size-4" aria-hidden="true" />
        Add doctor
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Add a doctor" description="New doctors can be booked once they have working hours.">
        <LiveForm bare operation="doctor" label="Add doctor" onSaved={() => setOpen(false)}>
          <Field name="name" label="Full name" placeholder="e.g. Dr. Ananya Rao" autoComplete="off" />
          <Field name="specialty" label="Specialty" required={false} placeholder="e.g. Orthodontist" />
        </LiveForm>
        <div className="mt-6 rounded-sm bg-surface-sunken p-3 text-[13px] text-text-secondary">
          <p>Your own Central user ID, if you are linking yourself:</p>
          <p className="mt-1 flex items-center gap-2">
            <code className="min-w-0 truncate font-mono text-text-primary">{userId}</code>
            <button
              type="button"
              className="focus-ring inline-flex items-center gap-1 rounded-xs text-brand-text hover:underline"
              onClick={async () => {
                await navigator.clipboard.writeText(userId);
                setCopied(true);
              }}
            >
              <Copy className="size-3.5" aria-hidden="true" />
              {copied ? "Copied" : "Copy"}
            </button>
          </p>
        </div>
      </Drawer>
    </>
  );
}
