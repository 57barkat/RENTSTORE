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
    <div className="flex items-center justify-center gap-4 mt-12 py-8 border-t border-gray-100">
      <button
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
        className="flex items-center gap-1 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 disabled:opacity-30 hover:bg-gray-50 transition-colors shadow-sm"
      >
        <ChevronLeft size={18} /> Prev
      </button>

      <div className="flex items-center bg-gray-100 px-4 py-2.5 rounded-xl">
        <span className="text-sm font-black text-blue-600">{currentPage}</span>
        <span className="mx-2 text-gray-400 text-xs">/</span>
        <span className="text-sm font-bold text-gray-600">{totalPages}</span>
      </div>

      <button
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
        className="flex items-center gap-1 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 disabled:opacity-30 hover:bg-gray-50 transition-colors shadow-sm"
      >
        Next <ChevronRight size={18} />
      </button>
    </div>
  );
}
