import { hasPermission } from "@/lib/workspace";
import { PageHeader } from "@/components/reach/page-header";
import { NoAccess } from "@/components/reach/no-access";
import { PatientDirectory } from "@/components/reach/patients/patient-directory";
import { getPatients } from "@/lib/api/patients";
import { getDoctors } from "@/lib/api/staff";

export default async function PatientsPage() {
  if (!(await hasPermission("patients:read"))) return <NoAccess area="patient records" />;
  const [{ data: patients }, { data: doctors }] = await Promise.all([getPatients(), getDoctors()]);

  return (
    <div>
      <PageHeader title="Patients" description="Everyone who has booked or visited this clinic." />
      <PatientDirectory patients={patients} doctors={doctors} />
    </div>
  );
}
