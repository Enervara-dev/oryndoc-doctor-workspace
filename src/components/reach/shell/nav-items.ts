"use client";
import { useWorkspace } from "./workspace-context";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CalendarClock,
  UserCog,
  Clock,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
}

export const navItems: NavItem[] = [
  { href: "/reach/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/reach/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/reach/patients", label: "Patients", icon: Users },
  { href: "/reach/follow-ups", label: "Follow-ups", icon: CalendarClock },
  { href: "/reach/doctors-staff", label: "Doctors", icon: UserCog },
  { href: "/reach/schedule", label: "Schedule", icon: Clock },
  { href: "/reach/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reach/settings", label: "Settings", icon: Settings },
];

const permissions: Record<string, string> = {
  overview: "appointments:read",
  appointments: "appointments:read",
  patients: "patients:read",
  "follow-ups": "followups:read",
  "doctors-staff": "doctors_staff:read",
  schedule: "scheduling:read",
  analytics: "analytics:read",
  settings: "clinic_settings:read",
};
export function useWorkspaceNav() {
  const workspace = useWorkspace();
  return navItems.filter((item) =>
    workspace.permissions.includes(permissions[item.href.split("/").at(-1)!]),
  );
}
