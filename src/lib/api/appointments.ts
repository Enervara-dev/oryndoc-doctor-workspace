import { cache } from "react";
import type { ApiResult, Appointment, AppointmentStatus } from "../types";
import { apiFetch } from "./client";
import { getRawClinic } from "./clinic";
import { localParts, type RawAppointment } from "./models";
export const getAppointments = cache(
  async (): Promise<ApiResult<Appointment[]>> => {
    const [rows, clinic] = await Promise.all([
      apiFetch<RawAppointment[]>("/appointments"),
      getRawClinic(),
    ]);
    const first = new Map<string, string>();
    for (const a of rows) {
      const id = a.clinicPatient.patient.id;
      if (!first.has(id) || a.startUtc < first.get(id)!)
        first.set(id, a.startUtc);
    }
    return {
      source: "api",
      data: rows.map((a) => ({
        id: a.id,
        patientId: a.clinicPatient.patient.id,
        patientName: a.clinicPatient.patient.fullName,
        patientType:
          first.get(a.clinicPatient.patient.id) === a.startUtc
            ? "new"
            : "returning",
        doctorId: a.doctor.id,
        doctorName: a.doctor.name,
        service: a.service.name,
        date: localParts(a.startUtc, clinic.timezone).date,
        startTime: localParts(a.startUtc, clinic.timezone).time,
        endTime: localParts(a.endUtc, clinic.timezone).time,
        status: a.status.toLowerCase().replace("_", "-") as AppointmentStatus,
        channel: "in-clinic",
        notes: a.chiefComplaint,
      })),
    };
  },
);
