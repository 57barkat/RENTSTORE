export default function ObservabilityLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-[2rem] border border-[var(--admin-border)] bg-[var(--admin-card)]"
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-96 animate-pulse rounded-[2rem] border border-[var(--admin-border)] bg-[var(--admin-card)]"
          />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-[2rem] border border-[var(--admin-border)] bg-[var(--admin-card)]" />
    </div>
  );
}
