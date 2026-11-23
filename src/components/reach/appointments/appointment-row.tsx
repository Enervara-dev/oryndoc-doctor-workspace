import Link from "next/link";
import { Avatar, Badge } from "@/components/ui";
import { appointmentStatusMeta } from "@/lib/status";
import { cn, formatTime } from "@/lib/utils";
import type { Appointment } from "@/lib/types";

const channelLabels: Record<Appointment["channel"], string | null> = {
  "in-clinic": null, // the default; not worth a label on every row
  video: "Video",
  phone: "Phone",
};

interface AppointmentRowProps {
  appointment: Appointment;
  /** Opens the appointment in place (drawer). */
  onClick?: () => void;
  /** Navigates to the appointment (preferred outside the appointments page). */
  href?: string;
  /** Shown above the time when the row is outside a single-day list ("Tomorrow"). */
  dayLabel?: string;
  dense?: boolean;
}

/**
 * One appointment on the time rail: fixed tabular time column, patient,
 * service and doctor as separate facts, and a worded status.
 */
export function AppointmentRow({ appointment, onClick, href, dayLabel, dense = false }: AppointmentRowProps) {
  const status = appointmentStatusMeta[appointment.status];
  const channel = channelLabels[appointment.channel];
  const muted = appointment.status === "cancelled" || appointment.status === "no-show";

  const content = (
    <>
      <span className="w-[4.75rem] shrink-0 text-left">
        {dayLabel && <span className="block text-xs font-medium text-text-tertiary">{dayLabel}</span>}
        <time
          dateTime={`${appointment.date}T${appointment.startTime}`}
          className={cn("block text-sm font-semibold whitespace-nowrap tabular-nums", muted ? "text-text-tertiary" : "text-text-primary")}
        >
          {formatTime(appointment.startTime)}
        </time>
      </span>
      <span aria-hidden="true" className="h-9 w-px shrink-0 bg-border" />
      <span className="hidden sm:block">
        <Avatar name={appointment.patientName} size="sm" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm font-medium", muted ? "text-text-secondary line-through decoration-text-tertiary/60" : "text-text-primary")}>
          {appointment.patientName}
        </span>
        {!dense && (
          <span className="block truncate text-[13px] text-text-tertiary">
            {appointment.service}
            <span className="text-text-tertiary"> with </span>
            {appointment.doctorName}
            {channel && <span> ({channel})</span>}
          </span>
        )}
        <span className="mt-1 block sm:hidden">
          <Badge tone={status.tone} dot>
            {status.label}
          </Badge>
        </span>
      </span>
      <span className="hidden shrink-0 sm:block">
        <Badge tone={status.tone} dot>
          {status.label}
        </Badge>
      </span>
    </>
  );

  const className =
    "focus-ring flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left transition-colors hover:bg-surface-sunken";

  if (href)
    return (
      <Link prefetch={false} href={href} className={className}>
        {content}
      </Link>
    );
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  return <div className={className.replace("hover:bg-surface-sunken", "")}>{content}</div>;
}
