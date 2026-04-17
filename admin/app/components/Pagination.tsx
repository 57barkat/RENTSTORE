"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const goToPage = (page: number) => {
    const query = new URLSearchParams(params.toString());
    query.set("page", page.toString());
    router.push(`?${query.toString()}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex items-center justify-center gap-4 border-t border-[var(--admin-border)] py-8">
      <button
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
        className="admin-button-secondary flex items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-30"
      >
        <ChevronLeft size={18} /> Prev
      </button>

      <div className="flex items-center rounded-xl bg-[var(--admin-surface)] px-4 py-2.5">
        <span className="text-sm font-black text-[var(--admin-primary)]">{currentPage}</span>
        <span className="mx-2 text-xs text-[var(--admin-placeholder)]">/</span>
        <span className="text-sm font-bold text-[var(--admin-muted)]">{totalPages}</span>
      </div>

      <button
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
        className="admin-button-secondary flex items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-30"
      >
        Next <ChevronRight size={18} />
      </button>
    </div>
  );
}
