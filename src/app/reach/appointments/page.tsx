import { Suspense } from "react";
import { BookingForm } from "@/components/reach/booking-form";
import { getPatients } from "@/lib/api/patients";
import { getRawClinic } from "@/lib/api/clinic";
import { apiFetch } from "@/lib/api/client";
import { hasPermission } from "@/lib/workspace";
import { PageHeader } from "@/components/reach/page-header";
import { NoAccess } from "@/components/reach/no-access";
import { AppointmentsView } from "@/components/reach/appointments/appointments-view";
import { getAppointments } from "@/lib/api/appointments";
import { getDoctors } from "@/lib/api/staff";

export default async function AppointmentsPage() {
  if (!(await hasPermission("appointments:read"))) return <NoAccess area="appointments" />;
  const booking = (await hasPermission("appointments:write")) && (await hasPermission("patients:read"));
  const patients = booking ? (await getPatients()).data : [];
  const services = booking ? await apiFetch<{ id: string; name: string }[]>("/services") : [];
  const clinic = await getRawClinic();
  const [{ data: appointments }, { data: doctors }] = await Promise.all([getAppointments(), getDoctors()]);

  return (
    <div>
      <PageHeader
        title="Appointments"
        description="Every appointment at this clinic, by day."
        actions={
          booking ? (
            <BookingForm patients={patients} doctors={doctors} services={services} timezone={clinic.timezone} />
          ) : undefined
        }
      />
      <Suspense>
        <AppointmentsView appointments={appointments} doctors={doctors} />
      </Suspense>
    </div>
  );
}
