import React from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Zap,
  AlertTriangle,
  CheckCircle,
  Search,
  Forward,
  Eye,
  Trash2,
  Clock,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Complaint, ComplaintUnit, UnitModel } from "@/types/complaint";
import { mapBackendUnitToFrontend } from "@/lib/api";
import TablePagination from "../TablePagination";

interface OverviewTabProps {
  isLoading: boolean;
  autoCloseDays: number;
  stats: any;
  complaints: Complaint[];
  units: UnitModel[];
  tableTab: "ALL" | "NEW" | "OPEN" | "DONE";
  setTableTab: (tab: "ALL" | "NEW" | "OPEN" | "DONE") => void;
  unitFilter: string;
  setUnitFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  paginatedDashboardComplaints: Complaint[];
  filteredComplaints: Complaint[];
  complaintPage: number;
  totalComplaintPages: number;
  complaintPageSize: number;
  setComplaintPage: (page: number) => void;
  auditLogs: any[];
  user: any;
  onOpenAutoClose: () => void;
  onForward: (c: Complaint) => void;
  onOpenDetail: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, currentVisibility: string) => void;
  onDownloadLogs: () => void;
}

export default function OverviewTab({
  isLoading,
  autoCloseDays,
  stats,
  complaints,
  units,
  tableTab,
  setTableTab,
  unitFilter,
  setUnitFilter,
  searchQuery,
  setSearchQuery,
  paginatedDashboardComplaints,
  filteredComplaints,
  complaintPage,
  totalComplaintPages,
  complaintPageSize,
  setComplaintPage,
  auditLogs,
  user,
  onOpenAutoClose,
  onForward,
  onOpenDetail,
  onDelete,
  onToggleVisibility,
  onDownloadLogs,
}: OverviewTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Pusat Kontrol
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pengawasan holistik terhadap tata kelola sekolah dan protokol respons yang tegas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAutoClose}
            className="h-11 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Clock className="h-4.5 w-4.5 text-slate-500" />
            <span className="flex items-center gap-1">
              Auto-Close (
              {isLoading ? (
                <span className="inline-block w-3 h-4 bg-slate-200 animate-pulse rounded blur-[2px]" />
              ) : (
                autoCloseDays
              )}{" "}
              Hari)
            </span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-[rgba(228,190,186,0.3)] p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <div className="bg-[#fdf2f2] p-2.5 rounded-xl border border-[#fee2e2] text-[#b61722]">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="block text-[13px] font-medium text-slate-500">Total Keluhan</span>
            <span
              className={cn(
                "block text-4xl font-extrabold tracking-tight transition-all duration-300",
                isLoading
                  ? "text-transparent bg-slate-200 blur-[3px] animate-pulse rounded-lg w-16 h-10 select-none"
                  : "text-slate-900"
              )}
            >
              {isLoading ? "0" : (stats?.totalCount ?? complaints.length)}
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-[rgba(228,190,186,0.3)] p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <div className="bg-[#eff6ff] p-2.5 rounded-xl border border-[#dbeafe] text-[#2563eb]">
              <Zap className="h-5 w-5 fill-[#2563eb]" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="block text-[13px] font-medium text-slate-500">Rata-rata Rating</span>
            <span
              className={cn(
                "block text-4xl font-extrabold tracking-tight transition-all duration-300",
                isLoading
                  ? "text-transparent bg-slate-200 blur-[3px] animate-pulse rounded-lg w-24 h-10 select-none"
                  : "text-slate-900"
              )}
            >
              {isLoading ? "0" : stats?.averageRating ? `${stats.averageRating} ★` : "0 ★"}
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-[rgba(228,190,186,0.3)] p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <div className="bg-[#fdf2f2] p-2.5 rounded-xl border border-[#fee2e2] text-[#b61722]">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="block text-[13px] font-medium text-slate-500">Belum Ditangani</span>
            <span
              className={cn(
                "block text-4xl font-extrabold tracking-tight transition-all duration-300",
                isLoading
                  ? "text-transparent bg-slate-200 blur-[3px] animate-pulse rounded-lg w-16 h-10 select-none"
                  : "text-slate-900"
              )}
            >
              {isLoading
                ? "0"
                : (stats?.pendingCount ??
                  complaints.filter((c) => c.status === "NEW").length)}
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-[rgba(228,190,186,0.3)] p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <div className="bg-[#f0fdf4] p-2.5 rounded-xl border border-[#dcfce7] text-[#16a34a]">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="block text-[13px] font-medium text-slate-500">Terselesaikan</span>
            <span
              className={cn(
                "block text-4xl font-extrabold tracking-tight transition-all duration-300",
                isLoading
                  ? "text-transparent bg-slate-200 blur-[3px] animate-pulse rounded-lg w-16 h-10 select-none"
                  : "text-slate-900"
              )}
            >
              {isLoading
                ? "0"
                : (stats?.resolvedCount ??
                  complaints.filter((c) => c.status === "DONE").length)}
            </span>
          </div>
        </div>
      </div>

      {/* Global Complaint List Table Card */}
      <div className="bg-white rounded-2xl border border-[rgba(228,190,186,0.3)] shadow-sm p-6 space-y-6">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-6">
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">Semua Aspirasi</h3>

            <div className="flex items-center gap-2 bg-[#f9f9f9] p-1 rounded-full border border-slate-200/60">
              <button
                onClick={() => setTableTab("ALL")}
                className={cn(
                  "px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                  tableTab === "ALL"
                    ? "bg-slate-200 text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Semua
              </button>
              <button
                onClick={() => setTableTab("NEW")}
                className={cn(
                  "px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                  tableTab === "NEW"
                    ? "bg-slate-200 text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Baru
              </button>
              <button
                onClick={() => setTableTab("OPEN")}
                className={cn(
                  "px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                  tableTab === "OPEN"
                    ? "bg-slate-200 text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Diproses
              </button>
              <button
                onClick={() => setTableTab("DONE")}
                className={cn(
                  "px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                  tableTab === "DONE"
                    ? "bg-slate-200 text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Selesai
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="h-9 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-red-400 transition-all text-slate-700 w-full sm:w-auto"
            >
              <option value="ALL">Semua Unit</option>
              {units.map((u) => (
                <option key={u.id} value={u.name}>
                  Unit {u.name}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari keluhan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-red-400 transition-all w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="text-slate-500 font-semibold text-xs border-b border-slate-100">
                <th className="pb-4 pl-2 font-semibold">Judul Keluhan</th>
                <th className="pb-4 font-semibold">Unit Pelaksana</th>
                <th className="pb-4 font-semibold">Status</th>
                <th className="pb-4 font-semibold">Visibility</th>
                <th className="pb-4 text-right pr-2 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-dash-${i}`} className="text-slate-700 text-sm align-middle">
                    <td className="py-5 pl-2 max-w-xs md:max-w-md">
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-3/4 bg-slate-200 blur-[2px] animate-pulse rounded-md" />
                        <div className="h-3 w-1/2 bg-slate-100 blur-[2px] animate-pulse rounded-md" />
                      </div>
                    </td>
                    <td className="py-5">
                      <div className="h-4 w-24 bg-slate-200 blur-[2px] animate-pulse rounded-md" />
                    </td>
                    <td className="py-5">
                      <div className="h-6 w-16 bg-slate-200 blur-[2px] animate-pulse rounded-full" />
                    </td>
                    <td className="py-5">
                      <div className="h-6 w-16 bg-slate-200 blur-[2px] animate-pulse rounded-full" />
                    </td>
                    <td className="py-5 text-right pr-2">
                      <div className="flex justify-end gap-2">
                        <div className="h-8 w-8 bg-slate-200 blur-[2px] animate-pulse rounded-lg" />
                        <div className="h-8 w-8 bg-slate-200 blur-[2px] animate-pulse rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                paginatedDashboardComplaints.map((c) => {
                  let friendlyUnitName = c.unit;
                  if (c.unit === "Sarpras")
                    friendlyUnitName = "Sarana & Prasarana" as ComplaintUnit;

                  const isNew = c.status === "NEW";
                  const isWaiting = false;
                  const isClosed = c.status === "DONE";
                  const isInProgress = c.status === "OPEN";

                  const infoDetail = `#REQ-${c.id
                    .substring(0, 8)
                    .toUpperCase()} • Disubmit ${new Date(c.createdAt).toLocaleDateString(
                    "id-ID",
                    { day: "numeric", month: "short", year: "numeric" }
                  )}`;

                  return (
                    <tr
                      key={c.id}
                      className="text-slate-700 text-sm hover:bg-slate-50/50 transition-all align-middle"
                    >
                      {/* Title & Info */}
                      <td className="py-5 pl-2 max-w-xs md:max-w-md">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            onClick={() => router.push(`/dashboard/complaints/${c.id}`)}
                            className="font-bold text-[#b61722] hover:underline cursor-pointer leading-snug"
                          >
                            {c.title}
                          </span>
                          {isNew && (
                            <span className="text-[10px] font-bold text-white bg-[#b61722] px-2 py-0.5 rounded-full">
                              48H+
                            </span>
                          )}
                          {isWaiting && c.title.includes("AC") && (
                            <span className="text-[10px] font-bold text-white bg-[#b61722] px-2 py-0.5 rounded-full">
                              72H+
                            </span>
                          )}
                        </div>
                        <span className="block text-[11px] text-slate-400 mt-1.5 font-medium">
                          {infoDetail}
                        </span>
                      </td>

                      {/* Assigned Unit */}
                      <td className="py-5 font-medium text-slate-500">
                        {friendlyUnitName || "Umum"}
                      </td>

                      {/* Status Badge */}
                      <td className="py-5">
                        <span
                          className={`inline-flex items-center text-[10px] font-semibold uppercase px-3 py-1 rounded-full ${
                            isClosed
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : isInProgress
                              ? "bg-amber-50 text-amber-600 border border-amber-250"
                              : isWaiting
                              ? "bg-purple-50 text-purple-600 border border-purple-200"
                              : "bg-blue-50 text-blue-600 border border-blue-200"
                          }`}
                        >
                          {isNew ? "OPEN" : c.status}
                        </span>
                      </td>

                      {/* Visibility Toggle */}
                      <td className="py-5">
                        <button
                          onClick={() =>
                            onToggleVisibility(c.id, c.visibility || "PUBLIC")
                          }
                          className="flex items-center gap-2 group cursor-pointer focus:outline-none"
                        >
                          <div
                            className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-all ${
                              c.visibility === "PUBLIC" ? "bg-blue-600" : "bg-slate-300"
                            }`}
                          >
                            <div
                              className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-all ${
                                c.visibility === "PUBLIC"
                                  ? "translate-x-4.5"
                                  : "translate-x-0"
                              }`}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            {c.visibility === "PUBLIC" ? "Public" : "Private"}
                          </span>
                        </button>
                      </td>

                      {/* Action buttons */}
                      <td className="py-5 text-right pr-2 shrink-0">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => onForward(c)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#fdf2f2] text-[#b61722] font-bold rounded-lg text-xs transition-colors border border-[#fde2e2] cursor-pointer"
                          >
                            <Forward className="h-3.5 w-3.5" />
                            <span>Teruskan</span>
                          </button>

                          <button
                            onClick={() => onOpenDetail(c.id)}
                            className="inline-flex items-center justify-center px-4 py-1.5 bg-[#b61722] hover:bg-red-650 text-white font-bold rounded-lg text-xs shadow-sm transition-all cursor-pointer"
                          >
                            Detail Informasi
                          </button>

                          <button
                            onClick={() => router.push(`/dashboard/complaints/${c.id}`)}
                            className="h-8 w-8 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </button>

                          {(user?.role === "SUPERADMIN" || user?.role === "SUPER_PIC") && (
                            <button
                              onClick={() => onDelete(c.id)}
                              className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                              title="Hapus Keluhan"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <TablePagination
          currentPage={complaintPage}
          totalPages={totalComplaintPages}
          totalItems={filteredComplaints.length}
          itemsPerPage={complaintPageSize}
          onPageChange={setComplaintPage}
          itemName="keluhan"
        />
      </div>

      {/* Performance Heatmap & ISO Audit Trail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Heatmap Card (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[rgba(228,190,186,0.3)] p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-lg tracking-tight">
              Evaluasi Kinerja Unit
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Analisis efisiensi penyelesaian laporan masing-masing unit kerja
            </p>
          </div>

          <div className="space-y-5">
            {units.length > 0 ? (
              units.map((unit) => {
                const unitStats = stats?.byUnit?.find(
                  (u: any) => u.unitId === unit.id || u.unitName === unit.name
                );
                const total = unitStats?.totalComplaints ?? 0;
                const rating = unitStats?.averageRating ?? 0;
                const resolvedCount = unitStats?.resolvedComplaints ?? 0;
                const rate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

                return (
                  <div key={unit.id} className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                      <span>{mapBackendUnitToFrontend(unit.name)}</span>
                      <span
                        className={cn(
                          rate >= 70
                            ? "text-[#16a34a]"
                            : rate >= 40
                            ? "text-[#d97706]"
                            : "text-[#ba1a1a]"
                        )}
                      >
                        {rate}% Efisien ({total} Keluhan, Rating:{" "}
                        {rating ? `${rating} ★` : "-"})
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          rate >= 70
                            ? "bg-[#16a34a]"
                            : rate >= 40
                            ? "bg-[#d97706]"
                            : "bg-[#b61722]"
                        )}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-slate-400 text-xs py-4 text-center">
                Belum ada unit kerja terdaftar.
              </div>
            )}
          </div>
        </div>

        {/* ISO Audit Trail Card (1/3 width) */}
        <div className="relative h-125 lg:h-auto">
          <div className="lg:absolute inset-0 bg-white rounded-2xl border border-[rgba(228,190,186,0.3)] p-6 shadow-sm flex flex-col h-full max-h-full">
            <div className="flex flex-col flex-1 min-h-0">
              <div className="shrink-0">
                <h3 className="font-bold text-slate-900 text-lg tracking-tight">
                  ISO Audit Trail
                </h3>
                <p className="text-slate-500 text-xs mt-1">
                  Riwayat aktivitas pengawasan log sistem
                </p>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto mt-5 pr-2 pb-4">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <div key={log.id} className="flex gap-3 items-start">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full mt-1.5 shrink-0",
                          log.action === "FORWARDED"
                            ? "bg-amber-500"
                            : log.action === "STATUS_CHANGED"
                            ? "bg-blue-500"
                            : "bg-[#b61722]"
                        )}
                      />
                      <div className="space-y-1 w-full text-left min-w-0">
                        <div className="flex justify-between items-start w-full">
                          <span className="block text-sm font-bold text-slate-800">
                            {log.action.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            #{log.id.substring(0, 8)}
                          </span>
                        </div>
                        <div className="block text-xs text-slate-500 font-medium">
                          <span className="text-slate-700 font-semibold">
                            {log.user?.name || "Sistem"}
                          </span>
                          {log.user?.role ? ` (${log.user.role})` : ""} melakukan aksi pada
                          entitas <span className="font-semibold">{log.entityType}</span> (ID:{" "}
                          <span className="font-mono text-[10px]">
                            {log.entityId.substring(0, 8)}
                          </span>
                          )
                        </div>
                        <span className="block text-[10px] text-slate-400 font-medium">
                          {new Date(log.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                        {log.meta && Object.keys(log.meta).length > 0 && (
                          <div className="mt-1 w-full max-w-full bg-slate-50 p-2 rounded border border-slate-100 text-[10px] font-mono text-slate-600 overflow-x-auto whitespace-nowrap custom-scrollbar">
                            {JSON.stringify(log.meta)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-xs py-4 text-center">
                    Belum ada log aktivitas baru.
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onDownloadLogs}
              className="w-full shrink-0 h-10 mt-4 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download System Logs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
