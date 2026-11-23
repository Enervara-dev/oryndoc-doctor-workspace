import { PageHeader } from "@/components/reach/page-header";
import { LiveFollowUps } from "@/components/reach/live-follow-ups";
import {
  getFollowUps,
  getAllFollowUpMessages,
  getFollowUpReasons,
} from "@/lib/api/follow-ups";
import { getAppointments } from "@/lib/api/appointments";
import { getClinic } from "@/lib/api/clinic";
import { hasPermission } from "@/lib/workspace";
import { NoAccess } from "@/components/reach/no-access";
export default async function FollowUpsPage() {
  if (!(await hasPermission("followups:read")))
    return <NoAccess area="follow-ups" />;
  const [
    { data: followUps },
    { data: reasons },
    { data: appointments },
    { data: clinic },
    { data: messages },
  ] = await Promise.all([
    getFollowUps(),
    getFollowUpReasons(),
    (await hasPermission("appointments:read"))
      ? getAppointments()
      : { data: [] },
    getClinic(),
    getAllFollowUpMessages(),
  ]);
  return (
    <div>
      <PageHeader
        title="Follow-ups"
        description="Return visits and the reminders sent for them."
      />
      <LiveFollowUps
        followUps={followUps}
        reasons={reasons}
        appointments={appointments}
        messages={messages}
        clinic={clinic}
      />
    </div>
  );
}
