import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TablePaginationProps } from "./types";

export default function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemName = "data",
}: TablePaginationProps) {
  if (totalItems === 0) return null;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pages: number[] = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 text-xs text-slate-400 font-semibold">
      <span>
        Menampilkan {startItem}-{endItem} dari {totalItems} {itemName}
      </span>

      <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-white">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="h-7 w-7 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer disabled:cursor-not-allowed"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              "h-7 min-w-7 px-1.5 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer",
              p === currentPage
                ? "bg-[#b61722] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="h-7 w-7 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer disabled:cursor-not-allowed"
          title="Halaman Berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
