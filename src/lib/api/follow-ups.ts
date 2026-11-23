import { cache } from "react";
import type {
  ApiResult,
  FollowUp,
  FollowUpMessage,
  FollowUpReason,
} from "../types";
import { apiFetch } from "./client";
import { localParts, type RawFollowUp } from "./models";
import { getRawClinic } from "./clinic";
export const getRawFollowUps = cache(() =>
  apiFetch<RawFollowUp[]>("/follow-ups"),
);
export async function getFollowUpReasons(): Promise<
  ApiResult<FollowUpReason[]>
> {
  return {
    source: "api",
    data: (
      await apiFetch<{ id: string; label: string; isActive: boolean }[]>(
        "/follow-up-reasons",
      )
    )
      .filter((r) => r.isActive)
      .map((r) => ({ ...r, category: "Follow-up" })),
  };
}
export const getFollowUps = cache(async (): Promise<ApiResult<FollowUp[]>> => {
  const [rows, clinic] = await Promise.all([getRawFollowUps(), getRawClinic()]);
  const today = localParts(new Date().toISOString(), clinic.timezone).date;
  return {
    source: "api",
    data: rows.map((f) => ({
      id: f.id,
      patientId: f.clinicPatient.patient.id,
      patientName: f.clinicPatient.patient.fullName,
      doctorId: f.doctor.id,
      doctorName: f.doctor.name,
      followUpDate: f.followUpDate.slice(0, 10),
      reasonId: f.reason.id,
      reasonLabel: f.reason.label,
      status:
        f.status === "COMPLETED"
          ? "completed"
          : f.status === "CANCELLED"
            ? "cancelled"
            : f.followUpDate.slice(0, 10) < today
              ? "overdue"
              : "scheduled",
      createdOn: f.createdAt,
      lastMessageSentOn: f.notification?.sentAt,
      messageStatus: f.notification?.status,
      messageError: f.notification?.lastError,
      messagePreview: f.notification?.renderedMessage,
    })),
  };
});
export async function getAllFollowUpMessages(): Promise<
  ApiResult<FollowUpMessage[]>
> {
  return {
    source: "api",
    data: (await getRawFollowUps()).flatMap((f) =>
      f.notification?.status === "SENT" && f.notification.sentAt
        ? [
            {
              id: f.notification.id,
              followUpId: f.id,
              sentOn: f.notification.sentAt,
              channel: "sms" as const,
              preview: f.notification.renderedMessage || "",
            },
          ]
        : [],
    ),
  };
}
export async function getFollowUpMessages(id: string) {
  const result = await getAllFollowUpMessages();
  return { ...result, data: result.data.filter((m) => m.followUpId === id) };
}
