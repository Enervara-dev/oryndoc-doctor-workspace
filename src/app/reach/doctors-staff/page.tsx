import { DoctorControls } from "@/components/reach/doctor-controls";
import { apiFetch } from "@/lib/api/client";
import type { RawDoctor } from "@/lib/api/models";
import { hasPermission } from "@/lib/workspace";
import { PageHeader } from "@/components/reach/page-header";
import { NoAccess } from "@/components/reach/no-access";
import { StaffDirectory } from "@/components/reach/staff/staff-directory";
import { getStaff } from "@/lib/api/staff";

export default async function DoctorsStaffPage() {
  if (!(await hasPermission("doctors_staff:read"))) return <NoAccess area="doctors and staff" />;
  const [doctors, { data: staff }, canManage] = await Promise.all([
    apiFetch<RawDoctor[]>("/doctors"),
    getStaff(),
    hasPermission("doctors_staff:manage"),
  ]);

  return (
    <div>
      <PageHeader
        title="Doctors"
        description="Doctors patients can book at this clinic. Staff accounts and roles are managed in Oryndoc Central."
        actions={<DoctorControls />}
      />
      <StaffDirectory staff={staff} doctors={doctors} canManage={canManage} />
    </div>
  );
}
