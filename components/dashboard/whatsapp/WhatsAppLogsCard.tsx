import React from "react";
import { Bot, RefreshCw, Search } from "lucide-react";
import { WhatsAppLog } from "./types";

interface WhatsAppLogsCardProps {
  logs: WhatsAppLog[];
  isLogsLoading: boolean;
  logPage: number;
  logTotalPages: number;
  logSearch: string;
  logStatusFilter: string;
  onSearchChange: (val: string) => void;
  onStatusFilterChange: (status: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
}

export default function WhatsAppLogsCard({
  logs,
  isLogsLoading,
  logPage,
  logTotalPages,
  logSearch,
  logStatusFilter,
  onSearchChange,
  onStatusFilterChange,
  onSearchSubmit,
  onRefresh,
  onPageChange,
}: WhatsAppLogsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-125">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
          Log Pesan Terkirim
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Realtime
          </span>
        </h4>
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isLogsLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <form onSubmit={onSearchSubmit} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor/pesan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={logSearch}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={logStatusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="SUCCESS">Berhasil</option>
          <option value="FAILED">Gagal</option>
        </select>
        <button
          type="submit"
          className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center cursor-pointer"
        >
          Cari
        </button>
      </form>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Bot className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-sm">Tidak ada log pesan ditemukan.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-1.5"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-800">{log.to}</span>
                <span className="text-[10px] font-medium text-slate-400">
                  {new Date(log.createdAt).toLocaleString("id-ID")}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                {log.message}
              </p>
              <div className="flex justify-between items-center mt-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    log.status === "SUCCESS"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {log.status === "SUCCESS" ? "Terkirim" : "Gagal"}
                </span>
                {log.errorMessage && (
                  <span
                    className="text-[10px] text-red-500 truncate max-w-37.5"
                    title={log.errorMessage}
                  >
                    {log.errorMessage}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {logTotalPages > 1 && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
          <button
            disabled={logPage === 1}
            onClick={() => onPageChange(logPage - 1)}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-xs font-bold text-slate-700 rounded-lg cursor-pointer"
          >
            Prev
          </button>
          <span className="text-xs font-medium text-slate-500">
            Hal {logPage} dari {logTotalPages}
          </span>
          <button
            disabled={logPage === logTotalPages}
            onClick={() => onPageChange(logPage + 1)}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-xs font-bold text-slate-700 rounded-lg cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
