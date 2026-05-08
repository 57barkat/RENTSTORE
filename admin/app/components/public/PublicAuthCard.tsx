"use client";

export default function PublicAuthCard({
  title,
  description,
  children,
  aside,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  aside: React.ReactNode;
}) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full overflow-hidden rounded-[2rem] border border-[var(--admin-border)] bg-white shadow-[0_28px_60px_-36px_var(--admin-shadow)] lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--admin-secondary)]">
            AnganStay Account
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[var(--admin-text)]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
            {description}
          </p>
          <div className="mt-8">{children}</div>
        </div>
        <aside className="border-t border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 lg:border-l lg:border-t-0 lg:p-8">
          {aside}
        </aside>
      </div>
    </section>
  );
}
