import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/reach/page-header";
import { NoAccess } from "@/components/reach/no-access";
import { LiveForm, Field } from "@/components/reach/live-form";
import { Badge, Card } from "@/components/ui";
import { getClinic, getRawClinic } from "@/lib/api/clinic";
import { apiFetch } from "@/lib/api/client";
import { hasPermission } from "@/lib/workspace";

type Service = { id: string; name: string; durationMinutes: number; isActive: boolean };
type Reason = { id: string; code: string; label: string; isActive?: boolean };

const PROFILE_FIELDS = [
  { key: "name", label: "Clinic name", autoComplete: "organization", span: 2 },
  { key: "contactPhone", label: "Phone", autoComplete: "tel", type: "tel" },
  { key: "contactEmail", label: "Email", autoComplete: "email", type: "email" },
  { key: "addressLine1", label: "Address line 1", autoComplete: "address-line1", span: 2 },
  { key: "addressLine2", label: "Address line 2", autoComplete: "address-line2", span: 2 },
  { key: "city", label: "City", autoComplete: "address-level2" },
  { key: "state", label: "State", autoComplete: "address-level1" },
  { key: "postalCode", label: "PIN / postal code", autoComplete: "postal-code" },
  { key: "country", label: "Country", autoComplete: "country", hint: "Two-letter code, for example IN" },
  { key: "timezone", label: "Timezone", hint: "IANA name, for example Asia/Kolkata. All schedules use this.", span: 2 },
] as const;

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-4 border-t border-border py-6 first:border-t-0 first:pt-0 lg:grid-cols-[16rem_1fr] lg:gap-8">
      <div>
        <h2 id={id} className="text-base font-semibold text-text-primary">
          {title}
        </h2>
        <p className="mt-1 text-[13px] text-text-secondary">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default async function SettingsPage() {
  if (!(await hasPermission("clinic_settings:read"))) return <NoAccess area="clinic settings" />;
  const [c, manage, { data: clinic }, services, reasons] = await Promise.all([
    getRawClinic(),
    hasPermission("clinic_settings:manage"),
    getClinic(),
    apiFetch<Service[]>("/services"),
    apiFetch<Reason[]>("/follow-up-reasons").catch(() => [] as Reason[]),
  ]);
  const record = c as unknown as Record<string, string | number | undefined>;

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Settings"
        description="Clinic profile, booking rules and the services patients can book."
        actions={
          <a
            href={clinic.bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="focus-ring inline-flex h-9 items-center gap-2 rounded-sm border border-border-input bg-surface px-3.5 text-sm font-medium text-text-primary hover:bg-surface-sunken"
          >
            Open patient booking page
            <ExternalLink className="size-4 text-text-tertiary" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        }
      />

      <Card className="px-4 py-6 sm:px-6">
        <Section id="profile" title="Clinic profile" description="Shown to patients on the booking page and in messages.">
          {manage ? (
            <LiveForm bare operation="clinic" label="Save profile and policies">
              <div className="grid gap-4 sm:grid-cols-2">
                {PROFILE_FIELDS.map((f) => (
                  <div key={f.key} className={"span" in f && f.span === 2 ? "sm:col-span-2" : undefined}>
                    <Field
                      name={f.key}
                      label={f.label}
                      type={"type" in f ? f.type : "text"}
                      autoComplete={"autoComplete" in f ? f.autoComplete : undefined}
                      hint={"hint" in f ? f.hint : undefined}
                      value={(record[f.key] as string) || ""}
                      required={f.key === "name" || f.key === "timezone"}
                    />
                  </div>
                ))}
              </div>
              <h3 className="pt-2 text-sm font-semibold text-text-primary">Booking policies</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  name="minBookingNoticeMinutes"
                  label="Minimum notice"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={c.minBookingNoticeMinutes}
                  hint="Minutes before a slot that patients can still book it."
                />
                <Field
                  name="maxBookingHorizonDays"
                  label="Booking window"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={c.maxBookingHorizonDays}
                  hint="How many days ahead patients can book."
                />
                <Field
                  name="cancellationNoticeMinutes"
                  label="Cancellation notice"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={c.cancellationNoticeMinutes}
                  hint="Minutes before a slot that patients can still cancel."
                />
              </div>
            </LiveForm>
          ) : (
            <dl className="grid grid-cols-[10rem_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-text-tertiary">Name</dt>
              <dd>{c.name}</dd>
              <dt className="text-text-tertiary">Address</dt>
              <dd>{clinic.address || "Not set"}</dd>
              <dt className="text-text-tertiary">Phone</dt>
              <dd>{clinic.phone || "Not set"}</dd>
              <dt className="text-text-tertiary">Timezone</dt>
              <dd>{c.timezone}</dd>
              <dt className="text-text-tertiary">Minimum notice</dt>
              <dd className="tabular-nums">{c.minBookingNoticeMinutes} minutes</dd>
              <dt className="text-text-tertiary">Booking window</dt>
              <dd className="tabular-nums">{c.maxBookingHorizonDays} days</dd>
              <dt className="text-text-tertiary">Cancellation notice</dt>
              <dd className="tabular-nums">{c.cancellationNoticeMinutes} minutes</dd>
            </dl>
          )}
        </Section>

        <Section id="services" title="Services" description="What patients can book. Inactive services are hidden from booking.">
          {services.length === 0 ? (
            <p className="text-sm text-text-tertiary">No services yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-sunken text-[13px] text-text-secondary">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-medium">Service</th>
                    <th scope="col" className="px-4 py-2 text-right font-medium">Duration</th>
                    <th scope="col" className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {services.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-2.5 font-medium text-text-primary">{s.name}</td>
                      <td className="px-4 py-2.5 text-right text-text-secondary tabular-nums">{s.durationMinutes} min</td>
                      <td className="px-4 py-2.5">
                        <Badge dot tone={s.isActive ? "success" : "neutral"}>
                          {s.isActive ? "Bookable" : "Hidden"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {manage && (
            <LiveForm operation="service" label="Add service" tone="secondary" className="mt-4" title="Add a service">
              <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
                <Field name="name" label="Service name" placeholder="e.g. Check-up and cleaning" />
                <Field name="durationMinutes" label="Duration (minutes)" type="number" min={5} inputMode="numeric" />
              </div>
              <input name="schedulingType" type="hidden" value="DURATION_BASED" />
            </LiveForm>
          )}
        </Section>

        <Section
          id="reasons"
          title="Follow-up reasons"
          description="The catalogue staff choose from when scheduling a follow-up."
        >
          {reasons.length > 0 && (
            <ul className="mb-4 flex flex-wrap gap-1.5">
              {reasons.map((r) => (
                <li key={r.id}>
                  <Badge tone="neutral">{r.label}</Badge>
                </li>
              ))}
            </ul>
          )}
          {manage ? (
            <LiveForm operation="reason" label="Add reason" tone="secondary" title="Add a follow-up reason">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field name="label" label="Reason name" placeholder="e.g. Post-extraction review" />
                <Field name="code" label="Short code" hint="Lowercase letters and hyphens, e.g. post-extraction." />
              </div>
            </LiveForm>
          ) : (
            reasons.length === 0 && <p className="text-sm text-text-tertiary">No reasons yet.</p>
          )}
        </Section>
      </Card>
    </div>
  );
}
