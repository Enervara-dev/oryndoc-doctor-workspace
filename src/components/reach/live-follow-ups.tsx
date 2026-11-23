"use client";
import { useMemo, useState } from "react";
import { CalendarClock, CalendarPlus } from "lucide-react";
import type { Appointment, FollowUp, FollowUpReason, FollowUpMessage, Clinic, FollowUpStatus } from "@/lib/types";
import { Badge, Button, Card, Drawer, EmptyState, Tabs } from "@/components/ui";
import { LiveForm, Field, SelectField } from "./live-form";
import { useWorkspace } from "./shell/workspace-context";
import { followUpStatusMeta } from "@/lib/status";
import { addDays, dayLabel, formatDate, pluralize, relativeDayLabel, todayInZone } from "@/lib/utils";
import { FollowUpDetailDrawer } from "./follow-ups/follow-up-detail-drawer";

type Filter = "open" | "overdue" | "closed" | "all";
const OPEN: FollowUpStatus[] = ["scheduled", "sent", "confirmed", "overdue"];

export function LiveFollowUps({
  followUps,
  reasons,
  appointments,
  messages,
  clinic,
}: {
  followUps: FollowUp[];
  reasons: FollowUpReason[];
  appointments: Appointment[];
  messages: FollowUpMessage[];
  clinic: Clinic;
}) {
  const { permissions } = useWorkspace();
  const [active, setActive] = useState<FollowUp | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [key, setKey] = useState(() => crypto.randomUUID());
  const [filter, setFilter] = useState<Filter>("open");
  const write = permissions.includes("followups:write");
  const today = todayInZone(clinic.timezone);

  const counts = {
    open: followUps.filter((f) => OPEN.includes(f.status)).length,
    overdue: followUps.filter((f) => f.status === "overdue").length,
    closed: followUps.filter((f) => !OPEN.includes(f.status)).length,
    all: followUps.length,
  };
  const shown = useMemo(
    () =>
      followUps
        .filter((f) =>
          filter === "all" ? true : filter === "open" ? OPEN.includes(f.status) : filter === "overdue" ? f.status === "overdue" : !OPEN.includes(f.status),
        )
        .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate)),
    [followUps, filter],
  );

  // Recent visits first: follow-ups are scheduled from an appointment that already happened or is booked.
  const appointmentOptions = useMemo(
    () => [...appointments].filter((a) => a.status !== "cancelled").sort((a, b) => b.date.localeCompare(a.date)).slice(0, 200),
    [appointments],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          label="Follow-up status"
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          items={[
            { value: "open", label: "Open", count: counts.open },
            { value: "overdue", label: "Overdue", count: counts.overdue },
            { value: "closed", label: "Closed", count: counts.closed },
            { value: "all", label: "All", count: counts.all },
          ]}
        />
        {write && (
          <Button onClick={() => setScheduling(true)}>
            <CalendarPlus className="size-4" aria-hidden="true" />
            Schedule follow-up
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        {shown.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title={followUps.length === 0 ? "No follow-ups yet" : "Nothing in this view"}
            description={
              followUps.length === 0
                ? "Schedule a return visit from a patient's appointment and Reach will send the reminder."
                : "Choose another filter to see more."
            }
            action={
              write && followUps.length === 0 ? (
                <Button variant="secondary" size="sm" onClick={() => setScheduling(true)}>
                  Schedule follow-up
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {shown.map((f) => {
              const meta = followUpStatusMeta[f.status];
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setActive(f)}
                    className="focus-ring flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-surface-sunken sm:px-5"
                  >
                    <span className="w-24 shrink-0">
                      <span className="block text-sm font-semibold text-text-primary tabular-nums">{dayLabel(f.followUpDate, today)}</span>
                      <span className="block text-xs text-text-tertiary">{relativeDayLabel(f.followUpDate, today)}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-text-primary">{f.patientName}</span>
                      <span className="block truncate text-[13px] text-text-tertiary">
                        {f.reasonLabel} with {f.doctorName}
                      </span>
                      {f.messageError && <span className="block truncate text-[13px] text-danger">Reminder failed</span>}
                    </span>
                    <Badge tone={meta.tone} dot className="shrink-0">
                      {meta.label}
                    </Badge>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {write && (
        <Drawer
          open={scheduling}
          onClose={() => setScheduling(false)}
          title="Schedule a follow-up"
          description="Pick the visit it follows, when the patient should return and why."
        >
          <LiveForm
            bare
            operation="followup-create"
            label="Schedule follow-up"
            onSaved={() => {
              setKey(crypto.randomUUID());
              setScheduling(false);
            }}
          >
            <input name="idempotencyKey" value={key} type="hidden" />
            <SelectField
              name="appointmentId"
              label="Visit"
              hint={appointmentOptions.length === 0 ? "No appointments to attach a follow-up to yet." : `${pluralize(appointmentOptions.length, "recent visit")}, newest first.`}
            >
              <option value="">Choose patient and visit</option>
              {appointmentOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.patientName}, {formatDate(a.date)} with {a.doctorName}
                </option>
              ))}
            </SelectField>
            <Field name="date" type="date" label="Return on" min={today} value={addDays(today, 14)} />
            <SelectField name="reasonId" label="Reason" hint={reasons.length === 0 ? "Add reasons in Settings first." : undefined}>
              <option value="">Choose a reason</option>
              {reasons.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </SelectField>
          </LiveForm>
        </Drawer>
      )}

      <FollowUpDetailDrawer
        followUp={active}
        messages={messages.filter((m) => m.followUpId === active?.id)}
        clinic={clinic}
        onClose={() => setActive(null)}
      />
    </div>
  );
}
