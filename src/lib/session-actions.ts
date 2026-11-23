"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getIdentity } from "./workspace";
import { CLINIC, cookieOptions } from "./auth-cookies";

export async function selectClinic(form: FormData) {
  const identity = await getIdentity();
  const id = String(form.get("clinicId") ?? "");
  if (!identity.memberships.some((m) => m.externalTenantId === id))
    throw new Error("Clinic access is not assigned");
  (await cookies()).set(CLINIC, id, cookieOptions);
  revalidatePath("/", "layout");
  redirect("/reach/overview");
}
