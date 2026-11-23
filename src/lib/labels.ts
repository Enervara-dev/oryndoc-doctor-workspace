/** Human labels for Central role codes. Raw codes never reach the screen. */
const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super admin",
  PLATFORM_SUPPORT_ADMIN: "Support admin",
  CLINIC_ADMIN: "Clinic admin",
  DOCTOR: "Doctor",
  RECEPTIONIST: "Receptionist",
  STAFF: "Staff",
};

export function roleLabel(code: string): string {
  return (
    ROLE_LABELS[code] ??
    code
      .toLowerCase()
      .split("_")
      .filter(Boolean)
      .join(" ")
      .replace(/^./, (c) => c.toUpperCase())
  );
}

export function rolesLabel(codes: string[]): string {
  if (codes.length === 0) return "No role assigned";
  return codes.map(roleLabel).join(", ");
}

/** "local.admin@oryndoc.test" → "Local Admin" when no display name is available. */
export function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
