"use client";
import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button, Drawer } from "@/components/ui";
import { LiveForm, Field, SelectField } from "./live-form";
import type { Patient, Doctor } from "@/lib/types";
import { todayInZone } from "@/lib/utils";

/**
 * Staff booking. Opens in a drawer from the page header so the schedule stays
 * visible. Same `appointment-create` operation and idempotency handling as before.
 */
export function BookingForm({
  patients,
  doctors,
  services,
  timezone,
}: {
  patients: Patient[];
  doctors: Doctor[];
  services: { id: string; name: string }[];
  timezone: string;
}) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(() => crypto.randomUUID());
  const activeDoctors = doctors.filter((d) => d.status === "active");
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <CalendarPlus className="size-4" aria-hidden="true" />
        New appointment
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="New appointment"
        description={`Times are in the clinic's timezone (${timezone}). Reach checks availability before booking.`}
      >
        <LiveForm
          bare
          operation="appointment-create"
          label="Book appointment"
          onSaved={() => {
            setKey(crypto.randomUUID());
            setOpen(false);
          }}
        >
          <input type="hidden" name="idempotencyKey" value={key} />
          <SelectField
            name="patientId"
            label="Patient"
            hint={patients.length === 0 ? "No patients yet. Add the patient from the Patients page first." : undefined}
          >
            <option value="">Choose a patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </SelectField>
          <SelectField name="doctorId" label="Doctor">
            <option value="">Choose a doctor</option>
            {activeDoctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
                {d.specialty ? ` (${d.specialty})` : ""}
              </option>
            ))}
          </SelectField>
          <SelectField name="serviceId" label="Service">
            <option value="">Choose a service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </SelectField>
          <div className="grid grid-cols-2 gap-3">
            <Field name="date" type="date" label="Date" min={todayInZone(timezone)} value={todayInZone(timezone)} />
            <Field name="start" type="time" label="Start time" />
          </div>
          <Field name="chiefComplaint" label="Reason for visit" hint="Visible to the treating doctor." />
        </LiveForm>
      </Drawer>
    </>
  );
}
