export default function PublicListingSkeleton() {
  return (
    <main className="min-h-[60vh] bg-[#f7f9fc]">
      <section className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-5 rounded-[2rem] border border-[var(--admin-border)] bg-white px-10 py-9 text-center shadow-[0_18px_40px_-30px_var(--admin-shadow)]">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--admin-primary-soft)]" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[var(--admin-primary)]" />
            <div className="absolute inset-3 rounded-full bg-[var(--admin-primary-soft)]" />
          </div>

          <div>
            <h2 className="text-xl font-black tracking-tight text-[var(--admin-text)]">
              Loading
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--admin-muted)]">
              {/* Finding the latest listings that match your selection. */}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
