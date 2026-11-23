import { cache } from "react";
import type { ApiResult, Patient, PatientVisit } from "../types";
import { apiFetch } from "./client";
import { initials, type RawPatient } from "./models";
import { getRawClinic } from "./clinic";
import { localParts } from "./models";
import { getAppointments } from "./appointments";
export const getPatients = cache(async (): Promise<ApiResult<Patient[]>> => {
  const rows: RawPatient[] = [];
  for (let page = 1; ; page++) {
    const result = await apiFetch<{ total: number; data: RawPatient[] }>(
      `/patient-directory?page=${page}`,
    );
    rows.push(...result.data);
    if (rows.length >= result.total || !result.data.length) break;
  }
  const clinic = await getRawClinic();
  const now = new Date();
  return {
    source: "api",
    data: rows.map((p) => {
      const dob = new Date(p.dateOfBirth);
      const past = p.visits.filter((v) => v.status === "COMPLETED");
      const age =
        now.getFullYear() -
        dob.getUTCFullYear() -
        (now.toISOString().slice(5, 10) < p.dateOfBirth.slice(5, 10) ? 1 : 0);
      return {
        id: p.id,
        name: p.fullName,
        avatarInitials: initials(p.fullName),
        age,
        gender:
          p.sex === "MALE"
            ? "male"
            : p.sex === "FEMALE"
              ? "female"
              : p.sex === "OTHER"
                ? "other"
                : "unknown",
        phone: p.phone || "",
        email: p.email || "",
        type: past.length ? "returning" : "new",
        lastVisit: past.length
          ? localParts(past.at(-1)!.startUtc, clinic.timezone).date
          : null,
        totalVisits: past.length,
        primaryDoctorId: p.visits.at(-1)?.doctorId || "",
        tags: [],
      };
    }),
  };
});
export async function getPatientById(id: string) {
  const result = await getPatients();
  return { ...result, data: result.data.find((p) => p.id === id) };
}
export async function getPatientVisits(
  patientId: string,
): Promise<ApiResult<PatientVisit[]>> {
  const { data } = await getAppointments();
  return {
    source: "api",
    data: data
      .filter(
        (a) =>
          a.patientId === patientId &&
          ["completed", "cancelled", "no-show"].includes(a.status),
      )
      .map((a) => ({
        id: a.id,
        patientId,
        date: a.date,
        doctorId: a.doctorId,
        reason: a.service,
        status: a.status as PatientVisit["status"],
        notes: a.notes,
      })),
  };
}
