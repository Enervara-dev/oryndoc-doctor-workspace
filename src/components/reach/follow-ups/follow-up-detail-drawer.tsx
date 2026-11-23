"use client";

import { MessageSquare } from "lucide-react";
import { Drawer, Badge } from "@/components/ui";
import { followUpStatusMeta } from "@/lib/status";
import { formatDate, formatLongDate, relativeDayLabel, todayInZone } from "@/lib/utils";
import { MessagePreview } from "./message-preview";
import { LiveForm } from "../live-form";
import { useWorkspace } from "../shell/workspace-context";
import type { Clinic, FollowUp, FollowUpMessage } from "@/lib/types";

const channelLabel = { sms: "SMS", whatsapp: "WhatsApp", email: "Email" } as const;

interface FollowUpDetailDrawerProps {
  followUp: FollowUp | null;
  messages: FollowUpMessage[];
  clinic: Clinic;
  onClose: () => void;
}

export function FollowUpDetailDrawer({ followUp, messages, clinic, onClose }: FollowUpDetailDrawerProps) {
  const { permissions } = useWorkspace();
  const status = followUp ? followUpStatusMeta[followUp.status] : null;
  const today = todayInZone(clinic.timezone);
  const open = followUp && !["completed", "cancelled"].includes(followUp.status);

  return (
    <Drawer open={Boolean(followUp)} onClose={onClose} title="Follow-up" widthClassName="sm:max-w-lg">
      {followUp && status && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-text-primary">{followUp.patientName}</p>
              <p className="text-[13px] text-text-secondary">{followUp.reasonLabel}</p>
            </div>
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
          </div>

          <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2.5 text-sm">
            <dt className="text-text-tertiary">Due</dt>
            <dd className="text-text-primary">
              {formatLongDate(followUp.followUpDate)}
              <span className="text-text-tertiary"> ({relativeDayLabel(followUp.followUpDate, today).toLowerCase()})</span>
            </dd>
            <dt className="text-text-tertiary">Doctor</dt>
            <dd className="text-text-primary">{followUp.doctorName}</dd>
            <dt className="text-text-tertiary">Reminder</dt>
            <dd className="text-text-primary">
              {followUp.lastMessageSentOn
                ? `Sent ${formatDate(followUp.lastMessageSentOn)}`
                : followUp.messageStatus
                  ? followUp.messageStatus.charAt(0) + followUp.messageStatus.slice(1).toLowerCase()
                  : "Not queued"}
            </dd>
          </dl>

          {followUp.messageError && (
            <p role="alert" className="rounded-sm bg-danger-subtle px-3 py-2.5 text-[13px] text-danger">
              Reminder failed: {followUp.messageError}
            </p>
          )}

          {followUp.messagePreview ? (
            <figure className="rounded-md border border-border bg-surface-sunken p-4">
              <figcaption className="mb-2 text-xs font-medium text-text-tertiary">Stored reminder text</figcaption>
              <p className="text-sm whitespace-pre-wrap text-text-primary">{followUp.messagePreview}</p>
            </figure>
          ) : (
            <MessagePreview
              clinicName={clinic.name}
              clinicLogoInitial={clinic.logoInitial}
              doctorName={followUp.doctorName}
              patientName={followUp.patientName}
              followUpDate={followUp.followUpDate}
              reasonLabel={followUp.reasonLabel}
              bookingUrl={clinic.bookingUrl}
            />
          )}

          <section aria-labelledby="fu-history">
            <h3 id="fu-history" className="mb-2 text-sm font-semibold text-text-primary">
              Messages sent
            </h3>
            {messages.length === 0 ? (
              <p className="flex items-center gap-2 text-[13px] text-text-tertiary">
                <MessageSquare className="size-4" aria-hidden="true" />
                Nothing has been sent to the patient yet.
              </p>
            ) : (
              <ol className="divide-y divide-border rounded-md border border-border">
                {messages.map((m) => (
                  <li key={m.id} className="px-3 py-2.5">
                    <p className="text-[13px] font-medium text-text-primary">
                      {channelLabel[m.channel]}, {formatDate(m.sentOn)}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[13px] text-text-secondary">{m.preview}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {open && permissions.includes("followups:write") && (
            <section aria-label="Update follow-up" className="flex flex-wrap gap-2 border-t border-border pt-5">
              <LiveForm bare operation="followup-complete" label="Mark completed" onSaved={onClose}>
                <input name="id" type="hidden" value={followUp.id} />
              </LiveForm>
              <LiveForm
                bare
                operation="followup-cancel"
                label="Cancel follow-up"
                tone="secondary"
                confirm="Cancel this follow-up? No further reminders will be sent."
                onSaved={onClose}
              >
                <input name="id" type="hidden" value={followUp.id} />
              </LiveForm>
            </section>
          )}
        </div>
      )}
    </Drawer>
  );
}
