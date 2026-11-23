import { PageHeader } from "@/components/reach/page-header";
import { NoAccess } from "@/components/reach/no-access";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { TrendChart } from "@/components/charts/trend-chart";
import { BarList } from "@/components/charts/bar-list";
import { hasPermission } from "@/lib/workspace";
import { getAnalyticsSummary } from "@/lib/api/analytics";

function Panel({ title, note, className, children }: { title: string; note?: string; className?: string; children: React.ReactNode }) {
  return (
    <Card className={className}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {note && <p className="text-[13px] text-text-tertiary">{note}</p>}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default async function AnalyticsPage() {
  if (!(await hasPermission("analytics:read"))) return <NoAccess area="analytics" />;
  const { data: a } = await getAnalyticsSummary();

  const total = a.totalAppointments.reduce((s, p) => s + p.value, 0);
  const fu = a.followUpCompletion;
  const fuTotal = fu.completed + fu.pending + fu.overdue;

  return (
    <div>
      <PageHeader title="Analytics" description="All figures cover the last 8 weeks, grouped by week, in the clinic's timezone." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel title="Appointments per week" note={`${total} in total`} className="lg:col-span-2">
          <TrendChart title="Appointments per week, last 8 weeks" data={a.totalAppointments} />
        </Panel>

        <Panel title="Patients" note="First visit compared with returning">
          <BarList
            showShare
            items={[
              { label: "First visit", value: a.newVsReturning.new, colorVar: "var(--color-chart-1)" },
              { label: "Returning", value: a.newVsReturning.returning, colorVar: "var(--color-chart-3)" },
            ]}
          />
        </Panel>

        <Panel title="No-show rate" note="Share of appointments the patient missed">
          <TrendChart title="No-show rate per week" data={a.noShowRate} colorVar="var(--color-chart-2)" suffix="%" />
        </Panel>

        <Panel title="Cancellation rate" note="Share of appointments cancelled">
          <TrendChart title="Cancellation rate per week" data={a.cancellationRate} colorVar="var(--color-chart-4)" suffix="%" />
        </Panel>

        <Panel title="Follow-ups" note={fuTotal ? `${Math.round((fu.completed / fuTotal) * 100)}% completed` : undefined}>
          <BarList
            showShare
            emptyText="No follow-ups in this period."
            items={[
              { label: "Completed", value: fu.completed, colorVar: "var(--color-chart-1)" },
              { label: "Pending", value: fu.pending, colorVar: "var(--color-chart-5)" },
              { label: "Overdue", value: fu.overdue, colorVar: "var(--color-chart-2)" },
            ]}
          />
        </Panel>

        <Panel title="Appointments by doctor">
          <BarList items={a.doctorPerformance.map((d) => ({ label: d.doctorName, value: d.appointments }))} />
        </Panel>

        <Panel title="Most booked services" note="Top 6" className="lg:col-span-2">
          <BarList
            items={[...a.servicePerformance]
              .sort((x, y) => y.appointments - x.appointments)
              .slice(0, 6)
              .map((s) => ({ label: s.service, value: s.appointments, colorVar: "var(--color-chart-3)" }))}
          />
        </Panel>
      </div>
    </div>
  );
}
