import React from "react";
import Link from "next/link";
import {
  Search,
  X,
  Filter,
  ArrowRight,
  ThumbsUp,
  Building2,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Complaint } from "@/types/complaint";
import { STATUSES, TOPICS } from "./types";

interface SearchResultsViewProps {
  query: string;
  statusParam: string;
  searchVal: string;
  sortBy: string;
  selectedStatus: string;
  selectedTopic: string;
  filteredResults: (Complaint & { category?: string; location?: string })[];
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onResetSearch: () => void;
  onSortChange: (sort: string) => void;
  onStatusChange: (status: string) => void;
  onTopicChange: (topic: string) => void;
}

export default function SearchResultsView({
  query,
  statusParam,
  searchVal,
  sortBy,
  selectedStatus,
  selectedTopic,
  filteredResults,
  onSearchChange,
  onSearchSubmit,
  onResetSearch,
  onSortChange,
  onStatusChange,
  onTopicChange,
}: SearchResultsViewProps) {
  return (
    <div className="flex-1 bg-white">
      {/* Header search input section */}
      <div className="border-b border-slate-200 bg-slate-50/50 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <form
            onSubmit={onSearchSubmit}
            className="flex items-center max-w-xl bg-white rounded-xl border border-slate-200 p-1"
          >
            <div className="pl-3.5 text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              placeholder="Cari keluhan atau aspirasi..."
              value={searchVal}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 px-3 text-sm text-slate-800 placeholder:text-slate-400 bg-transparent outline-none py-2.5"
            />
            {searchVal && (
              <button
                type="button"
                onClick={onResetSearch}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 shrink-0 mr-1.5 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="h-9 px-5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
            >
              Cari
            </button>
          </form>

          {/* Breadcrumb + Title and Result statistics */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
            <div className="space-y-1">
              <button
                onClick={onResetSearch}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-600 transition-colors font-medium cursor-pointer"
              >
                <ArrowRight className="h-3 w-3 rotate-180" />
                Kembali ke Jelajahi
              </button>
              <h2 className="text-lg font-extrabold text-slate-800">
                {query
                  ? `Hasil "${query}" (${filteredResults.length})`
                  : statusParam === "NEW"
                  ? `Keluhan Terbaru (${filteredResults.length})`
                  : statusParam === "DONE"
                  ? `Berhasil Diselesaikan (${filteredResults.length})`
                  : `Paling Banyak Disukai (${filteredResults.length})`}
              </h2>
            </div>

            {/* Sort selection */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-slate-400 uppercase tracking-wider">
                Urutkan berdasarkan:
              </span>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none cursor-pointer text-slate-700 font-bold"
              >
                <option value="POPULAR">Suka Terbanyak</option>
                <option value="NEWEST">Terbaru</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Core Results container */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left sidebar filters */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200">
                <Filter className="h-4 w-4 text-red-600" />
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Filter Laporan
                </span>
              </div>

              {/* Status filter list */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  STATUS LAPORAN
                </span>
                <div className="space-y-1">
                  {STATUSES.map((st) => (
                    <button
                      key={st.value}
                      onClick={() => onStatusChange(st.value)}
                      className={cn(
                        "w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                        selectedStatus === st.value
                          ? "bg-red-50 text-red-600 font-bold"
                          : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-800"
                      )}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic checklist filter */}
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  KATEGORI TOPIK
                </span>
                <div className="space-y-1">
                  {TOPICS.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => onTopicChange(topic)}
                      className={cn(
                        "w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                        selectedTopic === topic
                          ? "bg-red-50 text-red-600 font-bold"
                          : "text-slate-655 hover:bg-slate-100/50 hover:text-slate-800"
                      )}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Results Listing */}
          <div className="lg:col-span-9 space-y-6">
            {filteredResults.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <Compass className="h-12 w-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">
                  Tidak ada laporan yang cocok
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Coba cari menggunakan kata kunci yang berbeda atau jelajahi unit/kategori lainnya.
                </p>
                <button
                  onClick={onResetSearch}
                  className="h-9.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-650 cursor-pointer"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : (
              filteredResults.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-100 hover:border-slate-150 hover:shadow-sm rounded-2xl p-5 transition-all flex flex-col sm:flex-row gap-6 relative group"
                >
                  <Link href={`/complaints/${item.id}`} className="absolute inset-0 z-10" />

                  {/* Left Side: Text details */}
                  <div className="flex-1 space-y-2 relative z-20">
                    <Link href={`/complaints/${item.id}`} className="relative z-20">
                      <h3 className="font-extrabold text-slate-900 text-sm md:text-base leading-snug hover:text-red-600 hover:underline transition-colors">
                        {item.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-red-600 pt-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{item.supports.toLocaleString("id-ID")} Suka</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide pt-2">
                      <span className="flex items-center gap-1 text-slate-500">
                        {item.isAnonymous ? "Anonim" : item.reporter?.name || "Siswa"}
                      </span>
                      <span>·</span>
                      <span>{item.location || "Indonesia"}</span>
                      <span>·</span>
                      <span>
                        Dimulai{" "}
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Image */}
                  <div className="sm:w-40 md:w-48 aspect-[1.4] sm:h-28 md:h-32 shrink-0 relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 z-20">
                    {item.evidenceUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.evidenceUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-tr from-red-500/5 to-amber-500/5 flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-red-500/10" />
                      </div>
                    )}

                    <Link
                      href={`/complaints/${item.id}`}
                      className="absolute top-2.5 right-2.5 h-8.5 w-8.5 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/85 transition-all text-white flex items-center justify-center shadow opacity-0 group-hover:opacity-100 z-20"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
