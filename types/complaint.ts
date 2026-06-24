export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "WAITING_USER" | "CLOSED";

export type ComplaintUnit =
  | "Umum (ISO)"
  | "Sarpras"
  | "Kurikulum"
  | "Kesiswaan"
  | "Hubin"
  | "Tata Usaha";

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  status?: ComplaintStatus;
  createdAt: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  expectedOutput?: string;
  unit: ComplaintUnit;
  status: ComplaintStatus;
  isAnonymous: boolean;
  evidenceUrl?: string; // Main image or attachment
  createdAt: string;
  supports: number;
  targetSupports?: number; // target count e.g. 500
  isSupported?: boolean;   // supported status by the current user
  reporter?: {
    id: string;
    name: string;
    avatarUrl?: string;
  } | null;
  timeline?: TimelineEvent[];
}

export interface CreateComplaintRequest {
  title: string;
  description: string;
  expectedOutput?: string;
  unit: ComplaintUnit;
  evidenceUrl?: string;
  isAnonymous: boolean;
}
