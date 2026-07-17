import { useState, useEffect } from "react";
import { DashboardStats, RecentActivity, DashboardNotification } from "@/types/dashboard";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "sonner";

export function useDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const { apiClient } = await import("@/lib/api");
      
      // 1. Fetch real stats
      const statsRes = await apiClient.stats.getStats();
      setStats(statsRes);

      // 2. Fetch recent complaints to display as activities
      try {
        const complaintsRes = await apiClient.complaints.getAll({ limit: 5 });
        const list = Array.isArray(complaintsRes) ? complaintsRes : [];
        const mappedActivities: RecentActivity[] = list.map((c) => ({
          id: `act-${c.id}`,
          type: "COMPLAINT_SUBMIT",
          title: "Aspirasi Baru Diajukan",
          description: `"${c.title}" diajukan oleh ${c.isAnonymous ? "Anonim" : (c.reporter?.name || "Warga")}`,
          complaintId: c.id,
          createdAt: c.createdAt,
        }));
        setActivities(mappedActivities);
      } catch (err) {
        console.error("Failed to load activities:", err);
        setActivities([]);
      }

      // 3. Fetch notifications
      try {
        const notifs = await apiClient.notifications.getAll();
        setNotifications(notifs);
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setNotifications([]);
      }

    } catch (err) {
      console.error("Dashboard data fetching failed:", err);
      // Clean states on failure
      setStats({
        activeCount: 0,
        resolvedCount: 0,
        pendingCount: 0,
        totalCount: 0,
        unreadNotifications: 0,
        resolutionRate: 0,
      });
      setActivities([]);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const { apiClient } = await import("@/lib/api");
      const unreadNotifs = notifications.filter((n) => !n.isRead);
      for (const n of unreadNotifs) {
        await apiClient.notifications.markAsRead(n.id);
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setStats((prev) => (prev ? { ...prev, unreadNotifications: 0 } : null));
      toast.success("Semua notifikasi ditandai telah dibaca");
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      toast.error("Gagal menandai notifikasi");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { apiClient } = await import("@/lib/api");
      await apiClient.notifications.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setStats((prev) =>
        prev
          ? {
              ...prev,
              unreadNotifications: Math.max(0, prev.unreadNotifications - 1),
            }
          : null
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return {
    stats,
    activities,
    notifications,
    isLoading,
    fetchDashboardData,
    markAllNotificationsAsRead,
    markAsRead,
  };
}

export default useDashboard;
