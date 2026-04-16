export default function UsersLoading() {
  return (
    <div className="space-y-6">
      <div className="h-14 animate-pulse rounded-2xl border border-border bg-card" />
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-12 animate-pulse rounded-xl bg-muted/50"
          />
        ))}
      </div>
    </div>
  );
}
