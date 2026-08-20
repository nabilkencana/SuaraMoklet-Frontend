import React from "react";
import { Loader2, Send, RefreshCw, LogOut } from "lucide-react";

interface WhatsAppTestCardProps {
  testNumber: string;
  testMessage: string;
  isTestSending: boolean;
  isResending: boolean;
  isDisconnectModalOpen: boolean;
  isResendModalOpen: boolean;
  onTestNumberChange: (num: string) => void;
  onTestMessageChange: (msg: string) => void;
  onTestSend: (e: React.FormEvent) => void;
  onOpenResendModal: () => void;
  onCloseResendModal: () => void;
  onConfirmResend: () => void;
  onCloseDisconnectModal: () => void;
  onConfirmDisconnect: () => void;
}

export default function WhatsAppTestCard({
  testNumber,
  testMessage,
  isTestSending,
  isResending,
  isDisconnectModalOpen,
  isResendModalOpen,
  onTestNumberChange,
  onTestMessageChange,
  onTestSend,
  onOpenResendModal,
  onCloseResendModal,
  onConfirmResend,
  onCloseDisconnectModal,
  onConfirmDisconnect,
}: WhatsAppTestCardProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Testing Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Testing Pengiriman
            </h4>
          </div>
          <form onSubmit={onTestSend} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nomor Tujuan (WhatsApp)
              </label>
              <input
                type="text"
                required
                placeholder="08xxxxxxxxxx atau 628xxxxxxxxxx"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={testNumber}
                onChange={(e) => onTestNumberChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Isi Pesan</label>
              <textarea
                required
                placeholder="Ketik pesan percobaan di sini..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-25"
                value={testMessage}
                onChange={(e) => onTestMessageChange(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isTestSending}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isTestSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Kirim Pesan</span>
            </button>
          </form>
        </div>

        {/* Utility Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-slate-800">Utilitas &amp; Maintenance</h4>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex-1 flex flex-col justify-between">
            <div>
              <h5 className="font-bold text-orange-800 text-sm mb-2">Kirim Ulang Pesan Gagal</h5>
              <p className="text-xs text-orange-700 mb-4 leading-relaxed">
                Jika terdapat banyak log pesan dengan status &ldquo;Gagal&rdquo; (misalnya karena bot
                sempat offline atau koneksi terputus), Anda dapat mencoba mengirimkan ulang semua
                pesan tersebut ke antrean.
              </p>
            </div>
            <button
              onClick={onOpenResendModal}
              disabled={isResending}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isResending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>Kirim Ulang Semua Pesan Gagal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Disconnect Modal */}
      {isDisconnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCloseDisconnectModal}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-xl border border-slate-100 p-6 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <LogOut className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Putus Koneksi Bot?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Bot WhatsApp akan logout dan tidak bisa mengirim pesan secara otomatis sampai Anda
              menghubungkannya kembali dengan QR Code baru.
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={onCloseDisconnectModal}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={onConfirmDisconnect}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Ya, Putuskan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resend Modal */}
      {isResendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCloseResendModal}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-xl border border-slate-100 p-6 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Kirim Ulang Pesan Gagal?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Sistem akan memproses ulang pengiriman untuk semua pesan yang berstatus gagal.
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={onCloseResendModal}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={onConfirmResend}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Kirim Ulang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
