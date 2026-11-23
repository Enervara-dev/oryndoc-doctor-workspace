"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, Drawer, Select } from "@/components/ui";
import { formatDate, formatTime, todayInZone, dayLabel } from "@/lib/utils";
import type { BlockedSlot, Doctor, DoctorSchedule, Holiday, WorkingHours } from "@/lib/types";
import { useWorkspace } from "../shell/workspace-context";
import { LiveForm, Field, SelectField } from "../live-form";
import { InlineRemove } from "../inline-remove";

interface ScheduleViewProps {
  doctors: Doctor[];
  schedules: DoctorSchedule[];
  blockedSlots: BlockedSlot[];
  holidays: Holiday[];
}

const WEEK: { key: WorkingHours["day"]; label: string; index: number }[] = [
  { key: "Mon", label: "Monday", index: 1 },
  { key: "Tue", label: "Tuesday", index: 2 },
  { key: "Wed", label: "Wednesday", index: 3 },
  { key: "Thu", label: "Thursday", index: 4 },
  { key: "Fri", label: "Friday", index: 5 },
  { key: "Sat", label: "Saturday", index: 6 },
  { key: "Sun", label: "Sunday", index: 0 },
];

type Adding = "hours" | "break" | "block" | "holiday" | null;

export function ScheduleView({ doctors: allDoctors, schedules, blockedSlots, holidays }: ScheduleViewProps) {
  const doctors = [...allDoctors].sort(
    (a, b) => Number(b.status === "active") - Number(a.status === "active") || a.name.localeCompare(b.name),
  );
  const { permissions, clinic } = useWorkspace();
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [adding, setAdding] = useState<Adding>(null);
  const manage = permissions.includes("scheduling:manage");
  const canBlock = permissions.includes("appointments:write");
  const today = todayInZone(clinic.timezone);

  const doctor = doctors.find((d) => d.id === doctorId);
  const schedule = schedules.find((s) => s.doctorId === doctorId);
  const blocks = blockedSlots.filter((b) => b.doctorId === doctorId && b.date >= today).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const upcomingHolidays = holidays.filter((h) => h.date >= today).sort((a, b) => a.date.localeCompare(b.date));

  if (doctors.length === 0)
    return <p className="rounded-md border border-border bg-surface p-6 text-sm text-text-secondary">Add a doctor first, then set their working hours here.</p>;

  const dayRows = WEEK.map((day) => ({
    ...day,
    hours: (schedule?.workingHours ?? []).filter((h) => h.day === day.key).sort((a, b) => (a.start ?? "").localeCompare(b.start ?? "")),
    breaks: (schedule?.breaks ?? []).filter((b) => b.label === day.key),
  }));

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="schedule-doctor" className="block text-[13px] font-medium text-text-primary">
            Doctor
          </label>
          <Select id="schedule-doctor" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="min-w-[16rem]">
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
                {d.specialty ? ` (${d.specialty})` : ""}
                {d.status !== "active" ? ", inactive" : ""}
              </option>
            ))}
          </Select>
        </div>
        <p className="pb-2 text-[13px] text-text-tertiary">Times are in {clinic.timezone}.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="border-b border-border">
            <div>
              <CardTitle>Weekly hours</CardTitle>
              <p className="text-[13px] text-text-tertiary">When {doctor?.name ?? "this doctor"} can be booked, minus breaks.</p>
            </div>
            {manage && (
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setAdding("break")}>
                  <Plus className="size-4" aria-hidden="true" />
                  Break
                </Button>
                <Button size="sm" onClick={() => setAdding("hours")}>
                  <Plus className="size-4" aria-hidden="true" />
                  Hours
                </Button>
              </div>
            )}
          </CardHeader>
          <table className="w-full text-sm">
            <caption className="sr-only">Weekly working hours and breaks</caption>
            <tbody className="divide-y divide-border">
              {dayRows.map((day) => (
                <tr key={day.key} className="align-top">
                  <th scope="row" className="w-28 px-5 py-3 text-left font-medium text-text-primary">
                    {day.label}
                  </th>
                  <td className="px-2 py-2 sm:px-5">
                    {day.hours.length === 0 ? (
                      <span className="inline-block py-1 text-text-tertiary">Not working</span>
                    ) : (
                      <ul className="space-y-1">
                        {day.hours.map((h) => (
                          <Range key={h.id} label={`${formatTime(h.start!)} to ${formatTime(h.end!)}`}>
                            {manage && h.id && (
                              <InlineRemove operation="hours-delete" fields={{ doctorId, id: h.id }} label={`${day.label} hours ${h.start} to ${h.end}`} />
                            )}
                          </Range>
                        ))}
                        {day.breaks.map((b) => (
                          <Range key={b.id} muted label={`Break ${formatTime(b.start)} to ${formatTime(b.end)}`}>
                            {manage && (
                              <InlineRemove operation="break-delete" fields={{ doctorId, id: b.id }} label={`${day.label} break ${b.start}`} />
                            )}
                          </Range>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Blocked time</CardTitle>
                <p className="text-[13px] text-text-tertiary">One-off unavailability for this doctor.</p>
              </div>
              {canBlock && (
                <Button size="sm" variant="secondary" onClick={() => setAdding("block")}>
                  <Plus className="size-4" aria-hidden="true" />
                  Block
                </Button>
              )}
            </CardHeader>
            <ListOrEmpty empty="No upcoming blocked time.">
              {blocks.map((slot) => (
                <li key={slot.id} className="flex items-center justify-between gap-2 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {dayLabel(slot.date, today)}, {formatTime(slot.start)} to {formatTime(slot.end)}
                    </p>
                    <p className="truncate text-[13px] text-text-tertiary">{slot.reason || "No reason given"}</p>
                  </div>
                  {canBlock && <InlineRemove operation="block-delete" fields={{ id: slot.id }} label={`blocked time on ${slot.date}`} />}
                </li>
              ))}
            </ListOrEmpty>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Clinic holidays</CardTitle>
                <p className="text-[13px] text-text-tertiary">No one can be booked on these days.</p>
              </div>
              {manage && (
                <Button size="sm" variant="secondary" onClick={() => setAdding("holiday")}>
                  <Plus className="size-4" aria-hidden="true" />
                  Holiday
                </Button>
              )}
            </CardHeader>
            <ListOrEmpty empty="No upcoming holidays.">
              {upcomingHolidays.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-2 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">{h.label}</p>
                    <p className="text-[13px] text-text-tertiary">{formatDate(h.date, { weekday: "short" })}</p>
                  </div>
                  {manage && <InlineRemove operation="holiday-delete" fields={{ id: h.id }} label={`holiday ${h.label}`} />}
                </li>
              ))}
            </ListOrEmpty>
          </Card>
        </div>
      </div>

      <Drawer
        open={adding !== null}
        onClose={() => setAdding(null)}
        title={
          adding === "hours" ? "Add working hours" : adding === "break" ? "Add a break" : adding === "block" ? "Block time" : "Add a clinic holiday"
        }
        description={adding === "holiday" ? "Applies to every doctor." : `For ${doctor?.name ?? "the selected doctor"}. Times in ${clinic.timezone}.`}
      >
        {(adding === "hours" || adding === "break") && (
          <LiveForm bare operation={adding} label={adding === "hours" ? "Add hours" : "Add break"} onSaved={() => setAdding(null)}>
            <input name="doctorId" value={doctorId} type="hidden" />
            <SelectField name="dayOfWeek" label="Day" defaultValue="1">
              {WEEK.map((d) => (
                <option key={d.index} value={d.index}>
                  {d.label}
                </option>
              ))}
            </SelectField>
            <div className="grid grid-cols-2 gap-3">
              <Field name="start" label="From" type="time" />
              <Field name="end" label="Until" type="time" />
            </div>
          </LiveForm>
        )}
        {adding === "block" && (
          <LiveForm bare operation="block" label="Block time" onSaved={() => setAdding(null)}>
            <input name="doctorId" value={doctorId} type="hidden" />
            <Field name="date" label="Date" type="date" min={today} value={today} />
            <div className="grid grid-cols-2 gap-3">
              <Field name="start" label="From" type="time" />
              <Field name="end" label="Until" type="time" />
            </div>
            <Field name="reason" label="Reason" required={false} placeholder="e.g. Conference" />
          </LiveForm>
        )}
        {adding === "holiday" && (
          <LiveForm bare operation="holiday" label="Add holiday" onSaved={() => setAdding(null)}>
            <Field name="name" label="Holiday name" placeholder="e.g. Diwali" />
            <Field name="date" label="Date" type="date" min={today} />
          </LiveForm>
        )}
      </Drawer>
    </div>
  );
}

function Range({ label, muted = false, children }: { label: string; muted?: boolean; children?: ReactNode }) {
  return (
    <li className="flex min-h-8 items-center justify-between gap-2">
      <span className={muted ? "text-[13px] text-text-tertiary" : "font-medium text-text-primary tabular-nums"}>{label}</span>
      {children}
    </li>
  );
}

function ListOrEmpty({ empty, children }: { empty: string; children: ReactNode[] }) {
  return children.length === 0 ? (
    <p className="px-5 pb-5 text-[13px] text-text-tertiary">{empty}</p>
  ) : (
    <ul className="divide-y divide-border px-5 pb-2">{children}</ul>
  );
}
