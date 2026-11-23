"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarX2 } from "lucide-react";
import { Card, Tabs, EmptyState, Button } from "@/components/ui";
import { addDays, dayLabel, formatLongDate, daysUntil, pluralize, todayInZone } from "@/lib/utils";
import type { Appointment, AppointmentStatus, Doctor } from "@/lib/types";
import { useWorkspace } from "@/components/reach/shell/workspace-context";
import { AppointmentFilters } from "./appointment-filters";
import { WeekStrip } from "./week-strip";
import { AppointmentRow } from "./appointment-row";
import { AppointmentDetailDrawer } from "./appointment-detail-drawer";

/** Monday-start week containing `date`. */
function weekStartOf(date: string): string {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDays(date, -((day + 6) % 7));
}

const isDate = (value: string | null): value is string => !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);

interface AppointmentsViewProps {
  appointments: Appointment[];
  doctors: Doctor[];
}

export function AppointmentsView({ appointments, doctors }: AppointmentsViewProps) {
  const { clinic } = useWorkspace();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const today = todayInZone(clinic.timezone);

  const initialDate = isDate(params.get("date")) ? params.get("date")! : today;
  const [view, setView] = useState<"day" | "list">(params.get("view") === "list" ? "list" : "day");
  const [search, setSearch] = useState("");
  const [doctorId, setDoctorId] = useState("all");
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [weekStart, setWeekStart] = useState(() => weekStartOf(initialDate));
  const [activeId, setActiveId] = useState<string | null>(params.get("appointment"));
  const activeAppointment = appointments.find((a) => a.id === activeId) ?? null;

  // Keep the URL in sync so the current day, view and open record are shareable.
  const syncUrl = useCallback(
    (next: { date?: string; view?: string; appointment?: string | null }) => {
      const query = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value === null || value === undefined || (key === "date" && value === today) || (key === "view" && value === "day"))
          query.delete(key);
        else query.set(key, value);
      }
      const qs = query.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router, today],
  );

  const filtered = useMemo(
    () =>
      appointments.filter((a) => {
        if (search && !a.patientName.toLowerCase().includes(search.toLowerCase())) return false;
        if (doctorId !== "all" && a.doctorId !== doctorId) return false;
        if (status !== "all" && a.status !== status) return false;
        return true;
      }),
    [appointments, search, doctorId, status],
  );

  const countByDate = useMemo(
    () =>
      filtered.reduce<Record<string, number>>((acc, a) => {
        acc[a.date] = (acc[a.date] ?? 0) + 1;
        return acc;
      }, {}),
    [filtered],
  );

  const dayAppointments = useMemo(
    () => filtered.filter((a) => a.date === selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [filtered, selectedDate],
  );

  const groupedList = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    const groups = new Map<string, Appointment[]>();
    for (const appt of sorted) groups.set(appt.date, [...(groups.get(appt.date) ?? []), appt]);
    return Array.from(groups.entries());
  }, [filtered]);

  const filtersActive = search !== "" || doctorId !== "all" || status !== "all";
  const nextWithAppointments = Object.keys(countByDate)
    .filter((d) => d > selectedDate)
    .sort()[0];

  function selectDate(date: string) {
    setSelectedDate(date);
    if (date < weekStart || date > addDays(weekStart, 6)) setWeekStart(weekStartOf(date));
    syncUrl({ date });
  }

  function open(appointment: Appointment) {
    setActiveId(appointment.id);
    syncUrl({ appointment: appointment.id });
  }

  const dayHeading = formatLongDate(selectedDate);
  const relative = Math.abs(daysUntil(selectedDate, today)) <= 1 ? dayLabel(selectedDate, today) : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          label="Appointment view"
          items={[
            { value: "day", label: "Day" },
            { value: "list", label: "All dates" },
          ]}
          value={view}
          onChange={(v) => {
            setView(v as "day" | "list");
            syncUrl({ view: v });
          }}
        />
        <AppointmentFilters
          search={search}
          onSearchChange={setSearch}
          doctorId={doctorId}
          onDoctorChange={setDoctorId}
          status={status}
          onStatusChange={setStatus}
          doctors={doctors}
        />
      </div>

      {view === "day" ? (
        <Card>
          <div className="border-b border-border px-3 py-3 sm:px-4">
            <WeekStrip
              weekStart={weekStart}
              selectedDate={selectedDate}
              today={today}
              onSelectDate={selectDate}
              onShiftWeek={(dir) => setWeekStart(addDays(weekStart, dir * 7))}
              countByDate={countByDate}
            />
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 pt-4 pb-2 sm:px-5">
            <h2 className="text-base font-semibold text-text-primary">
              {relative && <span>{relative}, </span>}
              {dayHeading}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-text-tertiary" aria-live="polite">
                {pluralize(dayAppointments.length, "appointment")}
              </span>
              {selectedDate !== today && (
                <Button variant="ghost" size="sm" onClick={() => selectDate(today)}>
                  Back to today
                </Button>
              )}
            </div>
          </div>
          <div className="px-2 pb-3 sm:px-3">
            {dayAppointments.length === 0 ? (
              <EmptyState
                compact
                icon={CalendarX2}
                title={filtersActive ? "No appointments match these filters" : "Nothing scheduled"}
                description={
                  filtersActive
                    ? "Clear a filter to see more of this day."
                    : nextWithAppointments
                      ? `The next appointment is on ${dayLabel(nextWithAppointments, today)}.`
                      : "No appointments are booked for this day."
                }
                action={
                  !filtersActive && nextWithAppointments ? (
                    <Button variant="secondary" size="sm" onClick={() => selectDate(nextWithAppointments)}>
                      Go to {dayLabel(nextWithAppointments, today)}
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {dayAppointments.map((appointment) => (
                  <li key={appointment.id}>
                    <AppointmentRow appointment={appointment} onClick={() => open(appointment)} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          {groupedList.length === 0 ? (
            <EmptyState
              icon={CalendarX2}
              title="No appointments found"
              description={filtersActive ? "Try clearing a filter." : "Appointments booked by staff or patients appear here."}
            />
          ) : (
            <div className="divide-y divide-border">
              {groupedList.map(([date, items]) => (
                <section key={date} aria-labelledby={`day-${date}`} className="px-2 py-3 sm:px-3">
                  <h3 id={`day-${date}`} className="mb-1 flex items-baseline gap-2 px-2 text-sm font-semibold text-text-primary">
                    {dayLabel(date, today)}
                    <span className="text-[13px] font-normal text-text-tertiary">{formatLongDate(date)}</span>
                  </h3>
                  <ul>
                    {items.map((appointment) => (
                      <li key={appointment.id}>
                        <AppointmentRow appointment={appointment} onClick={() => open(appointment)} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </Card>
      )}

      <AppointmentDetailDrawer
        appointment={activeAppointment}
        onClose={() => {
          setActiveId(null);
          syncUrl({ appointment: null });
        }}
      />
    </div>
  );
}
