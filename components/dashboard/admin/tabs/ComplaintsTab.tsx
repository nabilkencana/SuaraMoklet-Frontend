import React from "react";
import { useRouter } from "next/navigation";
import { Search, Forward, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Complaint, ComplaintUnit, UnitModel } from "@/types/complaint";
import TablePagination from "../TablePagination";

interface ComplaintsTabProps {
  units: UnitModel[];
  tableTab: "ALL" | "NEW" | "OPEN" | "DONE";
  setTableTab: (tab: "ALL" | "NEW" | "OPEN" | "DONE") => void;
  unitFilter: string;
  setUnitFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  paginatedComplaintsList: Complaint[];
  filteredComplaints: Complaint[];
  complaintsListPage: number;
  totalComplaintsListPages: number;
  complaintsListPageSize: number;
  setComplaintsListPage: (page: number) => void;
  user: any;
  onForward: (c: Complaint) => void;
  onOpenDetail: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, currentVisibility: string) => void;
}

export default function ComplaintsTab({
  units,
  tableTab,
  setTableTab,
  unitFilter,
  setUnitFilter,
  searchQuery,
  setSearchQuery,
  paginatedComplaintsList,
  filteredComplaints,
  complaintsListPage,
  totalComplaintsListPages,
  complaintsListPageSize,
  setComplaintsListPage,
  user,
  onForward,
  onOpenDetail,
  onDelete,
  onToggleVisibility,
}: ComplaintsTabProps) {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Daftar Keluhan Global
        </h1>
        <p className="text-slate-500 text-xs mt-0.5 font-medium">
          Monitor, telaah, dan kelola semua keluhan dan aspirasi warga sekolah secara langsung.
        </p>
      </div>

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

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0">
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
              {paginatedComplaintsList.map((c) => {
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

                    <td className="py-5 font-medium text-slate-500">
                      {friendlyUnitName || "Umum"}
                    </td>

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
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <TablePagination
          currentPage={complaintsListPage}
          totalPages={totalComplaintsListPages}
          totalItems={filteredComplaints.length}
          itemsPerPage={complaintsListPageSize}
          onPageChange={setComplaintsListPage}
          itemName="keluhan"
        />
      </div>
    </div>
  );
}
