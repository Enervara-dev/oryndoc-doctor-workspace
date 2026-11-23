"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Drawer, Badge, Avatar } from "@/components/ui";
import { appointmentStatusMeta } from "@/lib/status";
import { dayLabel, daysUntil, formatLongDate, formatTime, todayInZone } from "@/lib/utils";
import type { Appointment } from "@/lib/types";
import { useWorkspace } from "@/components/reach/shell/workspace-context";
import { AppointmentActions } from "../appointment-actions";

const channelLabel: Record<Appointment["channel"], string> = {
  "in-clinic": "In clinic",
  video: "Video consultation",
  phone: "Phone consultation",
};

interface AppointmentDetailDrawerProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export function AppointmentDetailDrawer({ appointment, onClose }: AppointmentDetailDrawerProps) {
  const { clinic } = useWorkspace();
  const status = appointment ? appointmentStatusMeta[appointment.status] : null;
  const today = todayInZone(clinic.timezone);

  return (
    <Drawer open={Boolean(appointment)} onClose={onClose} title="Appointment" widthClassName="sm:max-w-md">
      {appointment && status && (
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Avatar name={appointment.patientName} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-text-primary">{appointment.patientName}</p>
              <p className="text-[13px] text-text-tertiary">
                {appointment.patientType === "new" ? "First visit" : "Returning patient"}
              </p>
              <Link
                prefetch={false}
                href={`/reach/patients/${appointment.patientId}`}
                className="focus-ring mt-1 inline-flex items-center gap-1 rounded-xs text-[13px] font-medium text-brand-text hover:underline"
              >
                Open patient record
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
          </div>

          <dl className="grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-2.5 text-sm">
            <dt className="text-text-tertiary">Date</dt>
            <dd className="text-text-primary">
              {Math.abs(daysUntil(appointment.date, today)) <= 1 && <span>{dayLabel(appointment.date, today)}, </span>}
              {formatLongDate(appointment.date)}
            </dd>
            <dt className="text-text-tertiary">Time</dt>
            <dd className="tabular-nums text-text-primary">
              {formatTime(appointment.startTime)} to {formatTime(appointment.endTime)}
            </dd>
            <dt className="text-text-tertiary">Service</dt>
            <dd className="text-text-primary">{appointment.service}</dd>
            <dt className="text-text-tertiary">Doctor</dt>
            <dd className="text-text-primary">{appointment.doctorName}</dd>
            <dt className="text-text-tertiary">Type</dt>
            <dd className="text-text-primary">{channelLabel[appointment.channel]}</dd>
            {appointment.notes && (
              <>
                <dt className="text-text-tertiary">Reason</dt>
                <dd className="whitespace-pre-line text-text-primary">{appointment.notes}</dd>
              </>
            )}
          </dl>

          {(appointment.status === "cancelled" || appointment.status === "no-show") && (
            <p className="rounded-sm bg-surface-sunken px-3 py-2.5 text-[13px] text-text-secondary">
              {appointment.status === "cancelled"
                ? "This appointment was cancelled and is no longer on the clinic schedule."
                : "The patient did not arrive for this appointment."}
            </p>
          )}

          <AppointmentActions appointment={appointment} onSaved={onClose} />
        </div>
      )}
    </Drawer>
  );
}
