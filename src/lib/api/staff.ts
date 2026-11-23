import { cache } from "react";
import type { ApiResult, Doctor, StaffMember } from "../types";
import { apiFetch } from "./client";
import { initials, type RawDoctor } from "./models";
import { hasPermission } from "../workspace";
import { getRawClinic } from "./clinic";
import { reachUrl } from "../auth-cookies";
export const getDoctors = cache(async (): Promise<ApiResult<Doctor[]>> => {
  let rows: RawDoctor[];
  if (await hasPermission("doctors_staff:read"))
    rows = await apiFetch<RawDoctor[]>("/doctors");
  else {
    const c = await getRawClinic();
    const r = await fetch(
      `${reachUrl()}/public/v1/clinics/${encodeURIComponent(c.bookingSlug)}/doctors`,
      { cache: "no-store", signal: AbortSignal.timeout(10000) },
    );
    if (!r.ok) throw new Error("Unable to load doctors");
    rows = (
      (await r.json()) as { id: string; name: string; specialty?: string }[]
    ).map((d) => ({ ...d, isActive: true, createdAt: "" }));
  }
  return {
    source: "api",
    data: rows.map((d) => ({
      id: d.id,
      name: d.name,
      role: "doctor",
      specialty: d.specialty || "",
      email: d.email || "",
      phone: d.phone || "",
      avatarInitials: initials(d.name),
      status: d.isActive ? "active" : "inactive",
      joinedOn: d.createdAt.slice(0, 10),
    })),
  };
});
export async function getStaff(): Promise<ApiResult<StaffMember[]>> {
  return getDoctors();
}
