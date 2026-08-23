import { User } from "./auth";

export interface Comment {
  id: string;
  complaintId: string;
  content: string;
  evidenceUrl?: string;
  createdAt: string;
  user: User;
  isPic: boolean;
  parentId?: string;
  parent?: Comment;
  replies?: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  evidenceUrl?: string;
  parentId?: string;
}
