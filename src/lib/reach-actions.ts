"use server";
import { revalidatePath } from "next/cache";
import { apiFetch } from "./api/client";
const uuid = (value: FormDataEntryValue | null) => {
  const s = String(value || "");
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      s,
    )
  )
    throw new Error("Choose a valid record");
  return s;
};
export async function mutateReach(
  form: FormData,
): Promise<{ ok: boolean; message: string }> {
  try {
    const value = (name: string) => String(form.get(name) || "").trim();
    const number = (name: string) => {
      const n = Number(value(name));
      if (!Number.isFinite(n) || !value(name))
        throw new Error("A numeric value is required");
      return n;
    };
    const minute = (name: string) => {
      const [h, m] = value(name).split(":").map(Number);
      if (!Number.isInteger(h) || !Number.isInteger(m))
        throw new Error("Choose a time");
      return h * 60 + m;
    };
    let path = "",
      method = "POST",
      body: Record<string, unknown> = {};
    switch (value("operation")) {
      case "clinic":
        path = "/";
        method = "PATCH";
        for (const key of [
          "name",
          "contactEmail",
          "contactPhone",
          "addressLine1",
          "addressLine2",
          "city",
          "state",
          "postalCode",
          "country",
          "timezone",
        ])
          if (value(key)) body[key] = value(key);
        for (const key of [
          "minBookingNoticeMinutes",
          "maxBookingHorizonDays",
          "cancellationNoticeMinutes",
        ])
          body[key] = number(key);
        break;
      case "followup-create":
        path = "/follow-ups";
        body = {
          appointmentId: uuid(form.get("appointmentId")),
          reasonId: uuid(form.get("reasonId")),
          followUpDate: value("date"),
          idempotencyKey: uuid(form.get("idempotencyKey")),
        };
        break;
      case "followup-complete":
      case "followup-cancel":
        path = `/follow-ups/${uuid(form.get("id"))}/${value("operation") === "followup-complete" ? "complete" : "cancel"}`;
        method = "PATCH";
        break;
      case "reason":
        path = "/follow-up-reasons";
        body = { code: value("code"), label: value("label") };
        break;
      case "identity":
        path = `/doctors/${uuid(form.get("doctorId"))}/identity`;
        method = "PATCH";
        body = {
          centralUserId: value("centralUserId")
            ? uuid(form.get("centralUserId"))
            : null,
        };
        break;
      case "doctor":
        path = "/doctors";
        body = {
          name: value("name"),
          ...(value("specialty") ? { specialty: value("specialty") } : {}),
        };
        break;
      case "hours":
      case "break":
        path = `/doctors/${uuid(form.get("doctorId"))}/${value("operation") === "hours" ? "working-hours" : "breaks"}`;
        body = {
          dayOfWeek: number("dayOfWeek"),
          startMinute: minute("start"),
          endMinute: minute("end"),
        };
        break;
      case "hours-delete":
      case "break-delete":
        path = `/doctors/${uuid(form.get("doctorId"))}/${value("operation") === "hours-delete" ? "working-hours" : "breaks"}/${uuid(form.get("id"))}`;
        method = "DELETE";
        break;
      case "holiday":
        path = "/holidays";
        body = { date: value("date"), name: value("name") };
        break;
      case "holiday-delete":
        path = `/holidays/${uuid(form.get("id"))}`;
        method = "DELETE";
        break;
      case "block":
        path = "/slot-blocks";
        body = {
          doctorId: uuid(form.get("doctorId")),
          date: value("date"),
          startMinute: minute("start"),
          endMinute: minute("end"),
          ...(value("reason") ? { reason: value("reason") } : {}),
        };
        break;
      case "block-delete":
        path = `/slot-blocks/${uuid(form.get("id"))}`;
        method = "DELETE";
        break;
      case "appointment-status":
        path = `/appointments/${uuid(form.get("id"))}/status`;
        method = "PATCH";
        body = { status: value("status") };
        break;
      case "appointment-cancel":
        path = `/appointments/${uuid(form.get("id"))}/cancel`;
        method = "PATCH";
        break;
      case "appointment-reschedule":
        path = `/appointments/${uuid(form.get("id"))}/reschedule`;
        method = "PATCH";
        body = { date: value("date"), startMinute: minute("start") };
        break;
      case "appointment-create":
        path = "/appointments";
        body = {
          patientId: uuid(form.get("patientId")),
          doctorId: uuid(form.get("doctorId")),
          serviceId: uuid(form.get("serviceId")),
          date: value("date"),
          startMinute: minute("start"),
          chiefComplaint: value("chiefComplaint"),
          idempotencyKey: uuid(form.get("idempotencyKey")),
        };
        break;
      case "service":
        path = "/services";
        body = {
          name: value("name"),
          schedulingType: value("schedulingType"),
          durationMinutes: number("durationMinutes"),
        };
        break;
      default:
        throw new Error("Unknown action");
    }
    await apiFetch(path, {
      method,
      ...(method !== "DELETE" ? { body: JSON.stringify(body) } : {}),
    });
    revalidatePath("/reach", "layout");
    return { ok: true, message: "Saved" };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to save. Please retry.",
    };
  }
}
