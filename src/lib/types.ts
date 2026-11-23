/**
 * Domain types shared across the Doctor Platform.
 *
 * View models mapped from authenticated Reach responses by lib/api.
 * Demo fixtures remain available for design work; live routes use APIs.
 */

export type ProductId = "reach" | "voice" | "assist" | "azure";

export type ProductStatus = "available" | "coming-soon";

export interface Product {
  id: ProductId;
  name: string;
  tagline: string;
  description: string;
  status: ProductStatus;
  href: string;
}

/* ------------------------------- Clinic -------------------------------- */

export interface Clinic {
  id: string;
  name: string;
  logoInitial: string;
  address: string;
  phone: string;
  email: string;
  bookingUrl: string;
  timezone: string;
  specialties: string[];
}

/* ------------------------------ Doctors --------------------------------- */

export type StaffRole = "doctor" | "nurse" | "receptionist" | "admin";

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  specialty?: string;
  email: string;
  phone: string;
  avatarInitials: string;
  status: "active" | "on-leave" | "inactive";
  joinedOn: string;
}

export type Doctor = StaffMember & { role: "doctor"; specialty: string };

/* ------------------------------ Patients -------------------------------- */

export type PatientType = "new" | "returning";

export interface Patient {
  id: string;
  name: string;
  avatarInitials: string;
  age: number;
  gender: "male" | "female" | "other" | "unknown";
  phone: string;
  email: string;
  type: PatientType;
  lastVisit: string | null;
  totalVisits: number;
  primaryDoctorId: string;
  tags: string[];
}

export interface PatientVisit {
  id: string;
  patientId: string;
  date: string;
  doctorId: string;
  reason: string;
  status: "completed" | "cancelled" | "no-show";
  notes?: string;
}

/* ---------------------------- Appointments ------------------------------ */

export type AppointmentStatus =
  "confirmed" | "pending" | "completed" | "cancelled" | "no-show";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientType: PatientType;
  doctorId: string;
  doctorName: string;
  service: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  channel: "in-clinic" | "video" | "phone";
  notes?: string;
}

/* ----------------------------- Follow-ups -------------------------------- */

export interface FollowUpReason {
  id: string;
  label: string;
  category: string;
}

export type FollowUpStatus =
  "scheduled" | "sent" | "confirmed" | "overdue" | "completed" | "cancelled";

export interface FollowUp {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  followUpDate: string;
  reasonId: string;
  reasonLabel: string;
  status: FollowUpStatus;
  createdOn: string;
  lastMessageSentOn?: string;
  messageStatus?: string;
  messageError?: string;
  messagePreview?: string;
}

export interface FollowUpMessage {
  id: string;
  followUpId: string;
  sentOn: string;
  channel: "sms" | "whatsapp" | "email";
  preview: string;
}

/* ------------------------------- Schedule -------------------------------- */

export interface WorkingHours {
  id?: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  isWorking: boolean;
  start?: string;
  end?: string;
}

export interface ScheduleBreak {
  id: string;
  label: string;
  start: string;
  end: string;
}

export interface BlockedSlot {
  id: string;
  doctorId: string;
  date: string;
  start: string;
  end: string;
  reason: string;
}

export interface Holiday {
  id: string;
  label: string;
  date: string;
}

export interface DoctorSchedule {
  doctorId: string;
  workingHours: WorkingHours[];
  breaks: ScheduleBreak[];
}

/* ------------------------------ Analytics -------------------------------- */

export interface TrendPoint {
  label: string;
  value: number;
}

export interface AnalyticsSummary {
  totalAppointments: TrendPoint[];
  noShowRate: TrendPoint[];
  cancellationRate: TrendPoint[];
  newVsReturning: { new: number; returning: number };
  followUpCompletion: { completed: number; pending: number; overdue: number };
  doctorPerformance: {
    doctorId: string;
    doctorName: string;
    appointments: number;
    completionRate: number;
  }[];
  servicePerformance: { service: string; appointments: number }[];
}

/* -------------------------------- Shared --------------------------------- */

export interface ApiResult<T> {
  data: T;
  source: "demo" | "api";
}
