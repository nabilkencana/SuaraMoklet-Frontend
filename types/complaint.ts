export type ComplaintStatus = "NEW" | "WAITING_RESPONSE" | "WAITING_USER" | "IN_PROGRESS" | "CLOSED" | "OPEN";

export type ComplaintUnit =
  | "Umum (ISO)"
  | "Sarpras"
  | "Kurikulum"
  | "Kesiswaan"
  | "Hubin"
  | "Tata Usaha";

export interface UnitModel {
  id: string;
  name: string;
  description?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  status?: ComplaintStatus;
  createdAt: string;
}

export type ComplaintVisibility = "PUBLIC" | "PRIVATE";

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
  visibility?: ComplaintVisibility;
  category?: string;
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
