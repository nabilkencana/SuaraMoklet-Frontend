import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  MessageSquare,
  Flame,
  CheckCheck,
  Building2,
  ArrowRight,
  ThumbsUp,
  PenTool,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Complaint } from "@/types/complaint";
import { TOPIC_CONFIGS } from "./types";

interface ExploreLandingViewProps {
  searchVal: string;
  topicParam: string;
  isLoading: boolean;
  complaints: (Complaint & { category?: string; location?: string })[];
  onSearchChange: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onTopicSelect: (topic: string) => void;
}

export default function ExploreLandingView({
  searchVal,
  topicParam,
  isLoading,
  complaints,
  onSearchChange,
  onSearchSubmit,
  onTopicSelect,
}: ExploreLandingViewProps) {
  const router = useRouter();

  return (
    <div className="flex-1">
      {/* Hero search center segment */}
      <section className="bg-white border-b border-slate-200/60 py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Eksplorasi Aspirasi &amp; Laporan Sekolah
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Jelajahi keluhan dan aspirasi siswa untuk mendukung perubahan nyata di lingkungan sekolah
          </p>

          {/* Large search input */}
          <div className="max-w-2xl mx-auto pt-4">
            <form
              onSubmit={onSearchSubmit}
              className="flex items-center bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-1.5 focus-within:border-red-500 focus-within:shadow-xl focus-within:shadow-red-100/30 transition-all duration-300"
            >
              <div className="pl-3.5 text-slate-400 shrink-0">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Cari aspirasi atau keluhan..."
                value={searchVal}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 px-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent outline-none py-3"
              />
              {searchVal && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="p-1 rounded-full hover:bg-slate-200 text-slate-400 shrink-0 mr-1 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                className="shrink-0 h-11 sm:h-12 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all shadow-sm cursor-pointer"
              >
                Cari
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Explore contents */}
      <section className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Quick sections cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Jelajahi</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => router.push("/search?status=NEW&sort=NEWEST")}
              className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-red-300 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4 cursor-pointer group"
            >
              <div className="h-11 w-11 rounded-xl bg-red-50 group-hover:bg-red-100 flex items-center justify-center text-red-600 shrink-0 transition-colors">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Keluhan Terbaru
                </h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Aspirasi baru dari warga Moklet
                </p>
              </div>
            </button>

            <button
              onClick={() => router.push("/search?sort=POPULAR")}
              className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4 cursor-pointer group"
            >
              <div className="h-11 w-11 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-orange-500 shrink-0 transition-colors">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Paling Banyak Disukai
                </h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Aspirasi dengan dukungan terbanyak
                </p>
              </div>
            </button>

            <button
              onClick={() => router.push("/search?status=DONE")}
              className="bg-white border border-slate-200 rounded-2xl p-5 text-left hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4 cursor-pointer group"
            >
              <div className="h-11 w-11 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 transition-colors">
                <CheckCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Berhasil Diselesaikan
                </h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Keluhan yang telah ditangani sekolah
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Topics badge lists */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Topik</h3>
          <div className="flex flex-wrap gap-2.5">
            {TOPIC_CONFIGS.map((topic) => (
              <button
                key={topic.label}
                onClick={() => onTopicSelect(topic.label)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border transition-all active:scale-[0.97] cursor-pointer shadow-sm",
                  topicParam === topic.label
                    ? "bg-red-600 text-white border-transparent shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                )}
              >
                <topic.icon className="h-3.5 w-3.5" />
                {topic.label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Complaints Grid */}
        <div className="space-y-6 pt-6 border-t border-slate-200/60">
          <h2 className="text-xl font-extrabold text-slate-900">
            Aspirasi yang Diajukan oleh Siswa SuaraMoklet
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-xs text-slate-400 mt-2">Memuat laporan...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <Compass className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Belum ada laporan atau keluhan</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Jadilah yang pertama menuliskan keluhan atau aspirasi Anda demi sekolah yang lebih baik!
              </p>
              <Link
                href="/complaints/create"
                className="inline-flex h-9 px-4 items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Buat Keluhan Baru
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complaints.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group relative"
                >
                  <Link href={`/complaints/${item.id}`} className="absolute inset-0 z-10" />

                  {/* Image Header */}
                  <div className="relative aspect-16/10 bg-slate-100 overflow-hidden shrink-0">
                    {item.evidenceUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.evidenceUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-tr from-red-500/10 to-amber-500/10 flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-red-500/20" />
                      </div>
                    )}
                    <Link
                      href={`/complaints/${item.id}`}
                      className="absolute right-3.5 top-3.5 h-8.5 w-8.5 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all shadow shadow-black/20 z-20"
                    >
                      <ArrowRight className="h-4.5 w-4.5" />
                    </Link>
                  </div>

                  {/* Content Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4 relative z-20">
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.isAnonymous
                          ? "diajukan oleh anonim"
                          : `promosikan oleh ${item.reporter?.name || "Siswa"}`}
                      </div>

                      <Link href={`/complaints/${item.id}`} className="block relative z-20">
                        <h4 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-red-600 hover:underline transition-colors">
                          {item.title}
                        </h4>
                      </Link>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>{item.supports.toLocaleString("id-ID")} Suka</span>
                      </div>

                      <Link
                        href={`/complaints/${item.id}`}
                        className="w-full h-10 rounded-xl border border-slate-200 hover:bg-slate-50 active:scale-[0.98] text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative z-20"
                      >
                        <PenTool className="h-4 w-4" /> Lihat Laporan
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
