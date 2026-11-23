"use client";
import { LiveForm, Field, SelectField } from "./live-form";
import { useWorkspace } from "./shell/workspace-context";
import type { Appointment } from "@/lib/types";

/** Staff actions for a confirmed appointment. Same server operations as before; clearer grouping. */
export function AppointmentActions({ appointment, onSaved }: { appointment: Appointment; onSaved: () => void }) {
  const { permissions, clinic } = useWorkspace();
  if (!permissions.includes("appointments:write") || appointment.status !== "confirmed") return null;
  return (
    <section aria-labelledby="appointment-actions" className="space-y-3 border-t border-border pt-5">
      <h3 id="appointment-actions" className="text-sm font-semibold text-text-primary">
        Update this appointment
      </h3>
      <LiveForm
        operation="appointment-status"
        label="Record outcome"
        tone="secondary"
        onSaved={onSaved}
        title="Visit outcome"
        description="Record what happened once the appointment time has passed."
      >
        <input name="id" type="hidden" value={appointment.id} />
        <SelectField name="status" label="Outcome">
          <option value="COMPLETED">Completed</option>
          <option value="NO_SHOW">Patient did not arrive (no-show)</option>
        </SelectField>
      </LiveForm>
      <LiveForm
        operation="appointment-reschedule"
        label="Reschedule"
        tone="secondary"
        onSaved={onSaved}
        title="Reschedule"
        description={`Times are in the clinic's timezone (${clinic.timezone}). Reach checks the doctor's availability.`}
      >
        <input name="id" type="hidden" value={appointment.id} />
        <div className="grid grid-cols-2 gap-3">
          <Field name="date" type="date" label="New date" value={appointment.date} />
          <Field name="start" type="time" label="New start time" />
        </div>
      </LiveForm>
      <LiveForm
        operation="appointment-cancel"
        label="Cancel appointment"
        tone="danger"
        confirm="Cancel this appointment? The slot is released and the patient keeps their record."
        onSaved={onSaved}
      >
        <input name="id" type="hidden" value={appointment.id} />
      </LiveForm>
    </section>
  );
}
