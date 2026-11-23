import { SearchInput, Select } from "@/components/ui";
import type { AppointmentStatus, Doctor } from "@/lib/types";

interface AppointmentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  doctorId: string;
  onDoctorChange: (value: string) => void;
  status: AppointmentStatus | "all";
  onStatusChange: (value: AppointmentStatus | "all") => void;
  doctors: Doctor[];
}

export function AppointmentFilters({
  search,
  onSearchChange,
  doctorId,
  onDoctorChange,
  status,
  onStatusChange,
  doctors,
}: AppointmentFiltersProps) {
  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
      <div className="w-full sm:w-56">
        <SearchInput
          placeholder="Search patients…"
          aria-label="Search by patient name"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select className="min-w-0 flex-1 sm:flex-none" aria-label="Filter by doctor" value={doctorId} onChange={(e) => onDoctorChange(e.target.value)}>
        <option value="all">All doctors</option>
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.name}
          </option>
        ))}
      </Select>
      <Select
        className="min-w-0 flex-1 sm:flex-none"
        aria-label="Filter by status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as AppointmentStatus | "all")}
      >
        <option value="all">All statuses</option>
        <option value="confirmed">Confirmed</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="no-show">No-show</option>
      </Select>
    </div>
  );
}
