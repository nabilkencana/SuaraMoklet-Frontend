"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

// WhatsApp Submodules
import { WaConnectionStatus, WhatsAppLog, WhatsAppTemplate } from "./whatsapp/types";
import WhatsAppStatusCard from "./whatsapp/WhatsAppStatusCard";
import WhatsAppLogsCard from "./whatsapp/WhatsAppLogsCard";
import WhatsAppTemplatesCard from "./whatsapp/WhatsAppTemplatesCard";
import WhatsAppTestCard from "./whatsapp/WhatsAppTestCard";

interface WhatsAppManagerProps {
  isActive: boolean;
}

export default function WhatsAppManager({ isActive }: WhatsAppManagerProps) {
  const [waStatus, setWaStatus] = useState<WaConnectionStatus>("offline");
  const [isWaLoading, setIsWaLoading] = useState(false);
  const [waQrCode, setWaQrCode] = useState<string>("");
  const [waQrExpiresIn, setWaQrExpiresIn] = useState<number>(0);
  const [waUser, setWaUser] = useState<any>(null);
  const [waQrExpired, setWaQrExpired] = useState(false);
  const [waConnectedAt, setWaConnectedAt] = useState<number | null>(null);
  const [runtimeStr, setRuntimeStr] = useState<string>("-");

  // Logs State
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logSearch, setLogSearch] = useState("");
  const [logStatusFilter, setLogStatusFilter] = useState("");

  // Templates State
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Testing State
  const [testNumber, setTestNumber] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [isTestSending, setIsTestSending] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Modal States
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
  const [isResendModalOpen, setIsResendModalOpen] = useState(false);

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
        } catch {
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
      }, 10000);
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
    } catch {
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
        search: logSearch,
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
    } catch {
      toast.error("Gagal membatalkan proses");
    } finally {
      setIsWaLoading(false);
    }
  };

  const confirmDisconnect = async () => {
    setIsDisconnectModalOpen(false);
    setIsWaLoading(true);
    try {
      await apiClient.whatsapp.disconnect();
      toast.success("Bot terputus");
      setWaQrCode("");
      setWaUser(null);
      setWaStatus("disconnected");
    } catch {
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
    } catch {
      toast.error("Gagal menyimpan template");
    }
  };

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testNumber.match(/^(08|628)\d{7,12}$/)) {
      toast.error("Format nomor tidak valid (Gunakan 08x atau 628x)");
      return;
    }
    if (!testMessage.trim()) {
      toast.error("Pesan tidak boleh kosong");
      return;
    }
    setIsTestSending(true);
    try {
      await apiClient.whatsapp.testSend({ to: testNumber, message: testMessage });
      toast.success("Pesan percobaan terkirim!");
      setTestMessage("");
      fetchLogs(1, false);
    } catch {
      toast.error("Gagal mengirim pesan percobaan");
    } finally {
      setIsTestSending(false);
    }
  };

  const confirmResendFailed = async () => {
    setIsResendModalOpen(false);
    setIsResending(true);
    try {
      await apiClient.whatsapp.resendFailed();
      toast.success("Permintaan kirim ulang berhasil dijalankan");
      fetchLogs(1, false);
    } catch {
      toast.error("Gagal melakukan kirim ulang");
    } finally {
      setIsResending(false);
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

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
        <WhatsAppStatusCard
          waStatus={waStatus}
          isWaLoading={isWaLoading}
          waQrCode={waQrCode}
          waQrExpiresIn={waQrExpiresIn}
          waQrExpired={waQrExpired}
          waUser={waUser}
          runtimeStr={runtimeStr}
          onInit={handleWaInit}
          onCancel={handleWaCancel}
          onDisconnect={() => setIsDisconnectModalOpen(true)}
        />

        {waStatus === "online" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <WhatsAppLogsCard
                logs={logs}
                isLogsLoading={isLogsLoading}
                logPage={logPage}
                logTotalPages={logTotalPages}
                logSearch={logSearch}
                logStatusFilter={logStatusFilter}
                onSearchChange={setLogSearch}
                onStatusFilterChange={(st) => {
                  setLogStatusFilter(st);
                  setLogPage(1);
                }}
                onSearchSubmit={(e) => {
                  e.preventDefault();
                  setLogPage(1);
                  fetchLogs(1);
                }}
                onRefresh={() => fetchLogs(logPage)}
                onPageChange={setLogPage}
              />

              <WhatsAppTemplatesCard
                templates={templates}
                isTemplatesLoading={isTemplatesLoading}
                editingTemplate={editingTemplate}
                editContent={editContent}
                onRefresh={fetchTemplates}
                onStartEdit={(name, content) => {
                  setEditingTemplate(name);
                  setEditContent(content);
                }}
                onCancelEdit={() => setEditingTemplate(null)}
                onContentChange={setEditContent}
                onSaveTemplate={handleSaveTemplate}
              />
            </div>

            <WhatsAppTestCard
              testNumber={testNumber}
              testMessage={testMessage}
              isTestSending={isTestSending}
              isResending={isResending}
              isDisconnectModalOpen={isDisconnectModalOpen}
              isResendModalOpen={isResendModalOpen}
              onTestNumberChange={setTestNumber}
              onTestMessageChange={setTestMessage}
              onTestSend={handleTestSend}
              onOpenResendModal={() => setIsResendModalOpen(true)}
              onCloseResendModal={() => setIsResendModalOpen(false)}
              onConfirmResend={confirmResendFailed}
              onCloseDisconnectModal={() => setIsDisconnectModalOpen(false)}
              onConfirmDisconnect={confirmDisconnect}
            />
          </>
        )}
      </div>
    </div>
  );
}
