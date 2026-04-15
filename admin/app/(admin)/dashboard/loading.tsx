export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="h-80 animate-pulse rounded-2xl border border-border bg-card" />
        <div className="h-80 animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    </div>
  );
}
