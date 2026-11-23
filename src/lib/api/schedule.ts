import type {
  ApiResult,
  BlockedSlot,
  DoctorSchedule,
  Holiday,
  WorkingHours,
} from "../types";
import { apiFetch } from "./client";
import { getDoctors } from "./staff";
import { getRawClinic } from "./clinic";
import { localParts, minuteTime } from "./models";
const days: WorkingHours["day"][] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];
interface Range {
  id: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
}
export async function getDoctorSchedules(): Promise<
  ApiResult<DoctorSchedule[]>
> {
  const { data } = await getDoctors();
  return {
    source: "api",
    data: await Promise.all(
      data.map(async (d) => {
        const [hours, breaks] = await Promise.all([
          apiFetch<Range[]>(`/doctors/${d.id}/working-hours`),
          apiFetch<Range[]>(`/doctors/${d.id}/breaks`),
        ]);
        return {
          doctorId: d.id,
          workingHours: hours.map((h) => ({
            id: h.id,
            day: days[h.dayOfWeek],
            isWorking: true,
            start: minuteTime(h.startMinute),
            end: minuteTime(h.endMinute),
          })),
          breaks: breaks.map((b) => ({
            id: b.id,
            label: days[b.dayOfWeek],
            start: minuteTime(b.startMinute),
            end: minuteTime(b.endMinute),
          })),
        };
      }),
    ),
  };
}
export async function getBlockedSlots(): Promise<ApiResult<BlockedSlot[]>> {
  const [rows, c] = await Promise.all([
    apiFetch<
      {
        id: string;
        doctorId: string;
        startUtc: string;
        endUtc: string;
        reason?: string;
      }[]
    >("/slot-blocks"),
    getRawClinic(),
  ]);
  return {
    source: "api",
    data: rows.map((r) => ({
      id: r.id,
      doctorId: r.doctorId,
      date: localParts(r.startUtc, c.timezone).date,
      start: localParts(r.startUtc, c.timezone).time,
      end: localParts(r.endUtc, c.timezone).time,
      reason: r.reason || "",
    })),
  };
}
export async function getHolidays(): Promise<ApiResult<Holiday[]>> {
  return {
    source: "api",
    data: (
      await apiFetch<{ id: string; name: string; date: string }[]>("/holidays")
    ).map((h) => ({ id: h.id, label: h.name, date: h.date.slice(0, 10) })),
  };
}
