import { formatLongDate } from "@/lib/utils";

interface MessagePreviewProps {
  clinicName: string;
  clinicLogoInitial: string;
  doctorName: string;
  patientName: string;
  followUpDate: string;
  reasonLabel: string;
  bookingUrl: string;
}

/** Approximate reminder text, clearly labelled as a preview (the provider template decides the final wording). */
export function MessagePreview({ clinicName, doctorName, patientName, followUpDate, reasonLabel, bookingUrl }: MessagePreviewProps) {
  const firstName = patientName.split(" ")[0];
  return (
    <figure className="rounded-md border border-border bg-surface-sunken p-4">
      <figcaption className="mb-2 text-xs font-medium text-text-tertiary">Reminder preview (not yet sent)</figcaption>
      <p className="max-w-prose text-sm leading-relaxed text-text-primary">
        Hi {firstName}, this is {clinicName}. {doctorName} would like to see you again for {reasonLabel.toLowerCase()} on{" "}
        {formatLongDate(followUpDate)}. Book here: <span className="break-all text-brand-text">{bookingUrl}</span>
      </p>
    </figure>
  );
}
