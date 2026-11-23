import { hasPermission } from "@/lib/workspace";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, Badge, Avatar, EmptyState } from "@/components/ui";
import { NoAccess } from "@/components/reach/no-access";
import { AppointmentRow } from "@/components/reach/appointments/appointment-row";
import { getPatientById } from "@/lib/api/patients";
import { getDoctors } from "@/lib/api/staff";
import { getAppointments } from "@/lib/api/appointments";
import { getRawClinic } from "@/lib/api/clinic";
import { dayLabel, formatDate, pluralize, todayInZone } from "@/lib/utils";
import type { Appointment } from "@/lib/types";

const genderLabel = { male: "Male", female: "Female", other: "Other", unknown: null } as const;

export default async function PatientProfilePage({ params }: PageProps<"/reach/patients/[patientId]">) {
  if (!(await hasPermission("patients:read"))) return <NoAccess area="patient records" />;
  const canReadAppointments = await hasPermission("appointments:read");
  const { patientId } = await params;

  const [{ data: patient }, { data: doctors }, { data: appointments }, clinic] = await Promise.all([
    getPatientById(patientId),
    getDoctors(),
    canReadAppointments ? getAppointments() : Promise.resolve({ data: [] as Appointment[] }),
    getRawClinic(),
  ]);
  if (!patient) notFound();

  const today = todayInZone(clinic.timezone);
  const primaryDoctor = doctors.find((d) => d.id === patient.primaryDoctorId);
  const mine = appointments.filter((a) => a.patientId === patientId);
  const upcoming = mine
    .filter((a) => a.date >= today && (a.status === "confirmed" || a.status === "pending"))
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  const past = mine
    .filter((a) => !upcoming.includes(a))
    .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime));
  const details = [Number.isFinite(patient.age) ? `${patient.age} years` : null, genderLabel[patient.gender]].filter(Boolean).join(", ");

  const history = (items: Appointment[], empty: string) =>
    items.length === 0 ? (
      <p className="px-5 pb-5 text-[13px] text-text-tertiary">{empty}</p>
    ) : (
      <ol className="px-2 pb-2 sm:px-3">
        {items.map((a) => (
          <li key={a.id}>
            <AppointmentRow
              appointment={a}
              dayLabel={dayLabel(a.date, today)}
              href={`/reach/appointments?date=${a.date}&appointment=${a.id}`}
            />
          </li>
        ))}
      </ol>
    );

  return (
    <div>
      <Link
        prefetch={false}
        href="/reach/patients"
        className="focus-ring mb-3 inline-flex items-center gap-1.5 rounded-xs text-[13px] font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Patients
      </Link>

      <div className="mb-5 flex flex-wrap items-center gap-4">
        <Avatar name={patient.name} size="lg" />
        <div className="min-w-0">
          <h1 className="text-[1.375rem] leading-tight font-semibold text-text-primary">{patient.name}</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            {details || "Details not recorded"}
            {patient.type === "new" && (
              <Badge tone="brand" className="ml-2 align-middle">
                First visit
              </Badge>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Contact and care</CardTitle>
          </CardHeader>
          <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2.5 px-5 pb-5 text-sm">
            <dt className="text-text-tertiary">Phone</dt>
            <dd className="break-words text-text-primary tabular-nums">{patient.phone || "Not recorded"}</dd>
            <dt className="text-text-tertiary">Email</dt>
            <dd className="break-words text-text-primary">{patient.email || "Not recorded"}</dd>
            <dt className="text-text-tertiary">Usual doctor</dt>
            <dd className="text-text-primary">{primaryDoctor?.name ?? "Not assigned"}</dd>
            <dt className="text-text-tertiary">Last visit</dt>
            <dd className="text-text-primary">{patient.lastVisit ? formatDate(patient.lastVisit) : "No visits yet"}</dd>
            <dt className="text-text-tertiary">Visits</dt>
            <dd className="text-text-primary tabular-nums">{patient.totalVisits}</dd>
          </dl>
          {patient.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 border-t border-border px-5 py-4">
              {patient.tags.map((tag) => (
                <li key={tag}>
                  <Badge>{tag}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-5 lg:col-span-2">
          {!canReadAppointments ? (
            <Card>
              <EmptyState icon={Calendar} title="Appointment history hidden" description="Your role doesn't include appointments." />
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming</CardTitle>
                  <span className="text-[13px] text-text-tertiary">{pluralize(upcoming.length, "appointment")}</span>
                </CardHeader>
                {history(upcoming, "No upcoming appointments.")}
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>History</CardTitle>
                  <span className="text-[13px] text-text-tertiary">{pluralize(past.length, "appointment")}</span>
                </CardHeader>
                {history(past, "No past appointments.")}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
