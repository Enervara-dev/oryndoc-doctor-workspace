import type { AnalyticsSummary, ApiResult } from "../types";
import { getRawClinic } from "./clinic";
import { localParts } from "./models";
import { apiFetch } from "./client";
interface Counts {
  COMPLETED: number;
  CONFIRMED: number;
  CANCELLED: number;
  NO_SHOW: number;
}
export async function getAnalyticsSummary(): Promise<
  ApiResult<AnalyticsSummary>
> {
  const clinic = await getRawClinic();
  const to = localParts(new Date().toISOString(), clinic.timezone).date,
    from = new Date(new Date(to + "T00:00:00Z").getTime() - 55 * 86400000)
      .toISOString()
      .slice(0, 10),
    q = `?from=${from}&to=${to}`;
  const [trends, patients, followups, doctors, services] = await Promise.all([
    apiFetch<{
      buckets: { bucket: string; total: number; byStatus: Counts }[];
    }>(`/analytics/appointments/trends${q}&groupBy=week`),
    apiFetch<{ newPatients: number; returningPatients: number }>(
      `/analytics/patients/new-vs-returning${q}`,
    ),
    apiFetch<{
      byStatus: { COMPLETED: number; SCHEDULED: number; PENDING: number };
      overdueCount: number;
    }>(`/analytics/follow-ups${q}`),
    apiFetch<{
      doctors: {
        doctorId: string;
        doctorName: string;
        total: number;
        byStatus: Counts;
      }[];
    }>(`/analytics/doctors/workload${q}`),
    apiFetch<{ service: string; appointments: number }[]>(
      `/analytics/services${q}`,
    ),
  ]);
  return {
    source: "api",
    data: {
      totalAppointments: trends.buckets.map((b) => ({
        label: b.bucket,
        value: b.total,
      })),
      noShowRate: trends.buckets.map((b) => ({
        label: b.bucket,
        value: b.total ? (100 * b.byStatus.NO_SHOW) / b.total : 0,
      })),
      cancellationRate: trends.buckets.map((b) => ({
        label: b.bucket,
        value: b.total ? (100 * b.byStatus.CANCELLED) / b.total : 0,
      })),
      newVsReturning: {
        new: patients.newPatients,
        returning: patients.returningPatients,
      },
      followUpCompletion: {
        completed: followups.byStatus.COMPLETED,
        pending: Math.max(
          0,
          (followups.byStatus.SCHEDULED || followups.byStatus.PENDING || 0) -
            followups.overdueCount,
        ),
        overdue: followups.overdueCount,
      },
      doctorPerformance: doctors.doctors.map((d) => ({
        doctorId: d.doctorId,
        doctorName: d.doctorName,
        appointments: d.total,
        completionRate: d.total ? (100 * d.byStatus.COMPLETED) / d.total : 0,
      })),
      servicePerformance: services,
    },
  };
}
