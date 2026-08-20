import { Complaint, ComplaintUnit, UnitModel } from "@/types/complaint";

export type AdminTab =
  | "dashboard"
  | "complaints"
  | "units"
  | "members"
  | "whatsapp"
  | "audit_logs";

export interface UnitMember {
  id: string;
  name: string;
  email: string;
  role: string;
  unitId: string;
  unitName: string;
  isPic: boolean;
  initials: string;
  userType?: string;
  isActive?: boolean;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone_number: string;
  role: string;
  unitName: string;
  status: string;
  memberId: string;
  originalRole: string;
  originalUserType: string;
  userType: string;
  isActive: boolean;
}

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}
