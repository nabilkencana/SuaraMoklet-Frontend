import React, { useState } from "react";
import { Bell, Check, Menu, MessageSquare, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { useDashboard } from "@/hooks/useDashboard";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

export default function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  const { user } = useAuthStore();
  const { stats, notifications, markAsRead, markAllNotificationsAsRead } = useDashboard();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = stats?.unreadNotifications ?? 0;

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAFA]/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      {/* Welcome / Greeting Section */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Menu className="h-5 w-5 text-slate-650" />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight truncate">
            Welcome back, {user?.name || "Warga Moklet"}
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-450 font-medium hidden sm:block truncate">
            "Your voice drives the excellence of our institution."
          </p>
        </div>
      </div>

      {/* Right Side Tools */}
      <div className="flex items-center gap-3 shrink-0 relative">
        {/* Notification Bell Trigger */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50/20 hover:text-red-600 transition-all shadow-sm cursor-pointer relative ${
            showNotifications ? "border-red-300 text-red-600 bg-red-50/10" : "text-slate-500"
          }`}
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4.5 min-w-4.5 px-1 bg-red-650 text-white rounded-full flex items-center justify-center text-[9px] font-extrabold border border-white animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown Card */}
        {showNotifications && (
          <>
            {/* Backdrop click capture */}
            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
            
            <div className="absolute right-0 top-11 z-50 w-[300px] sm:w-[350px] bg-white border border-slate-200 rounded-2xl shadow-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-bold text-slate-800">Notifikasi</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[10px] font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    BACA SEMUA
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="max-h-[260px] overflow-y-auto space-y-2.5 pr-1 select-none">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                    Tidak ada notifikasi baru.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.complaintId) {
                          window.location.href = `/complaints/${notif.complaintId}`;
                        }
                      }}
                      className={`p-3 rounded-xl border border-slate-100/80 transition-all duration-200 cursor-pointer flex gap-3 text-left ${
                        notif.isRead
                          ? "bg-white opacity-70 hover:bg-slate-50/50"
                          : "bg-red-50/40 border-red-100/50 hover:bg-red-50/70"
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center ${
                        notif.isRead ? "bg-slate-100 text-slate-450" : "bg-red-100/80 text-red-600"
                      }`}>
                        {notif.complaintId ? <MessageSquare className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className={`text-xs truncate ${notif.isRead ? "font-semibold text-slate-700" : "font-bold text-slate-800"}`}>
                          {notif.title}
                        </p>
                        <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed">
                          {notif.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* User profile avatar or initials circle */}
        <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-extrabold text-slate-600 text-xs uppercase shadow-sm overflow-hidden select-none">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.name} 
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{user?.name?.charAt(0) || "W"}</span>
          )}
        </div>
      </div>
    </header>
  );
}
