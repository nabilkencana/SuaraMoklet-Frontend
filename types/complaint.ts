export type ComplaintStatus = "NEW" | "OPEN" | "DONE";

export type ComplaintUnit =
  | "Umum"
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
  handlingPlan?: string;
  resolution?: string;
  category?: string;
  reporter?: {
    id: string;
    name: string;
    avatarUrl?: string;
  } | null;
  timeline?: TimelineEvent[];
  rating?: {
    score: number;
    note?: string;
    createdAt: string;
  };
}

export interface CreateComplaintRequest {
  title: string;
  description: string;
  expectedOutput?: string;
  unit: ComplaintUnit;
  evidenceUrl?: string;
  isAnonymous: boolean;
}
