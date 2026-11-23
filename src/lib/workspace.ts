import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS, CLINIC, centralUrl } from "./auth-cookies";

export interface Membership {
  membershipId: string;
  clinicId: string;
  externalTenantId: string | null;
  version: number;
  roles: string[];
  permissions: string[];
}
export interface Identity {
  sub: string;
  email: string;
  memberships: Membership[];
  platformPermissions: string[];
}
export const getIdentity = cache(
  async (): Promise<Identity & { accessToken: string }> => {
    const accessToken = (await cookies()).get(ACCESS)?.value;
    if (!accessToken) redirect("/login");
    const response = await fetch(`${centralUrl()}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 401) redirect("/login");
    if (!response.ok) throw new Error("Central is unavailable. Please retry.");
    return { ...(await response.json()), accessToken };
  },
);
export const getWorkspace = cache(async () => {
  const identity = await getIdentity();
  const clinicId = (await cookies()).get(CLINIC)?.value;
  const membership = identity.memberships.find(
    (m) => m.externalTenantId === clinicId,
  );
  if (!membership || !clinicId) redirect("/choose-clinic");
  return {
    identity,
    membership,
    clinicId,
    permissions: membership.permissions,
  };
});
export const hasPermission = async (permission: string) =>
  (await getWorkspace()).permissions.includes(permission);
