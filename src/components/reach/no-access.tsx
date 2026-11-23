import { Lock } from "lucide-react";
import { EmptyState } from "@/components/ui";

/** Shown when the signed-in role lacks the permission a page needs. */
export function NoAccess({ area }: { area: string }) {
  return (
    <div className="rounded-md border border-border bg-surface">
      <EmptyState
        icon={Lock}
        title={`You don't have access to ${area}`}
        description="Your role at this clinic doesn't include this area. Ask a clinic admin to update your role in Oryndoc Central."
      />
    </div>
  );
}
