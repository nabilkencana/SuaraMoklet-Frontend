export interface DashboardStats {
  activeCount: number;
  resolvedCount: number;
  pendingCount: number;
  totalCount: number;
  unreadNotifications: number;
  resolutionRate: number; // percentage of complaints resolved e.g. 75
  averageRating?: number;
  newCount?: number;
  byUnit?: Array<{
    unitId: string;
    unitName: string;
    totalComplaints: number;
    averageRating: number;
  }>;
}

export interface RecentActivity {
  id: string;
  type: "STATUS_CHANGE" | "COMMENT_ADD" | "PIC_ASSIGN" | "COMPLAINT_SUBMIT";
  title: string;
  description: string;
  complaintId: string;
  createdAt: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}
