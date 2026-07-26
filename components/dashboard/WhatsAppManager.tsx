"use client";

import React, { useState, useEffect } from "react";
import { Loader2, QrCode, Smartphone, Bot, Zap, CheckCircle, AlertTriangle, LogOut } from "lucide-react";
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

  useEffect(() => {
    if (isActive) {
      fetchWaStatus();
      const interval = setInterval(() => {
        fetchWaStatus();
      }, 3000);
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

  const fetchWaStatus = async () => {
    try {
      const data = await apiClient.whatsapp.getStatus();
      if (data && data.data) {
        if (data.data.connectionStatus === "open") {
          setWaStatus("online");
          setWaUser(data.data.user);
          setWaQrCode("");
          setWaQrExpired(false);
          setIsWaLoading(false);
        } else if (data.data.connectionStatus === "connecting") {
          setWaStatus("connecting");
        } else {
          setWaStatus("disconnected");
        }
      }
    } catch (e) {
      setWaStatus("offline");
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
              <p className="text-sm text-slate-500">Node WhatsApp service sedang mati atau tidak dapat dijangkau. Hubungi administrator sistem.</p>
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
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="h-24 w-24 bg-green-50 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div className="space-y-4 max-w-md w-full">
              <h3 className="text-lg font-bold text-slate-800">Status: ONLINE</h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-semibold text-slate-500">Nomor Bot</span>
                  <span className="text-sm font-bold text-slate-800">{waUser?.id?.split(':')[0] || waUser?.id || "-"}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-slate-500">Nama Bot</span>
                  <span className="text-sm font-bold text-slate-800">{waUser?.name || "WhatsApp Bot"}</span>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-left space-y-3 mt-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span>Log Pesan Terkirim</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Hari Ini</span>
                </h4>
                <div className="space-y-3 h-40 overflow-y-auto pr-2">
                  <div className="flex flex-col gap-1 border-b border-slate-50 pb-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold text-slate-700">Notifikasi Keluhan Baru</span>
                      <span className="text-[9px] font-medium text-slate-400">10:45 AM</span>
                    </div>
                    <span className="text-[10px] text-slate-500 line-clamp-2">Pesan berhasil dikirim ke +6281234567890: "Ada keluhan baru..."</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-slate-50 pb-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold text-slate-700">Update Status Diproses</span>
                      <span className="text-[9px] font-medium text-slate-400">09:15 AM</span>
                    </div>
                    <span className="text-[10px] text-slate-500 line-clamp-2">Pesan berhasil dikirim ke +6289876543210: "Keluhan Anda sedang diproses."</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-slate-50 pb-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold text-slate-700">Notifikasi Unit Terkait</span>
                      <span className="text-[9px] font-medium text-slate-400">Kemarin</span>
                    </div>
                    <span className="text-[10px] text-slate-500 line-clamp-2">Pesan berhasil dikirim ke +6281122334455: "Mohon segera tindak lanjuti laporan..."</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-500">
                WhatsApp Bot aktif dan siap mengirimkan notifikasi.
              </p>
            </div>
            
            <button onClick={handleWaDisconnect} disabled={isWaLoading} className="h-11 px-6 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50">
              {isWaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              <span>Disconnect Bot</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
