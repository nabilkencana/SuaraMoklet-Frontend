import { User } from "./auth";

export interface Comment {
  id: string;
  complaintId: string;
  content: string;
  evidenceUrl?: string;
  createdAt: string;
  user: User;
  isPic: boolean;
}

export interface CreateCommentRequest {
  content: string;
  evidenceUrl?: string;
}
