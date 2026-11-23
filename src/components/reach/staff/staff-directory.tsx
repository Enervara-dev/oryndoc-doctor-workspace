"use client";

import { useState } from "react";
import { Link2, Stethoscope } from "lucide-react";
import { Card, Badge, Avatar, EmptyState, Button, Drawer } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { RawDoctor } from "@/lib/api/models";
import type { StaffMember } from "@/lib/types";
import { LiveForm, Field } from "../live-form";

interface StaffDirectoryProps {
  staff: StaffMember[];
  /** Raw records carry the Central account link. */
  doctors: RawDoctor[];
  canManage: boolean;
}

/** Doctors registered in Reach. Other staff accounts live in Oryndoc Central. */
export function StaffDirectory({ staff, doctors, canManage }: StaffDirectoryProps) {
  const [linking, setLinking] = useState<RawDoctor | null>(null);
  const raw = new Map(doctors.map((d) => [d.id, d]));
  const sorted = [...staff].sort((a, b) => Number(b.status === "active") - Number(a.status === "active") || a.name.localeCompare(b.name));

  return (
    <Card className="overflow-hidden">
      {sorted.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No doctors yet" description="Add the clinic's doctors so patients can book them." />
      ) : (
        <ul className="divide-y divide-border">
          {sorted.map((member) => {
            const record = raw.get(member.id);
            const linked = Boolean(record?.centralUserId);
            return (
              <li key={member.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
                <Avatar name={member.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">{member.name}</p>
                  <p className="truncate text-[13px] text-text-tertiary">
                    {member.specialty || "Specialty not set"}
                    {member.joinedOn && <span>, added {formatDate(member.joinedOn)}</span>}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {record && (
                    <Badge tone={linked ? "info" : "neutral"}>{linked ? "Account linked" : "No Central account"}</Badge>
                  )}
                  <Badge dot tone={member.status === "active" ? "success" : "neutral"}>
                    {member.status === "active" ? "Bookable" : "Inactive"}
                  </Badge>
                  {canManage && record && (
                    <Button variant="ghost" size="sm" onClick={() => setLinking(record)}>
                      <Link2 className="size-4" aria-hidden="true" />
                      Account link
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Drawer
        open={Boolean(linking)}
        onClose={() => setLinking(null)}
        title={linking ? `Account link for ${linking.name}` : "Account link"}
        description="Linking a doctor to their Oryndoc Central account attributes their follow-up actions to them."
      >
        {linking && (
          <LiveForm bare operation="identity" label="Save account link" onSaved={() => setLinking(null)}>
            <input type="hidden" name="doctorId" value={linking.id} />
            <Field
              name="centralUserId"
              label="Central user ID"
              value={linking.centralUserId || ""}
              required={false}
              hint="Copy it from the user's record in Oryndoc Central. Leave empty to unlink."
            />
          </LiveForm>
        )}
      </Drawer>
    </Card>
  );
}
