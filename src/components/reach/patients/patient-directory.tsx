"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Users } from "lucide-react";
import { Card, Badge, SearchInput, Avatar, EmptyState, Tabs } from "@/components/ui";
import { formatDate, pluralize } from "@/lib/utils";
import type { Doctor, Patient } from "@/lib/types";

interface PatientDirectoryProps {
  patients: Patient[];
  doctors: Doctor[];
}

const genderLabel: Record<Patient["gender"], string | null> = {
  male: "Male",
  female: "Female",
  other: "Other",
  unknown: null,
};

function describe(p: Patient): string {
  return [Number.isFinite(p.age) ? `${p.age} yrs` : null, genderLabel[p.gender]].filter(Boolean).join(", ");
}

export function PatientDirectory({ patients, doctors }: PatientDirectoryProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | "new" | "returning">("all");
  const doctorMap = useMemo(() => new Map(doctors.map((d) => [d.id, d.name])), [doctors]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients
      .filter((p) => (!q || p.name.toLowerCase().includes(q) || p.phone.includes(q)) && (type === "all" || p.type === type))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [patients, search, type]);

  const counts = {
    all: patients.length,
    new: patients.filter((p) => p.type === "new").length,
    returning: patients.filter((p) => p.type === "returning").length,
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <SearchInput
            placeholder="Search by name or phone…"
            aria-label="Search patients by name or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs
          label="Patient type"
          value={type}
          onChange={(v) => setType(v as typeof type)}
          items={[
            { value: "all", label: "All", count: counts.all },
            { value: "new", label: "First visit", count: counts.new },
            { value: "returning", label: "Returning", count: counts.returning },
          ]}
        />
        <span className="ml-auto text-[13px] text-text-tertiary" aria-live="polite">
          {pluralize(filtered.length, "patient")}
        </span>
      </div>

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={patients.length === 0 ? "No patients yet" : "No patients match"}
            description={
              patients.length === 0
                ? "Patients appear here after they book online or are added by staff."
                : "Try a different name or phone number."
            }
          />
        ) : (
          <>
            {/* Phones: stacked rows */}
            <ul className="divide-y divide-border md:hidden">
              {filtered.map((p) => (
                <li key={p.id}>
                  <Link
                    prefetch={false}
                    href={`/reach/patients/${p.id}`}
                    className="focus-ring flex items-center gap-3 px-4 py-3 hover:bg-surface-sunken"
                  >
                    <Avatar name={p.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-text-primary">{p.name}</span>
                      <span className="block truncate text-[13px] text-text-tertiary">
                        {p.lastVisit ? `Last visit ${formatDate(p.lastVisit)}` : "No visits yet"}
                      </span>
                    </span>
                    <ChevronRight className="size-4 text-text-tertiary" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            {/* Tablet and desktop: table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-sunken text-[13px] text-text-secondary">
                  <tr>
                    <th scope="col" className="px-5 py-2.5 font-medium">Patient</th>
                    <th scope="col" className="px-5 py-2.5 font-medium">Phone</th>
                    <th scope="col" className="px-5 py-2.5 font-medium">Usual doctor</th>
                    <th scope="col" className="px-5 py-2.5 font-medium">Last visit</th>
                    <th scope="col" className="px-5 py-2.5 text-right font-medium">Visits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-sunken">
                      <td className="px-5 py-2.5">
                        <Link prefetch={false} href={`/reach/patients/${p.id}`} className="focus-ring group flex items-center gap-3 rounded-xs">
                          <Avatar name={p.name} size="sm" />
                          <span className="min-w-0">
                            <span className="block font-medium text-text-primary group-hover:underline">{p.name}</span>
                            {describe(p) && <span className="block text-[13px] text-text-tertiary">{describe(p)}</span>}
                          </span>
                          {p.type === "new" && <Badge tone="brand">First visit</Badge>}
                        </Link>
                      </td>
                      <td className="px-5 py-2.5 text-text-secondary tabular-nums">{p.phone || <Muted>Not recorded</Muted>}</td>
                      <td className="px-5 py-2.5 text-text-secondary">{doctorMap.get(p.primaryDoctorId) ?? <Muted>Not assigned</Muted>}</td>
                      <td className="px-5 py-2.5 text-text-secondary tabular-nums">
                        {p.lastVisit ? formatDate(p.lastVisit) : <Muted>No visits yet</Muted>}
                      </td>
                      <td className="px-5 py-2.5 text-right text-text-secondary tabular-nums">{p.totalVisits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <span className="text-text-tertiary">{children}</span>;
}
