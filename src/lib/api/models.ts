export interface RawClinic {
  id: string;
  name: string;
  contactPhone?: string;
  contactEmail?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  timezone: string;
  bookingSlug: string;
  minBookingNoticeMinutes: number;
  maxBookingHorizonDays: number;
  cancellationNoticeMinutes: number;
}
export interface RawDoctor {
  id: string;
  name: string;
  specialty?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  centralUserId?: string | null;
}
export interface RawPatient {
  id: string;
  fullName: string;
  sex: string;
  dateOfBirth: string;
  email?: string;
  phone?: string;
  visits: { id: string; startUtc: string; status: string; doctorId: string }[];
}
export interface RawAppointment {
  id: string;
  clinicPatient: { patient: RawPatient };
  doctor: RawDoctor;
  service: { name: string };
  startUtc: string;
  endUtc: string;
  status: string;
  chiefComplaint?: string;
}
export interface RawFollowUp {
  id: string;
  appointmentId: string;
  clinicPatient: { patient: RawPatient };
  doctor: RawDoctor;
  reason: { id: string; label: string; category?: string };
  followUpDate: string;
  status: string;
  createdAt: string;
  notification?: {
    id: string;
    status: string;
    sentAt?: string;
    channel?: string;
    renderedMessage?: string;
    lastError?: string;
  };
}
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
export function localParts(value: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const p = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    time: `${p.hour}:${p.minute}`,
  };
}
export const minuteTime = (n: number) =>
  `${Math.floor(n / 60)
    .toString()
    .padStart(2, "0")}:${(n % 60).toString().padStart(2, "0")}`;
