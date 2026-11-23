import type { BadgeTone } from "@/components/ui";
import type { AppointmentStatus, FollowUpStatus } from "@/lib/types";

export const appointmentStatusMeta: Record<AppointmentStatus, { label: string; tone: BadgeTone }> = {
  confirmed: { label: "Confirmed", tone: "success" },
  pending: { label: "Pending", tone: "warning" },
  completed: { label: "Completed", tone: "info" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  "no-show": { label: "No-show", tone: "danger" },
};

export const followUpStatusMeta: Record<FollowUpStatus, { label: string; tone: BadgeTone }> = {
  cancelled: { label: "Cancelled", tone: "neutral" },
  scheduled: { label: "Scheduled", tone: "info" },
  sent: { label: "Message sent", tone: "info" },
  confirmed: { label: "Confirmed", tone: "success" },
  overdue: { label: "Overdue", tone: "danger" },
  completed: { label: "Completed", tone: "success" },
};
