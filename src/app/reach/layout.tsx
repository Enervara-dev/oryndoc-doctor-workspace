import type { Metadata } from "next";
import { AppShell } from "@/components/reach/shell/app-shell";
import { getWorkspace } from "@/lib/workspace";
import { getClinic } from "@/lib/api/clinic";
export const metadata: Metadata = { title: "Reach" };
export default async function ReachLayout({ children }: LayoutProps<"/reach">) {
  const [workspace, { data: clinic }] = await Promise.all([
    getWorkspace(),
    getClinic(),
  ]);
  return (
    <AppShell
      key={clinic.id}
      workspace={{
        clinic,
        email: workspace.identity.email,
        userId: workspace.identity.sub,
        roles: workspace.membership.roles,
        permissions: workspace.permissions,
      }}
    >
      {children}
    </AppShell>
  );
}
