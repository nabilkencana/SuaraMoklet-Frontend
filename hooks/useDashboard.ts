import { useState, useEffect } from "react";
import { DashboardStats, RecentActivity, DashboardNotification } from "@/types/dashboard";
import { useAuthStore } from "@/app/store/auth.store";
import { toast } from "sonner";

// Stable mock data outside hook to persist across renders/HMR
const MOCK_STATS: DashboardStats = {
  activeCount: 3,
  resolvedCount: 12,
  pendingCount: 1,
  totalCount: 16,
  unreadNotifications: 2,
  resolutionRate: 75,
};

const MOCK_ACTIVITIES: RecentActivity[] = [
  {
    id: "act-1",
    type: "STATUS_CHANGE",
    title: "Status Keluhan Diperbarui",
    description: "Keluhan 'AC Kelas XI-RPL 2 Tidak Berfungsi' kini berstatus PROSES (Unit Sarpras).",
    complaintId: "demo-001",
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: "act-2",
    type: "COMMENT_ADD",
    title: "Balasan Baru dari PIC",
    description: "PIC Kesiswaan memberikan tanggapan pada keluhan 'Jadwal Ekskul Basket Bentrok'.",
    complaintId: "demo-002",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "act-3",
    type: "STATUS_CHANGE",
    title: "Keluhan Terselesaikan",
    description: "Keluhan 'Keran Air Toilet Gedung C Bocor' telah ditandai SELESAI.",
    complaintId: "demo-003",
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // 3 days ago
  },
];

const MOCK_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: "notif-1",
    title: "AC Lab RPL 2 Diperiksa",
    description: "Teknisi dari Unit Sarpras menjadwalkan pengecekan keluhan AC Lab Anda besok pagi.",
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    complaintId: "demo-001",
  },
  {
    id: "notif-2",
    title: "Update Jadwal Basket",
    description: "Jadwal ekskul basket dipindahkan ke hari Kamis. Silakan periksa detail tanggapan.",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    complaintId: "demo-002",
  },
  {
    id: "notif-3",
    title: "Selamat Bergabung!",
    description: "Akun Anda telah berhasil diverifikasi. Selamat menyuarakan aspirasi Anda di SuaraMoklet.",
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), // 5 days ago
  },
];

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
      
      // Try fetching real dashboard stats
      const statsRes = await apiClient.stats.getStats();
      setStats(statsRes);
    } catch {
      // Fallback to Mock Stats
      setStats(MOCK_STATS);
    }

    try {
      // Mock other details for now until API is implemented
      await new Promise((r) => setTimeout(r, 600));
      setActivities(MOCK_ACTIVITIES);
      setNotifications(MOCK_NOTIFICATIONS);
    } catch (error) {
      console.error("Dashboard fetching error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setStats((prev) => (prev ? { ...prev, unreadNotifications: 0 } : null));
    toast.success("Semua notifikasi ditandai telah dibaca");
  };

  const markAsRead = (id: string) => {
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
