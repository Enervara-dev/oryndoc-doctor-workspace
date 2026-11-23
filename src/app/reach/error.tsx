"use client";
import { AlertTriangle } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="rounded-md border border-border bg-surface">
      <EmptyState
        icon={AlertTriangle}
        title="This view couldn't load"
        description="A clinic service didn't respond, or your access changed. Try again, or pick the clinic again."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={reset}>Try again</Button>
            <a
              href="/choose-clinic"
              className="focus-ring inline-flex h-9 items-center rounded-sm border border-border-input bg-surface px-3.5 text-sm font-medium text-text-primary hover:bg-surface-sunken"
            >
              Choose clinic
            </a>
          </div>
        }
      />
    </div>
  );
}
