import { hasPermission } from "@/lib/workspace";
import { PageHeader } from "@/components/reach/page-header";
import { NoAccess } from "@/components/reach/no-access";
import { ScheduleView } from "@/components/reach/schedule/schedule-view";
import { getDoctors } from "@/lib/api/staff";
import { getDoctorSchedules, getBlockedSlots, getHolidays } from "@/lib/api/schedule";
import type { BlockedSlot } from "@/lib/types";

export default async function SchedulePage() {
  if (!(await hasPermission("scheduling:read"))) return <NoAccess area="schedules" />;
  const [{ data: doctors }, { data: schedules }, { data: blockedSlots }, { data: holidays }] = await Promise.all([
    getDoctors(),
    getDoctorSchedules(),
    (await hasPermission("appointments:read")) ? getBlockedSlots() : Promise.resolve({ data: [] as BlockedSlot[] }),
    getHolidays(),
  ]);

  return (
    <div>
      <PageHeader title="Schedule" description="Working hours, breaks, blocked time and clinic holidays." />
      <ScheduleView doctors={doctors} schedules={schedules} blockedSlots={blockedSlots} holidays={holidays} />
    </div>
  );
}
