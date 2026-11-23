/** Skeleton matching the page header + panel layout so content doesn't jump in. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="mb-5 space-y-2">
        <div className="skeleton h-6 w-40" />
        <div className="skeleton h-4 w-64" />
      </div>
      <div className="mb-5 h-24 rounded-md border border-border bg-surface p-4">
        <div className="skeleton h-full w-full" />
      </div>
      <div className="space-y-3 rounded-md border border-border bg-surface p-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton h-4 w-16" />
            <div className="skeleton size-7 rounded-full" />
            <div className="skeleton h-4 flex-1" />
            <div className="skeleton h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
