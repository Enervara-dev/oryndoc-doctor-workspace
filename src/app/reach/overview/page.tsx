import Link from "next/link";
import { Fragment } from "react";
import { CalendarCheck2, CalendarClock, CalendarX2, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/reach/page-header";
import { NoAccess } from "@/components/reach/no-access";
import { BookingForm } from "@/components/reach/booking-form";
import { AppointmentRow } from "@/components/reach/appointments/appointment-row";
import { Card, CardHeader, CardTitle, Badge, EmptyState } from "@/components/ui";
import { getAppointments } from "@/lib/api/appointments";
import { getFollowUps } from "@/lib/api/follow-ups";
import { getPatients } from "@/lib/api/patients";
import { getDoctors } from "@/lib/api/staff";
import { apiFetch } from "@/lib/api/client";
import { followUpStatusMeta } from "@/lib/status";
import { hasPermission } from "@/lib/workspace";
import { getRawClinic } from "@/lib/api/clinic";
import { localParts } from "@/lib/api/models";
import { addDays, cn, dayLabel, formatLongDate, pluralize, relativeDayLabel, todayInZone } from "@/lib/utils";

const appointmentHref = (id: string, date: string) => `/reach/appointments?date=${date}&appointment=${id}`;

export default async function OverviewPage() {
  if (!(await hasPermission("appointments:read"))) return <NoAccess area="the overview" />;
  const canFollowUps = await hasPermission("followups:read");
  const canBook = (await hasPermission("appointments:write")) && (await hasPermission("patients:read"));
  const clinic = await getRawClinic();

  const [{ data: appointments }, { data: followUps }, booking] = await Promise.all([
    getAppointments(),
    canFollowUps ? getFollowUps() : Promise.resolve({ data: [] as Awaited<ReturnType<typeof getFollowUps>>["data"] }),
    canBook
      ? Promise.all([getPatients(), getDoctors(), apiFetch<{ id: string; name: string }[]>("/services")])
      : Promise.resolve(null),
  ]);

  const now = new Date();
  const today = todayInZone(clinic.timezone, now);
  const nowTime = localParts(now.toISOString(), clinic.timezone).time;

  const todays = appointments
    .filter((a) => a.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  const active = todays.filter((a) => a.status !== "cancelled");
  const confirmed = todays.filter((a) => a.status === "confirmed").length;
  const pending = todays.filter((a) => a.status === "pending").length;
  const completed = todays.filter((a) => a.status === "completed").length;
  const firstVisits = active.filter((a) => a.patientType === "new").length;
  const remaining = todays.filter((a) => (a.status === "confirmed" || a.status === "pending") && a.startTime >= nowTime).length;

  const comingUp = appointments
    .filter((a) => a.date > today && (a.status === "confirmed" || a.status === "pending"))
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 5);

  const overdue = followUps.filter((f) => f.status === "overdue");
  const dueFollowUps = followUps
    .filter((f) => f.status === "scheduled" || f.status === "overdue")
    .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate))
    .slice(0, 5);

  // Patient mix over a stated period, counting each patient once.
  const windowStart = addDays(today, -29);
  const seen = new Map<string, "new" | "returning">();
  for (const a of appointments)
    if (a.date >= windowStart && a.date <= today && a.status !== "cancelled")
      if (!seen.has(a.patientId) || a.patientType === "new") seen.set(a.patientId, a.patientType);
  const newCount = [...seen.values()].filter((t) => t === "new").length;
  const returningCount = seen.size - newCount;
  const pct = (n: number) => (seen.size ? Math.round((n / seen.size) * 100) : 0);

  // Where the "now" rule sits on today's agenda.
  const nowIndex = todays.findIndex((a) => a.startTime >= nowTime);

  const metrics = [
    {
      label: "Appointments today",
      value: active.length,
      detail: active.length ? `${confirmed} confirmed, ${pending} pending` : "None booked",
      href: "/reach/appointments",
    },
    {
      label: "Still to see",
      value: remaining,
      detail: completed ? `${completed} completed so far` : "None completed yet",
      href: "/reach/appointments",
    },
    {
      label: "First visits today",
      value: firstVisits,
      detail: firstVisits ? "New to this clinic" : "All returning patients",
      href: "/reach/appointments",
    },
    ...(canFollowUps
      ? [
          {
            label: "Overdue follow-ups",
            value: overdue.length,
            detail: overdue.length ? "Need contacting" : "Nothing overdue",
            href: "/reach/follow-ups",
            alert: overdue.length > 0,
          },
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader
        title="Today"
        description={formatLongDate(today)}
        actions={
          booking ? (
            <BookingForm
              patients={booking[0].data}
              doctors={booking[1].data}
              services={booking[2]}
              timezone={clinic.timezone}
            />
          ) : undefined
        }
      />

      <Card className="mb-5">
        <dl className={cn("grid grid-cols-2 divide-border", metrics.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={cn(
                "border-border",
                i % 2 === 1 && "border-l",
                i >= 2 && "border-t lg:border-t-0",
                i >= 1 && "lg:border-l",
              )}
            >
              <Link
                prefetch={false}
                href={m.href}
                className="focus-ring group flex h-full flex-col gap-1 rounded-md p-4 hover:bg-surface-sunken sm:px-5"
              >
                <dt className="text-[13px] font-medium text-text-secondary">{m.label}</dt>
                <dd
                  className={cn(
                    "text-[1.75rem] leading-none font-semibold tabular-nums",
                    "alert" in m && m.alert ? "text-danger" : "text-text-primary",
                  )}
                >
                  {m.value}
                </dd>
                <dd className="text-[13px] text-text-tertiary">{m.detail}</dd>
              </Link>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="h-fit lg:col-span-2">
          <CardHeader className="border-b border-border">
            <div>
              <CardTitle>Today&apos;s agenda</CardTitle>
              <p className="text-[13px] text-text-tertiary">{pluralize(todays.length, "appointment")}</p>
            </div>
            <Link
              prefetch={false}
              href="/reach/appointments"
              className="focus-ring inline-flex items-center gap-0.5 rounded-xs text-[13px] font-medium text-brand-text hover:underline"
            >
              Full schedule
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </CardHeader>
          {todays.length === 0 ? (
            <EmptyState
              icon={CalendarX2}
              title="No appointments today"
              description={
                comingUp[0]
                  ? `Next appointment: ${comingUp[0].patientName}, ${dayLabel(comingUp[0].date, today)}.`
                  : "Appointments booked by staff or patients will appear here."
              }
            />
          ) : (
            <ol className="px-2 py-2 sm:px-3">
              {todays.map((appointment, i) => (
                <Fragment key={appointment.id}>
                  {i === nowIndex && <NowRule />}
                  <li>
                    <AppointmentRow appointment={appointment} href={appointmentHref(appointment.id, appointment.date)} />
                  </li>
                </Fragment>
              ))}
              {nowIndex === -1 && <NowRule label="Day complete" />}
            </ol>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Coming up</CardTitle>
              <CalendarCheck2 className="size-4 text-text-tertiary" aria-hidden="true" />
            </CardHeader>
            {comingUp.length === 0 ? (
              <p className="px-5 pb-5 text-[13px] text-text-tertiary">Nothing booked after today yet.</p>
            ) : (
              <ol className="px-2 pb-2 sm:px-3">
                {comingUp.map((appointment) => (
                  <li key={appointment.id}>
                    <AppointmentRow
                      dense
                      appointment={appointment}
                      dayLabel={dayLabel(appointment.date, today)}
                      href={appointmentHref(appointment.id, appointment.date)}
                    />
                  </li>
                ))}
              </ol>
            )}
          </Card>

          {canFollowUps && (
            <Card>
              <CardHeader>
                <CardTitle>Follow-ups due</CardTitle>
                {dueFollowUps.length > 0 && (
                  <Link
                    prefetch={false}
                    href="/reach/follow-ups"
                    className="focus-ring rounded-xs text-[13px] font-medium text-brand-text hover:underline"
                  >
                    View all
                  </Link>
                )}
              </CardHeader>
              {dueFollowUps.length === 0 ? (
                <EmptyState compact icon={CalendarClock} title="No follow-ups due" />
              ) : (
                <ul className="divide-y divide-border px-5 pb-2">
                  {dueFollowUps.map((followUp) => {
                    const meta = followUpStatusMeta[followUp.status];
                    return (
                      <li key={followUp.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-text-primary">{followUp.patientName}</p>
                          <p className="truncate text-[13px] text-text-tertiary">{followUp.reasonLabel}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Badge tone={meta.tone} dot>
                            {meta.label}
                          </Badge>
                          <span className="text-xs text-text-tertiary">{relativeDayLabel(followUp.followUpDate, today)}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          )}

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Patient mix</CardTitle>
                <p className="text-[13px] text-text-tertiary">Last 30 days, {pluralize(seen.size, "patient")}</p>
              </div>
            </CardHeader>
            {seen.size === 0 ? (
              <p className="px-5 pb-5 text-[13px] text-text-tertiary">No visits in the last 30 days.</p>
            ) : (
              <dl className="space-y-3 px-5 pb-5">
                {[
                  { label: "First visit", count: newCount, color: "bg-chart-1" },
                  { label: "Returning", count: returningCount, color: "bg-chart-3" },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-1 flex items-baseline justify-between text-[13px]">
                      <dt className="text-text-secondary">{row.label}</dt>
                      <dd className="tabular-nums text-text-primary">
                        <span className="font-semibold">{row.count}</span>
                        <span className="text-text-tertiary"> ({pct(row.count)}%)</span>
                      </dd>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-sunken" aria-hidden="true">
                      <div className={cn("h-full rounded-full", row.color)} style={{ width: `${pct(row.count)}%` }} />
                    </div>
                  </div>
                ))}
              </dl>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function NowRule({ label = "Now" }: { label?: string }) {
  return (
    <li aria-label={label} className="flex items-center gap-2 px-2 py-1">
      <span className="w-[4.75rem] text-xs font-semibold text-brand-text">{label}</span>
      <span aria-hidden="true" className="h-0.5 flex-1 rounded-full bg-brand" />
    </li>
  );
}
