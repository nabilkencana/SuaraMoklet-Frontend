"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, Loader2, MessageSquare, Info } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { DashboardNotification } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export default function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.notifications.getAll({ limit: 10 });
      setNotifications(data);
    } catch (err) {
      console.error("Gagal mengambil notifikasi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Close dropdown on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.notifications.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      toast.error("Gagal memperbarui notifikasi");
    }
  };

  const handleMarkAllRead = async () => {
    const unreadList = notifications.filter((n) => !n.isRead);
    if (unreadList.length === 0) return;

    try {
      await Promise.all(unreadList.map((n) => apiClient.notifications.markAsRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("Semua notifikasi ditandai dibaca");
    } catch (err) {
      toast.error("Gagal memperbarui notifikasi");
    }
  };

  const handleNotificationClick = async (notification: DashboardNotification) => {
    if (!notification.isRead) {
      try {
        await apiClient.notifications.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        // Continue navigation regardless
      }
    }
    setIsOpen(false);
    if (notification.complaintId) {
      router.push(`/complaints/${notification.complaintId}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) fetchNotifications();
        }}
        className={cn(
          "relative h-9 w-9 rounded-full flex items-center justify-center transition-all cursor-pointer select-none",
          isOpen
            ? "bg-red-50 text-red-600 border border-red-200"
            : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 border border-slate-200/60"
        )}
        aria-label="Notifikasi"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white animate-in zoom-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-red-600" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Notifikasi
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                  {unreadCount} baru
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tandai semua
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-red-500" />
                <p className="text-xs font-semibold">Memuat notifikasi...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    "p-3.5 flex items-start gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer group relative",
                    !n.isRead && "bg-red-50/20"
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                      n.isRead
                        ? "bg-slate-100 text-slate-500"
                        : "bg-red-100 text-red-600 font-bold"
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-xs leading-snug truncate",
                          n.isRead ? "font-semibold text-slate-700" : "font-extrabold text-slate-900"
                        )}
                      >
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(n.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {n.description}
                    </p>
                  </div>

                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      title="Tandai dibaca"
                      className="text-slate-300 hover:text-slate-600 p-1 rounded-md transition-colors shrink-0"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              /* Empty Notification State */
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Info className="h-7 w-7 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">Belum ada notifikasi</p>
                <p className="text-[11px] text-slate-400">Pemberitahuan aktivitas akan muncul di sini.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
