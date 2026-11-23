import { ChevronRight } from "lucide-react";
import { getIdentity } from "@/lib/workspace";
import { reachUrl } from "@/lib/auth-cookies";
import { selectClinic } from "@/lib/session-actions";
import { AuthShell } from "@/components/brand/auth-shell";
import { rolesLabel } from "@/lib/labels";

export default async function ChooseClinic() {
  const identity = await getIdentity();
  const response = await fetch(`${reachUrl()}/clinics`, {
    headers: { Authorization: `Bearer ${identity.accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Clinic access could not be loaded");
  const clinics: { id: string; name: string; city?: string | null }[] = await response.json();
  const allowed = clinics
    .map((clinic) => ({ clinic, membership: identity.memberships.find((m) => m.externalTenantId === clinic.id) }))
    .filter((x) => x.membership)
    .sort((a, b) => a.clinic.name.localeCompare(b.clinic.name));

  return (
    <AuthShell title="Choose a clinic" description={`Signed in as ${identity.email}`}>
      {allowed.length ? (
        <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-surface">
          {allowed.map(({ clinic, membership }) => (
            <li key={clinic.id}>
              <form action={selectClinic}>
                <input type="hidden" name="clinicId" value={clinic.id} />
                <button className="focus-ring flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-sunken">
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-brand-subtle text-sm font-bold text-brand-text"
                  >
                    {clinic.name[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-text-primary">{clinic.name}</span>
                    <span className="block truncate text-[13px] text-text-tertiary">
                      {[clinic.city, rolesLabel(membership!.roles)].filter(Boolean).join(", ")}
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-text-tertiary" aria-hidden="true" />
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-md border border-border bg-surface p-5 text-sm text-text-secondary">
          <p className="font-semibold text-text-primary">No clinic access yet</p>
          <p className="mt-1">
            Your account isn&apos;t assigned to a clinic with Reach enabled. Ask your clinic or platform administrator to add you in Oryndoc Central.
          </p>
        </div>
      )}
      <p className="mt-4 text-center">
        <a href="/login" className="focus-ring rounded-xs text-[13px] font-medium text-brand-text hover:underline">
          Sign in with a different account
        </a>
      </p>
    </AuthShell>
  );
}
