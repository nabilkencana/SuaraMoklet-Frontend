"use client";

import React, { useState, useEffect } from "react";
import { Loader2, QrCode, Smartphone, Bot, Zap, CheckCircle, AlertTriangle, LogOut, RefreshCw, Save, Check, X, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

interface WhatsAppManagerProps {
  isActive: boolean;
}

export default function WhatsAppManager({ isActive }: WhatsAppManagerProps) {
  const [waStatus, setWaStatus] = useState<"offline" | "disconnected" | "online" | "connecting">("offline");
  const [isWaLoading, setIsWaLoading] = useState(false);
  const [waQrCode, setWaQrCode] = useState<string>("");
  const [waQrExpiresIn, setWaQrExpiresIn] = useState<number>(0);
  const [waUser, setWaUser] = useState<any>(null);
  const [waQrExpired, setWaQrExpired] = useState(false);
  const [waConnectedAt, setWaConnectedAt] = useState<number | null>(null);
  const [runtimeStr, setRuntimeStr] = useState<string>("-");

  // State for Logs
  const [logs, setLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logSearch, setLogSearch] = useState("");
  const [logStatusFilter, setLogStatusFilter] = useState("");

  // State for Templates
  const [templates, setTemplates] = useState<any[]>([]);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (isActive) {
      fetchWaStatus();
      const interval = setInterval(() => {
        fetchWaStatus();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  useEffect(() => {
    let qrPollInterval: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    if (isActive && waStatus === "connecting" && !waQrExpired) {
      const fetchQr = async () => {
        try {
          const res = await apiClient.whatsapp.getQrCode();
          if (res.data && res.data.qrBase64) {
            setWaQrCode(res.data.qrBase64);
            setWaQrExpiresIn(res.data.expiresInSeconds);
            setIsWaLoading(false);
            if (res.data.expiresInSeconds <= 0) {
              setWaQrExpired(true);
            }
          }
        } catch (e) {
          // Ignore
        }
      };

      fetchQr();
      qrPollInterval = setInterval(fetchQr, 5000);

      countdownInterval = setInterval(() => {
        setWaQrExpiresIn((prev) => {
          if (prev <= 0) return 0;
          if (prev <= 1) {
            setWaQrExpired(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (qrPollInterval) clearInterval(qrPollInterval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [isActive, waStatus, waQrExpired]);

  // Compute Runtime
  useEffect(() => {
    let runtimeInterval: NodeJS.Timeout;
    if (waStatus === "online" && waConnectedAt) {
      const updateRuntime = () => {
        const diffMs = Date.now() - waConnectedAt;
        const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
        
        const h = Math.floor(diffSecs / 3600);
        const m = Math.floor((diffSecs % 3600) / 60);
        const s = diffSecs % 60;
        
        if (h > 0) setRuntimeStr(`${h}j ${m}m ${s}s`);
        else if (m > 0) setRuntimeStr(`${m}m ${s}s`);
        else setRuntimeStr(`${s}s`);
      };
      
      updateRuntime();
      runtimeInterval = setInterval(updateRuntime, 1000);
    } else {
      setRuntimeStr("-");
    }
    return () => clearInterval(runtimeInterval);
  }, [waStatus, waConnectedAt]);

  // Fetch Logs & Templates when online
  useEffect(() => {
    if (isActive && waStatus === "online") {
      fetchLogs();
      fetchTemplates();
      
      const logsInterval = setInterval(() => {
        fetchLogs(logPage, false);
      }, 10000); // Polling every 10s for realtime logs
      return () => clearInterval(logsInterval);
    }
  }, [isActive, waStatus, logPage, logStatusFilter]);

  const fetchWaStatus = async () => {
    try {
      const data = await apiClient.whatsapp.getStatus();
      if (data && data.data) {
        if (data.data.connectionStatus === "open") {
          setWaStatus("online");
          setWaUser(data.data.user);
          setWaConnectedAt(data.data.connectedAt || null);
          setWaQrCode("");
          setWaQrExpired(false);
          setIsWaLoading(false);
        } else if (data.data.connectionStatus === "connecting") {
          setWaStatus("connecting");
        } else {
          setWaStatus("disconnected");
          setWaConnectedAt(null);
        }
      }
    } catch (e) {
      setWaStatus("offline");
      setWaConnectedAt(null);
    }
  };

  const fetchLogs = async (page = 1, showLoading = true) => {
    if (showLoading) setIsLogsLoading(true);
    try {
      const res = await apiClient.notifications.getWhatsAppLogs({
        page,
        limit: 10,
        status: logStatusFilter,
        search: logSearch
      });
      if (res && res.data) {
        setLogs(res.data);
        setLogTotalPages(res.meta?.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setIsLogsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    setIsTemplatesLoading(true);
    try {
      const res = await apiClient.notifications.getTemplates();
      if (res) {
        setTemplates(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTemplatesLoading(false);
    }
  };

  const handleWaInit = async () => {
    setIsWaLoading(true);
    setWaQrExpired(false);
    setWaQrCode("");
    setWaQrExpiresIn(0);
    try {
      if (waStatus === "connecting" || waQrExpired) {
        await apiClient.whatsapp.cancel().catch(() => null);
      }
      await apiClient.whatsapp.init();
      toast.success("Meminta QR Code...");
      fetchWaStatus();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Gagal mendapatkan QR Code");
      setIsWaLoading(false);
    }
  };

  const handleWaCancel = async () => {
    setIsWaLoading(true);
    try {
      await apiClient.whatsapp.cancel();
      setWaQrCode("");
      setWaQrExpired(false);
      setWaStatus("disconnected");
    } catch (e: any) {
      toast.error("Gagal membatalkan proses");
    } finally {
      setIsWaLoading(false);
    }
  };

  const handleWaDisconnect = async () => {
    setIsWaLoading(true);
    try {
      await apiClient.whatsapp.disconnect();
      toast.success("Bot terputus");
      setWaQrCode("");
      setWaUser(null);
      setWaStatus("disconnected");
    } catch (e: any) {
      toast.error("Gagal disconnect bot");
    } finally {
      setIsWaLoading(false);
    }
  };

  const handleSaveTemplate = async (name: string) => {
    try {
      await apiClient.notifications.updateTemplate(name, editContent);
      toast.success("Template berhasil disimpan!");
      setEditingTemplate(null);
      fetchTemplates();
    } catch (e) {
      toast.error("Gagal menyimpan template");
    }
  };

  const handleSearchLog = (e: React.FormEvent) => {
    e.preventDefault();
    setLogPage(1);
    fetchLogs(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">WhatsApp Bot Integration</h2>
        <p className="text-slate-500 mt-1">
          Hubungkan sistem dengan WhatsApp untuk notifikasi otomatis.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        {waStatus === "offline" && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-2">
              <Bot className="h-10 w-10 text-slate-400" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-lg font-bold text-slate-800">Status: OFFLINE</h3>
              <p className="text-sm text-slate-500">Layanan WhatsApp saat ini sedang tidak tersedia atau dalam masa pemeliharaan. Silakan hubungi tim dukungan teknis untuk bantuan lebih lanjut.</p>
            </div>
          </div>
        )}

        {waStatus === "disconnected" && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-2">
              <Smartphone className="h-10 w-10 text-blue-500" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-lg font-bold text-slate-800">Status: DISCONNECTED</h3>
              <p className="text-sm text-slate-500">Sistem WhatsApp Bot belum terhubung ke sesi aktif. Silakan mulai inisialisasi untuk menghubungkan perangkat Anda.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleWaInit} disabled={isWaLoading} className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50">
                {isWaLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <QrCode className="h-5 w-5" />}
                <span>Dapatkan QR</span>
              </button>
            </div>
          </div>
        )}

        {waStatus === "connecting" && (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center mb-2 relative">
              <Zap className="h-10 w-10 text-amber-500 animate-pulse" />
              {isWaLoading && (
                <div className="absolute inset-0 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
              )}
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-lg font-bold text-slate-800">Status: CONNECTING</h3>
              <p className="text-sm text-slate-500">
                {!waQrCode ? "Menyiapkan QR Code dari server..." : "Scan QR Code di bawah dengan aplikasi WhatsApp Anda"}
              </p>
            </div>
            
            {waQrCode && !waQrExpired && (
              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm inline-block">
                  <img src={waQrCode} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  <span>Menunggu scan... ({waQrExpiresIn}s)</span>
                </div>
              </div>
            )}

            {waQrExpired && (
              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="p-8 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center gap-2 text-red-600">
                  <AlertTriangle className="h-10 w-10" />
                  <span className="font-bold">QR Code Expired</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mt-4">
              {waQrExpired ? (
                <button onClick={handleWaInit} disabled={isWaLoading} className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50">
                  {isWaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                  <span>Get QR Ulang</span>
                </button>
              ) : (
                <button onClick={handleWaCancel} disabled={isWaLoading} className="h-11 px-6 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50">
                  <span>Batal</span>
                </button>
              )}
            </div>
          </div>
        )}

        {waStatus === "online" && (
          <div className="space-y-8">
            {/* Status Header */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Status: ONLINE</h3>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-slate-600">
                    <span className="font-semibold">Nama: {waUser?.name || "WhatsApp Bot"}</span>
                    <span className="hidden md:inline">•</span>
                    <span className="font-semibold">Nomor: {waUser?.id?.split(':')[0] || waUser?.id || "-"}</span>
                    <span className="hidden md:inline">•</span>
                    <span className="font-semibold text-blue-600">Runtime: {runtimeStr}</span>
                  </div>
                </div>
              </div>
              <button onClick={handleWaDisconnect} disabled={isWaLoading} className="h-11 px-6 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50">
                {isWaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                <span>Disconnect Bot</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* WhatsApp Logs */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-[500px]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    Log Pesan Terkirim
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Realtime
                    </span>
                  </h4>
                  <button onClick={() => fetchLogs(logPage)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                    <RefreshCw className={`h-4 w-4 ${isLogsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <form onSubmit={handleSearchLog} className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Cari nomor/pesan..." 
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                    />
                  </div>
                  <select 
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={logStatusFilter}
                    onChange={(e) => {
                      setLogStatusFilter(e.target.value);
                      setLogPage(1);
                    }}
                  >
                    <option value="">Semua Status</option>
                    <option value="SUCCESS">Berhasil</option>
                    <option value="FAILED">Gagal</option>
                  </select>
                  <button type="submit" className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center">
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
                      <div key={log.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-1.5">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-800">{log.to}</span>
                          <span className="text-[10px] font-medium text-slate-400">{new Date(log.createdAt).toLocaleString('id-ID')}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">{log.message}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {log.status === 'SUCCESS' ? 'Terkirim' : 'Gagal'}
                          </span>
                          {log.errorMessage && <span className="text-[10px] text-red-500 truncate max-w-[150px]" title={log.errorMessage}>{log.errorMessage}</span>}
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
                      onClick={() => setLogPage(p => p - 1)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-xs font-bold text-slate-700 rounded-lg"
                    >
                      Prev
                    </button>
                    <span className="text-xs font-medium text-slate-500">Hal {logPage} dari {logTotalPages}</span>
                    <button 
                      disabled={logPage === logTotalPages}
                      onClick={() => setLogPage(p => p + 1)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-xs font-bold text-slate-700 rounded-lg"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              {/* Notification Templates */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-[500px]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-bold text-slate-800">Template Pesan Otomatis</h4>
                  <button onClick={fetchTemplates} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                    <RefreshCw className={`h-4 w-4 ${isTemplatesLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-4 text-xs text-blue-700 flex gap-2 items-start">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    Gunakan variabel (dibungkus kurung kurawal) di bawah ini sesuai template: <br/>
                    <strong>{`{title}`}</strong>: Judul Keluhan<br/>
                    <strong>{`{name}`}</strong>: Nama Pembuat Keluhan<br/>
                    <strong>{`{status}`}</strong>: Status (NEW, OPEN, DONE)<br/>
                    <strong>{`{unit}`}</strong>: Nama Unit<br/>
                    <strong>{`{note}`}</strong>: Catatan Forward
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {templates.length === 0 && !isTemplatesLoading && (
                    <div className="text-center text-slate-400 py-4 text-sm">Tidak ada template.</div>
                  )}
                  {templates.map((tpl) => (
                    <div key={tpl.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-800">{tpl.name}</span>
                        {editingTemplate !== tpl.name ? (
                          <button 
                            onClick={() => {
                              setEditingTemplate(tpl.name);
                              setEditContent(tpl.content);
                            }}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={() => setEditingTemplate(null)} className="text-[11px] font-bold text-slate-500 hover:text-slate-700">Batal</button>
                            <button onClick={() => handleSaveTemplate(tpl.name)} className="text-[11px] font-bold text-green-600 hover:text-green-700 flex items-center gap-1">
                              <Save className="h-3 w-3" /> Simpan
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-white">
                        {editingTemplate === tpl.name ? (
                          <textarea 
                            className="w-full min-h-[100px] text-xs p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                          />
                        ) : (
                          <p className="text-xs text-slate-600 whitespace-pre-wrap">{tpl.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
