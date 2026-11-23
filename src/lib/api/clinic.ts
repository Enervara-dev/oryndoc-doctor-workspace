import { cache } from "react";
import type { ApiResult, Clinic } from "../types";
import { apiFetch } from "./client";
import type { RawClinic } from "./models";
export const getRawClinic = cache(() => apiFetch<RawClinic>("/"));
export const getClinic = cache(async (): Promise<ApiResult<Clinic>> => {
  const c = await getRawClinic();
  return {
    source: "api",
    data: {
      id: c.id,
      name: c.name,
      logoInitial: c.name[0] || "",
      address: [
        c.addressLine1,
        c.addressLine2,
        c.city,
        c.state,
        c.postalCode,
        c.country,
      ]
        .filter(Boolean)
        .join(", "),
      phone: c.contactPhone || "",
      email: c.contactEmail || "",
      timezone: c.timezone,
      specialties: [],
      bookingUrl: `${(process.env.PATIENT_APP_URL || "http://localhost:3003").replace(/\/$/, "")}/book/${encodeURIComponent(c.bookingSlug)}`,
    },
  };
});
