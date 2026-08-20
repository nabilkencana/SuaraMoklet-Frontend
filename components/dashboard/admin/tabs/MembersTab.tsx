import React from "react";
import {
  Download,
  Upload,
  UserPlus,
  Search,
  Sliders,
  Eye,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminUserRow } from "../types";
import TablePagination from "../TablePagination";
import { toast } from "sonner";

interface MembersTabProps {
  userSearchQuery: string;
  setUserSearchQuery: (query: string) => void;
  userRoleFilter: string;
  setUserRoleFilter: (role: string) => void;
  userStatusFilter: string;
  setUserStatusFilter: (status: string) => void;
  paginatedUsers: AdminUserRow[];
  filteredUsers: AdminUserRow[];
  userPage: number;
  totalUserPages: number;
  userPageSize: number;
  setUserPage: (page: number) => void;
  onOpenImportModal: () => void;
  onExportUsers: () => void;
  onOpenCreateUser: () => void;
  onOpenEditUser: (user: AdminUserRow) => void;
  onViewUser: (user: AdminUserRow) => void;
  onRestoreUser: (id: string, name: string) => void;
  onDeleteUser: (id: string, name: string) => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export default function MembersTab({
  userSearchQuery,
  setUserSearchQuery,
  userRoleFilter,
  setUserRoleFilter,
  userStatusFilter,
  setUserStatusFilter,
  paginatedUsers,
  filteredUsers,
  userPage,
  totalUserPages,
  userPageSize,
  setUserPage,
  onOpenImportModal,
  onExportUsers,
  onOpenCreateUser,
  onOpenEditUser,
  onViewUser,
  onRestoreUser,
  onDeleteUser,
}: MembersTabProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Pengelolaan Pengguna
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Atur peran, unit, dan akses untuk semua pengguna platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenImportModal}
            className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Import</span>
          </button>
          <button
            onClick={onExportUsers}
            className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Upload className="h-4 w-4 text-slate-500" />
            <span>Export</span>
          </button>

          <button
            onClick={onOpenCreateUser}
            className="h-10 px-4 bg-[#b61722] hover:bg-red-650 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4 text-white" />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Row */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:max-w-xs group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 text-xs rounded-xl border border-slate-250 bg-white focus:outline-none focus:border-red-400 transition-all font-medium"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-650 outline-none focus:border-red-500 cursor-pointer select-none transition-all"
          >
            <option value="All">Semua Role</option>
            <option value="Siswa">Siswa</option>
            <option value="Guru">Guru</option>
            <option value="Orangtua">Orangtua</option>
            <option value="PIC Unit">PIC Unit</option>
            <option value="Anggota Unit">Anggota Unit</option>
          </select>

          <select
            value={userStatusFilter}
            onChange={(e) => setUserStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-650 outline-none focus:border-red-500 cursor-pointer select-none transition-all"
          >
            <option value="All">Semua Status</option>
            <option value="Active">Aktif</option>
            <option value="Inactive">Tidak Aktif</option>
          </select>

          <button
            onClick={() => toast.info("Filter Lanjutan Aktif")}
            className="h-10 px-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-655 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sliders className="h-4 w-4" />
            <span>Filter Lainnya</span>
          </button>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="text-slate-450 font-bold text-xs uppercase border-b border-slate-100 pb-4">
                <th className="pb-4 pl-2 font-semibold">Nama Pengguna</th>
                <th className="pb-4 font-semibold">Info Kontak</th>
                <th className="pb-4 font-semibold">Role &amp; Unit</th>
                <th className="pb-4 font-semibold">Status</th>
                <th className="pb-4 text-right pr-2 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.map((u) => {
                const initials = getInitials(u.name);
                const isPicUnit = u.role.includes("PIC");
                const isTeacher = u.role.includes("Guru");

                return (
                  <tr
                    key={u.id}
                    className="text-slate-700 text-sm hover:bg-slate-50/50 transition-all align-middle"
                  >
                    {/* User Name & ID */}
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="space-y-0.5">
                          <span className="block font-bold text-slate-800 leading-snug">
                            {u.name}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            ID: {u.memberId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4">
                      <div className="space-y-0.5 font-medium">
                        <span className="block text-xs text-slate-500">{u.email}</span>
                        <span className="block text-[10px] text-slate-400">{u.phone}</span>
                      </div>
                    </td>

                    {/* Role & Unit */}
                    <td className="py-4">
                      <div className="space-y-0.5">
                        <span className="block text-xs font-bold text-slate-800">{u.role}</span>
                        <span
                          className={cn(
                            "block text-[10px] font-bold uppercase tracking-wider",
                            isPicUnit || isTeacher ? "text-[#b61722]" : "text-slate-400"
                          )}
                        >
                          {u.unitName}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          u.status === "Active"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 text-right pr-2">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => onViewUser(u)}
                          className="h-8 w-8 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                          title="View Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onOpenEditUser(u)}
                          className="h-8 w-8 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                          title="Edit User"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {u.status === "Inactive" ? (
                          <button
                            onClick={() => onRestoreUser(u.id, u.name)}
                            className="h-8 w-8 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                            title="Aktifkan User"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onDeleteUser(u.id, u.name)}
                            className="h-8 w-8 text-slate-400 hover:text-red-655 hover:bg-red-50 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                            title="Nonaktifkan User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <TablePagination
          currentPage={userPage}
          totalPages={totalUserPages}
          totalItems={filteredUsers.length}
          itemsPerPage={userPageSize}
          onPageChange={setUserPage}
          itemName="pengguna"
        />
      </div>
    </div>
  );
}
