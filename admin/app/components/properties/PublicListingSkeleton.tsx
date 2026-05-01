const FilterCardSkeleton = () => (
  <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 shadow-[0_16px_34px_-30px_var(--admin-shadow)]">
    <div className="space-y-4">
      <div className="h-3 w-24 rounded-full bg-[var(--admin-card)]" />
      <div className="h-12 rounded-2xl bg-[var(--admin-card)]" />
      <div className="h-12 rounded-2xl bg-[var(--admin-card)]" />
      <div className="h-12 rounded-2xl bg-[var(--admin-card)]" />
    </div>
  </div>
);

const CardSkeleton = () => (
  <div className="overflow-hidden rounded-[1.9rem] border border-[var(--admin-border)] bg-white shadow-[0_20px_40px_-30px_var(--admin-shadow)]">
    <div className="aspect-[16/11] bg-[var(--admin-card)]" />
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="h-3 w-20 rounded-full bg-[var(--admin-card)]" />
        <div className="h-3 w-16 rounded-full bg-[var(--admin-card)]" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-full rounded-full bg-[var(--admin-card)]" />
        <div className="h-5 w-3/4 rounded-full bg-[var(--admin-card)]" />
      </div>
      <div className="h-4 w-2/3 rounded-full bg-[var(--admin-card)]" />
      <div className="grid grid-cols-3 gap-3 rounded-[1.4rem] bg-[var(--admin-card)] p-3">
        <div className="h-10 rounded-xl bg-white/70" />
        <div className="h-10 rounded-xl bg-white/70" />
        <div className="h-10 rounded-xl bg-white/70" />
      </div>
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded-full bg-[var(--admin-card)]" />
          <div className="h-5 w-28 rounded-full bg-[var(--admin-card)]" />
        </div>
        <div className="h-11 w-32 rounded-full bg-[var(--admin-card)]" />
      </div>
    </div>
  </div>
);

const PopularLocationSkeleton = () => (
  <div className="rounded-[1.5rem] border border-[var(--admin-border)] bg-white px-5 py-4">
    <div className="mb-4 h-4 w-3/4 rounded-full bg-[var(--admin-card)]" />
    <div className="h-3 w-1/2 rounded-full bg-[var(--admin-card)]" />
  </div>
);

export default function PublicListingSkeleton() {
  return (
    <main className="min-h-screen animate-pulse bg-[radial-gradient(circle_at_top,_var(--admin-primary-soft),_transparent_35%),linear-gradient(180deg,_var(--admin-card)_0%,_var(--admin-surface)_52%,_var(--admin-background)_100%)]">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div className="space-y-5">
            <div className="h-8 w-52 rounded-full bg-white/70" />
            <div className="space-y-4">
              <div className="h-12 w-full max-w-xl rounded-[1.5rem] bg-white/70" />
              <div className="h-12 w-4/5 max-w-lg rounded-[1.5rem] bg-white/70" />
              <div className="h-5 w-full max-w-2xl rounded-full bg-white/70" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-[var(--admin-border)] bg-white p-6 shadow-[0_18px_40px_-28px_var(--admin-shadow)]">
            <div className="h-4 w-28 rounded-full bg-[var(--admin-card)]" />
            <div className="mt-4 flex items-end justify-between gap-4">
              <div className="h-12 w-24 rounded-[1rem] bg-[var(--admin-card)]" />
              <div className="space-y-2">
                <div className="h-3 w-36 rounded-full bg-[var(--admin-card)]" />
                <div className="h-3 w-28 rounded-full bg-[var(--admin-card)]" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <FilterCardSkeleton />
            <FilterCardSkeleton />
            <FilterCardSkeleton />
          </aside>

          <section className="space-y-6">
            <div className="flex flex-col gap-3 rounded-[1.75rem] border border-[var(--admin-border)] bg-white p-4 shadow-[0_16px_34px_-30px_var(--admin-shadow)] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-10 w-32 rounded-full bg-[var(--admin-card)]" />
                <div className="h-4 w-24 rounded-full bg-[var(--admin-card)]" />
              </div>
              <div className="h-12 w-full rounded-2xl bg-[var(--admin-card)] sm:w-[220px]" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <div className="h-11 w-28 rounded-full bg-white shadow-sm" />
              <div className="h-11 w-11 rounded-full bg-[var(--admin-primary)]" />
              <div className="h-11 w-11 rounded-full bg-white shadow-sm" />
              <div className="h-11 w-11 rounded-full bg-white shadow-sm" />
              <div className="h-11 w-24 rounded-full bg-white shadow-sm" />
            </div>

            <section className="rounded-[2rem] border border-[var(--admin-border)] bg-[color:color-mix(in_srgb,var(--admin-background)_88%,transparent)] p-6 shadow-sm backdrop-blur">
              <div className="mb-5 space-y-3">
                <div className="h-4 w-32 rounded-full bg-white/80" />
                <div className="h-8 w-80 rounded-[1rem] bg-white/80" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <PopularLocationSkeleton key={index} />
                ))}
              </div>
            </section>
          </section>
        </div>
      </section>
    </main>
  );
}
