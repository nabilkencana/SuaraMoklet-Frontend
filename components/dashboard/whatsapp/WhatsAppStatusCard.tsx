import React from "react";
import {
  Loader2,
  QrCode,
  Smartphone,
  Bot,
  Zap,
  CheckCircle,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { WaConnectionStatus } from "./types";

interface WhatsAppStatusCardProps {
  waStatus: WaConnectionStatus;
  isWaLoading: boolean;
  waQrCode: string;
  waQrExpiresIn: number;
  waQrExpired: boolean;
  waUser: any;
  runtimeStr: string;
  onInit: () => void;
  onCancel: () => void;
  onDisconnect: () => void;
}

export default function WhatsAppStatusCard({
  waStatus,
  isWaLoading,
  waQrCode,
  waQrExpiresIn,
  waQrExpired,
  waUser,
  runtimeStr,
  onInit,
  onCancel,
  onDisconnect,
}: WhatsAppStatusCardProps) {
  if (waStatus === "offline") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-2">
          <Bot className="h-10 w-10 text-slate-400" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h3 className="text-lg font-bold text-slate-800">Status: OFFLINE</h3>
          <p className="text-sm text-slate-500">
            Layanan WhatsApp saat ini sedang tidak tersedia atau dalam masa pemeliharaan. Silakan
            hubungi tim dukungan teknis untuk bantuan lebih lanjut.
          </p>
        </div>
      </div>
    );
  }

  if (waStatus === "disconnected") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-2">
          <Smartphone className="h-10 w-10 text-blue-500" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h3 className="text-lg font-bold text-slate-800">Status: DISCONNECTED</h3>
          <p className="text-sm text-slate-500">
            Sistem WhatsApp Bot belum terhubung ke sesi aktif. Silakan mulai inisialisasi untuk
            menghubungkan perangkat Anda.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onInit}
            disabled={isWaLoading}
            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isWaLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <QrCode className="h-5 w-5" />
            )}
            <span>Dapatkan QR</span>
          </button>
        </div>
      </div>
    );
  }

  if (waStatus === "connecting") {
    return (
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
            {!waQrCode
              ? "Menyiapkan QR Code dari server..."
              : "Scan QR Code di bawah dengan aplikasi WhatsApp Anda"}
          </p>
        </div>

        {waQrCode && !waQrExpired && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
            <button
              onClick={onInit}
              disabled={isWaLoading}
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isWaLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="h-4 w-4" />
              )}
              <span>Get QR Ulang</span>
            </button>
          ) : (
            <button
              onClick={onCancel}
              disabled={isWaLoading}
              className="h-11 px-6 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>Batal</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Online Header
  return (
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
            <span className="font-semibold">
              Nomor: {waUser?.id?.split(":")[0] || waUser?.id || "-"}
            </span>
            <span className="hidden md:inline">•</span>
            <span className="font-semibold text-blue-600">Runtime: {runtimeStr}</span>
          </div>
        </div>
      </div>
      <button
        onClick={onDisconnect}
        disabled={isWaLoading}
        className="h-11 px-6 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
      >
        {isWaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
        <span>Disconnect Bot</span>
      </button>
    </div>
  );
}
