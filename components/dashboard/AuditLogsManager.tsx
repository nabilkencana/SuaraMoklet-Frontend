"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Search, Filter, Calendar as CalendarIcon, Download, ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AuditLogsManager() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.auditLogs.getAll({
        page,
        limit,
        search: search.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setLogs(response.data || []);
      setTotal(response.meta?.total || 0);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      toast.error("Gagal memuat log sistem");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add debounce for search
    const timer = setTimeout(() => {
      fetchLogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, limit, search, startDate, endDate]);

  const totalPages = Math.ceil(total / limit);

  const handleDownloadLogs = async () => {
    try {
      const auditData = await apiClient.auditLogs.getAll({
        limit: 10000,
        search: search.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      const exportLogs = auditData?.data || [];
      if (exportLogs.length === 0) {
        toast.error("Tidak ada log untuk diunduh");
        return;
      }
      
      const csvRows = [
        ["ID", "Waktu", "Aksi", "Tipe Entitas", "Oleh", "Role"],
        ...exportLogs.map((log: any) => [
          log.id,
          new Date(log.createdAt).toLocaleString('id-ID'),
          log.action,
          log.entityType,
          log.user?.name || "Sistem",
          log.user?.role || "-"
        ])
      ];
      
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `iso_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Log berhasil diunduh");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh log");
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("DELETE") || action.includes("CANCEL") || action.includes("DISCONNECT") || action.includes("REJECT")) return "bg-red-50 text-red-600 border-red-200";
    if (action.includes("CREATE") || action.includes("CONNECT") || action.includes("RESOLVE") || action.includes("RESTORE")) return "bg-emerald-50 text-emerald-600 border-emerald-200";
    if (action.includes("UPDATE") || action.includes("FORWARD")) return "bg-blue-50 text-blue-600 border-blue-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">ISO Audit Trail</h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">Riwayat aktivitas pengawasan log sistem</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadLogs}
            className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Unduh Laporan</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(228,190,186,0.3)] shadow-sm p-6 space-y-6">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              placeholder="Cari berdasarkan aksi, tipe entitas, atau nama..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-red-400 transition-all font-medium"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <CalendarIcon className="h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs text-slate-700 outline-none"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs text-slate-700 outline-none"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setPage(1);
                }}
                className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="text-slate-500 font-semibold text-xs border-b border-slate-100">
                <th className="pb-4 pl-2 font-semibold">Waktu</th>
                <th className="pb-4 font-semibold">Aksi</th>
                <th className="pb-4 font-semibold">Entitas</th>
                <th className="pb-4 font-semibold">Oleh</th>
                <th className="pb-4 font-semibold">Meta (Opsional)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="text-slate-700 text-sm align-middle">
                    <td className="py-5 pl-2"><div className="h-4 w-32 bg-slate-200 animate-pulse rounded" /></td>
                    <td className="py-5"><div className="h-6 w-24 bg-slate-200 animate-pulse rounded-full" /></td>
                    <td className="py-5"><div className="h-4 w-20 bg-slate-200 animate-pulse rounded" /></td>
                    <td className="py-5"><div className="h-4 w-24 bg-slate-200 animate-pulse rounded" /></td>
                    <td className="py-5"><div className="h-4 w-full bg-slate-200 animate-pulse rounded" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">
                    {search || startDate || endDate ? "Tidak ada log yang sesuai dengan filter." : "Belum ada log sistem."}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="text-slate-700 text-sm hover:bg-slate-50/50 transition-all align-middle">
                    <td className="py-4 pl-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">
                          {new Date(log.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={cn(
                        "inline-flex items-center text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full border",
                        getActionColor(log.action)
                      )}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{log.entityType}</span>
                        <span className="text-[10px] text-slate-400 font-mono" title={log.entityId}>{log.entityId.substring(0, 8)}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{log.user?.name || "Sistem"}</span>
                        {log.user?.role && <span className="text-[10px] text-slate-500">{log.user.role}</span>}
                      </div>
                    </td>
                    <td className="py-4">
                      {log.meta && Object.keys(log.meta).length > 0 ? (
                        <div className="max-w-[200px] md:max-w-[300px] lg:max-w-[400px] text-[11px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 overflow-x-auto whitespace-nowrap" title={JSON.stringify(log.meta)}>
                          {JSON.stringify(log.meta)}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t border-slate-100 text-xs text-slate-400 font-semibold">
          <span>Menampilkan {(page - 1) * limit + 1}-{Math.min(page * limit, total)} dari {total} log</span>

          <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-white">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-slate-700 font-bold">
              Hal {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
