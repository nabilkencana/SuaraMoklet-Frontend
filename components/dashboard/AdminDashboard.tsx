"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/auth.store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient, mapBackendUnitToFrontend } from "@/lib/api";
import { Complaint, ComplaintUnit, UnitModel } from "@/types/complaint";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import WhatsAppManager from "@/components/dashboard/WhatsAppManager";
import AuditLogsManager from "@/components/dashboard/AuditLogsManager";

// Admin Submodules
import { AdminTab, UnitMember, AdminUserRow } from "./admin/types";
import OverviewTab from "./admin/tabs/OverviewTab";
import ComplaintsTab from "./admin/tabs/ComplaintsTab";
import UnitsTab from "./admin/tabs/UnitsTab";
import MembersTab from "./admin/tabs/MembersTab";

// Admin Modals
import ForwardComplaintModal from "./admin/modals/ForwardComplaintModal";
import CreateUnitModal from "./admin/modals/CreateUnitModal";
import EditUnitModal from "./admin/modals/EditUnitModal";
import AddMemberModal from "./admin/modals/AddMemberModal";
import AutoCloseConfigModal from "./admin/modals/AutoCloseConfigModal";
import ImportUsersModal from "./admin/modals/ImportUsersModal";
import UserFormModal from "./admin/modals/UserFormModal";
import ViewUserModal from "./admin/modals/ViewUserModal";
import DetailComplaintModal from "./admin/modals/DetailComplaintModal";
import DeleteComplaintModal from "./admin/modals/DeleteComplaintModal";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminActiveTab") as AdminTab;
      if (
        saved &&
        ["dashboard", "complaints", "units", "members", "whatsapp", "audit_logs"].includes(saved)
      ) {
        return saved;
      }
    }
    return "dashboard";
  });

  // Global Data States
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [units, setUnits] = useState<UnitModel[]>([]);
  const [unitMembers, setUnitMembers] = useState<UnitMember[]>([]);
  const [allDbUsers, setAllDbUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Filter States
  const [tableTab, setTableTab] = useState<"ALL" | "NEW" | "OPEN" | "DONE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState("ALL");
  const [unitSearchQuery, setUnitSearchQuery] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [userStatusFilter, setUserStatusFilter] = useState("All");

  // Pagination States
  const [complaintPage, setComplaintPage] = useState(1);
  const complaintPageSize = 10;
  const [complaintsListPage, setComplaintsListPage] = useState(1);
  const complaintsListPageSize = 10;
  const [userPage, setUserPage] = useState(1);
  const userPageSize = 10;

  // Modal Visibility & Form States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedComplaintForForward, setSelectedComplaintForForward] = useState<Complaint | null>(null);
  const [forwardUnitId, setForwardUnitId] = useState("");
  const [forwardNote, setForwardNote] = useState("");

  const [isCreateUnitModalOpen, setIsCreateUnitModalOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitDesc, setNewUnitDesc] = useState("");

  const [isEditUnitModalOpen, setIsEditUnitModalOpen] = useState(false);
  const [editUnitName, setEditUnitName] = useState("");
  const [editUnitDesc, setEditUnitDesc] = useState("");

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedUnitForMember, setSelectedUnitForMember] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [memberIsPic, setMemberIsPic] = useState(false);

  const [isAutoCloseModalOpen, setIsAutoCloseModalOpen] = useState(false);
  const [autoCloseDays, setAutoCloseDays] = useState(7);
  const [isUpdatingAutoClose, setIsUpdatingAutoClose] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);

  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone_number: "",
    role: "USER",
    userType: "SISWA",
  });

  const [selectedUserForView, setSelectedUserForView] = useState<AdminUserRow | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalData, setDetailModalData] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [complaintIdToDelete, setComplaintIdToDelete] = useState<string | null>(null);

  // Sync activeTab with localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("adminActiveTab", activeTab);
    }
  }, [activeTab]);

  // Reset pagination on filter changes
  useEffect(() => {
    setComplaintPage(1);
    setComplaintsListPage(1);
  }, [tableTab, searchQuery, unitFilter]);

  useEffect(() => {
    setUserPage(1);
  }, [userSearchQuery, userRoleFilter, userStatusFilter]);

  // Fetch Data Function
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch units
      let loadedUnits: UnitModel[] = [];
      try {
        const raw = await apiClient.units.getAll();
        loadedUnits = Array.isArray(raw) ? raw : [];
      } catch (err) {
        console.error("Failed to fetch units:", err);
      }
      setUnits(loadedUnits);
      if (loadedUnits.length > 0) {
        setSelectedUnitForMember((prev) =>
          prev && loadedUnits.some((u) => u.id === prev) ? prev : loadedUnits[0].id
        );
        setForwardUnitId((prev) =>
          prev && loadedUnits.some((u) => u.id === prev) ? prev : loadedUnits[0].id
        );
        setSelectedUnitId((prev) =>
          prev && loadedUnits.some((u) => u.id === prev) ? prev : loadedUnits[0].id
        );
      }

      // 2. Fetch complaints
      let loadedComplaints: Complaint[] = [];
      try {
        const raw = await apiClient.complaints.getAll({ limit: 1000 });
        loadedComplaints = Array.isArray(raw) ? raw : [];
      } catch (err) {
        console.error("Failed to fetch complaints:", err);
      }
      setComplaints(loadedComplaints);

      // 3. Dynamic members from fetched units
      const dbMembers: any[] = [];
      loadedUnits.forEach((u: any) => {
        if (Array.isArray(u.members)) {
          u.members.forEach((m: any) => {
            if (m.user) {
              dbMembers.push({
                id: m.user.id,
                name: m.user.name,
                email: m.user.email,
                role: m.user.role,
                isPic: m.isPIC,
                unitId: u.id,
                unitName: u.name,
              });
            }
          });
        }
      });
      setUnitMembers(dbMembers);

      // 4. Fetch stats
      try {
        const statsData = await apiClient.stats.getStats();
        setStats(statsData);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }

      // 5. Fetch all users
      try {
        const usersData = await apiClient.users.getAll();
        setAllDbUsers(Array.isArray(usersData) ? usersData : []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }

      // 6. Fetch auto-close config
      try {
        const configData = await apiClient.complaints.getAutoCloseConfig();
        if (configData && configData.daysToClose) setAutoCloseDays(configData.daysToClose);
      } catch (err) {}

      // 7. Fetch audit logs
      try {
        const auditData = await apiClient.auditLogs.getAll({ limit: 5 });
        setAuditLogs(auditData?.data || []);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
      }
    } catch (e) {
      toast.error("Gagal Memuat Data");
    } finally {
      setIsLoading(false);
    }
  };

  // Mount
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Auth Guard
  useEffect(() => {
    if (mounted && (!isAuthenticated || (user?.role !== "SUPERADMIN" && user?.role !== "SUPER_PIC"))) {
      router.replace("/complaints");
    }
  }, [mounted, isAuthenticated, user, router]);

  // Load data on mount / tab change
  useEffect(() => {
    if (mounted && isAuthenticated && (user?.role === "SUPERADMIN" || user?.role === "SUPER_PIC")) {
      const timer = setTimeout(() => {
        fetchData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [mounted, isAuthenticated, user, activeTab]);

  // Handler: Toggle Visibility
  const handleToggleVisibility = async (id: string, current: string) => {
    const nextVisibility = current === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    try {
      await apiClient.complaints.updateVisibility(id, nextVisibility);
      toast.success("Visibilitas Diperbarui", {
        description: `Keluhan kini disetel menjadi ${nextVisibility}.`,
      });
      fetchData();
    } catch (err: any) {
      toast.error("Gagal Memperbarui Visibilitas", {
        description: err?.response?.data?.message || "Terjadi kesalahan pada server",
      });
    }
  };

  // Handler: Create Unit
  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.units.create({ name: newUnitName.trim(), description: newUnitDesc });
      toast.success("Unit Baru Berhasil Dibuat");
      setNewUnitName("");
      setNewUnitDesc("");
      setIsCreateUnitModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Gagal Membuat Unit", {
        description: err?.response?.data?.message || "Terjadi kesalahan pada server",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Update Unit
  const handleUpdateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUnitName.trim() || !selectedUnitId) return;

    setIsSubmitting(true);
    try {
      await apiClient.units.update(selectedUnitId, { name: editUnitName.trim(), description: editUnitDesc });
      toast.success("Data Unit Berhasil Diperbarui");
      setIsEditUnitModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Gagal Memperbarui Unit", {
        description: err?.response?.data?.message || "Terjadi kesalahan pada server",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Delete Unit
  const handleDeleteUnit = async (id: string) => {
    try {
      await apiClient.units.delete(id);
      toast.success("Unit Berhasil Dihapus");
      fetchData();
    } catch (err: any) {
      toast.error("Gagal Menghapus Unit", {
        description: err?.response?.data?.message || "Terjadi kesalahan",
      });
    }
  };

  // Handler: Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.units.addMember(selectedUnitForMember, {
        email: newMemberEmail,
        isPic: memberIsPic,
      });
      toast.success("Anggota berhasil ditambahkan ke unit");
      setNewMemberEmail("");
      setIsAddMemberModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Gagal Menambah Anggota", {
        description: err?.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Remove Member
  const handleRemoveMember = (memberId: string, unitId: string) => {
    toast.error("Hapus Anggota", {
      description: "Apakah Anda yakin ingin menghapus anggota ini dari unit?",
      action: {
        label: "Hapus",
        onClick: async () => {
          try {
            await apiClient.units.removeMember(unitId, memberId);
            toast.success("Anggota Berhasil Dihapus");
            fetchData();
          } catch (err: any) {
            toast.error("Gagal Menghapus Anggota", {
              description: err?.response?.data?.message || "Terjadi kesalahan",
            });
          }
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
    });
  };

  // Handler: Auto-Close Save
  const handleSaveAutoCloseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (autoCloseDays < 1) {
      toast.error("Jumlah hari minimal 1 hari");
      return;
    }

    setIsUpdatingAutoClose(true);
    try {
      await apiClient.complaints.updateAutoCloseConfig(autoCloseDays);
      toast.success(`Konfigurasi auto-close diperbarui (${autoCloseDays} hari)`);
      setIsAutoCloseModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memperbarui konfigurasi auto-close");
    } finally {
      setIsUpdatingAutoClose(false);
    }
  };

  // Handler: Forward Complaint
  const handleForwardComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintForForward) return;

    try {
      await apiClient.complaints.forward(selectedComplaintForForward.id, {
        toUnitId: forwardUnitId,
        forwardNote: forwardNote,
      });
      toast.success("Keluhan berhasil didelegasikan");
      setSelectedComplaintForForward(null);
      setForwardNote("");
      fetchData();
    } catch (err) {
      const targetUnit = units.find((u) => u.id === forwardUnitId);
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === selectedComplaintForForward.id
            ? { ...c, unit: (targetUnit?.name || "Sarpras") as ComplaintUnit, status: "OPEN" }
            : c
        )
      );
      toast.success("Keluhan didelegasikan");
      setSelectedComplaintForForward(null);
      setForwardNote("");
    }
  };

  // Handler: Delete Complaint Confirmation
  const confirmDeleteComplaint = async () => {
    if (!complaintIdToDelete) return;
    setIsSubmitting(true);
    try {
      await apiClient.complaints.delete(complaintIdToDelete);
      toast.success("Keluhan berhasil dihapus secara permanen");
      fetchData();
      setIsDeleteModalOpen(false);
      setComplaintIdToDelete(null);
    } catch (err: any) {
      toast.error("Gagal menghapus keluhan", {
        description: err?.response?.data?.message || "Terjadi kesalahan pada server",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Open Detail Modal
  const handleOpenDetailModal = async (id: string) => {
    setIsDetailModalOpen(true);
    setIsDetailLoading(true);
    try {
      const data = await apiClient.complaints.getAdminDetail(id);
      setDetailModalData(data);
    } catch (err) {
      toast.error("Gagal memuat detail");
      setIsDetailModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Handler: Export Users
  const handleExportUsers = () => {
    if (filteredUsers.length === 0) {
      toast.error("Tidak ada data pengguna untuk diekspor");
      return;
    }
    const csvRows = [
      ["ID", "Nama", "Email", "Nomor HP", "Role", "Tipe User", "Status Aktif"],
      ...filteredUsers.map((u) => [
        u.id,
        u.name,
        u.email,
        u.phone_number || "-",
        u.role,
        u.userType || "-",
        u.isActive ? "Aktif" : "Tidak Aktif",
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_pengguna.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Data pengguna berhasil diekspor");
  };

  // Handler: Save User (Create/Update)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingUserId) {
        const payload = { ...userFormData };
        if (!payload.password) {
          delete (payload as any).password;
        }
        await apiClient.users.update(editingUserId, payload);
        toast.success("Pengguna berhasil diperbarui");
      } else {
        await apiClient.users.create(userFormData);
        toast.success("Pengguna berhasil ditambahkan");
      }
      setIsUserFormModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(editingUserId ? "Gagal memperbarui pengguna" : "Gagal menambahkan pengguna", {
        description: err?.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Delete User
  const handleDeleteUser = (userId: string, userName: string) => {
    toast.error("Hapus Pengguna", {
      description: `Apakah Anda yakin ingin menonaktifkan akun ${userName}?`,
      action: {
        label: "Hapus",
        onClick: async () => {
          try {
            await apiClient.users.delete(userId);
            toast.success("Pengguna berhasil dinonaktifkan");
            fetchData();
          } catch (err: any) {
            toast.error("Gagal menonaktifkan pengguna", {
              description: err?.response?.data?.message || "Terjadi kesalahan",
            });
          }
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
    });
  };

  // Handler: Restore User
  const handleRestoreUser = (userId: string, userName: string) => {
    toast.error("Aktifkan Pengguna", {
      description: `Apakah Anda yakin ingin mengaktifkan kembali akun ${userName}?`,
      action: {
        label: "Aktifkan",
        onClick: async () => {
          try {
            await apiClient.users.restore(userId);
            toast.success("Pengguna berhasil diaktifkan kembali");
            fetchData();
          } catch (err: any) {
            toast.error("Gagal mengaktifkan pengguna", {
              description: err?.response?.data?.message || "Terjadi kesalahan",
            });
          }
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
    });
  };

  // Handler: Download Logs
  const handleDownloadLogs = async () => {
    try {
      const auditData = await apiClient.auditLogs.getAll({ limit: 1000 });
      const logs = auditData?.data || [];
      if (logs.length === 0) {
        toast.error("Tidak ada log untuk diunduh");
        return;
      }

      const csvRows = [
        ["ID", "Waktu", "Aksi", "Tipe Entitas", "Oleh", "Role"],
        ...logs.map((log: any) => [
          log.id,
          new Date(log.createdAt).toLocaleString("id-ID"),
          log.action,
          log.entityType,
          log.user?.name || "Sistem",
          log.user?.role || "-",
        ]),
      ];

      const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `iso_audit_trail_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Log berhasil diunduh");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh log");
    }
  };

  // Filtered & Paginated Complaints
  const filteredComplaints = complaints.filter((c) => {
    if (tableTab === "NEW" && c.status !== "NEW") return false;
    if (tableTab === "OPEN" && c.status !== "OPEN") return false;
    if (tableTab === "DONE" && c.status !== "DONE") return false;
    if (unitFilter !== "ALL") {
      const mappedFilter = mapBackendUnitToFrontend(unitFilter);
      if (c.unit !== mappedFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.reporter?.name || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalComplaintPages = Math.max(1, Math.ceil(filteredComplaints.length / complaintPageSize));
  const paginatedDashboardComplaints = filteredComplaints.slice(
    (complaintPage - 1) * complaintPageSize,
    complaintPage * complaintPageSize
  );

  const totalComplaintsListPages = Math.max(1, Math.ceil(filteredComplaints.length / complaintsListPageSize));
  const paginatedComplaintsList = filteredComplaints.slice(
    (complaintsListPage - 1) * complaintsListPageSize,
    complaintsListPage * complaintsListPageSize
  );

  // Filtered Units
  const filteredUnits = units.filter((u) => {
    const normSearch = unitSearchQuery.toLowerCase();
    const matchesName = u.name.toLowerCase().includes(normSearch);
    const matchesDesc = (u.description || "").toLowerCase().includes(normSearch);
    const pic = unitMembers.find((m) => m.unitId === u.id && m.isPic);
    const matchesPIC = (pic?.name || "").toLowerCase().includes(normSearch);
    return matchesName || matchesDesc || matchesPIC;
  });

  // Formatted & Filtered Users
  const allUsers: AdminUserRow[] = allDbUsers.map((u) => {
    let roleName = "User";
    if (u.role === "SUPERADMIN") roleName = "Superadmin";
    else if (u.role === "SUPER_PIC") roleName = "Super PIC";
    else if (u.role === "UNIT_PIC") roleName = "PIC Unit";
    else if (u.role === "UNIT_MEMBER") roleName = "Anggota Unit";
    else if (u.role === "USER") {
      if (u.userType === "SISWA") roleName = "Siswa";
      else if (u.userType === "GURU") roleName = "Guru";
      else if (u.userType === "ORANGTUA") roleName = "Orangtua";
      else if (u.userType === "KARYAWAN") roleName = "Karyawan";
    }

    let unitName = "Umum";
    if (u.unitMemberships && u.unitMemberships.length > 0) {
      unitName = u.unitMemberships.map((m: any) => m.unit?.name).join(", ");
    } else if (u.role === "SUPERADMIN" || u.role === "SUPER_PIC") {
      unitName = "ISO";
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phoneNumber || u.phone_number || "-",
      phone_number: u.phoneNumber || u.phone_number || "-",
      role: roleName,
      unitName: unitName,
      status: u.isActive ? "Active" : "Inactive",
      memberId: `USR-${u.id.substring(0, 4).toUpperCase()}`,
      originalRole: u.role,
      originalUserType: u.userType,
      userType: u.userType || "-",
      isActive: u.isActive,
    };
  });

  const filteredUsers = allUsers.filter((u) => {
    const normSearch = userSearchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(normSearch) ||
      u.email.toLowerCase().includes(normSearch) ||
      u.phone.toLowerCase().includes(normSearch) ||
      u.memberId.toLowerCase().includes(normSearch);

    const matchesRole = userRoleFilter === "All" || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === "All" || u.status === userStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / userPageSize));
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * userPageSize,
    userPage * userPageSize
  );

  if (!mounted || !isAuthenticated || (user?.role !== "SUPERADMIN" && user?.role !== "SUPER_PIC")) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-[#f9f9f9] flex font-sans antialiased text-slate-800">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="grow h-full flex items-center justify-center bg-[#f9f9f9]">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f9f9f9] flex font-sans antialiased text-slate-800">
      {/* ─── 1. LEFT SIDEBAR ─── */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ─── 2. MAIN CONTAINER ─── */}
      <div className="grow h-full flex flex-col min-w-0 overflow-hidden bg-[#f9f9f9]">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="relative w-96"></div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <span className="block text-xs font-bold text-slate-800 leading-tight">
                  {user?.name || "Admin ISO"}
                </span>
                <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  {user?.role === "SUPERADMIN" ? "Superadmin" : "Super PIC"}
                </span>
              </div>
              <div className="h-9 w-9 rounded-full bg-[#b61722] text-white flex items-center justify-center font-bold text-sm shadow-sm select-none">
                {(user?.name || "Admin")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* ─── WORKSPACE (Internal Scroll) ─── */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === "dashboard" ? (
            <OverviewTab
              isLoading={isLoading}
              autoCloseDays={autoCloseDays}
              stats={stats}
              complaints={complaints}
              units={units}
              tableTab={tableTab}
              setTableTab={setTableTab}
              unitFilter={unitFilter}
              setUnitFilter={setUnitFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              paginatedDashboardComplaints={paginatedDashboardComplaints}
              filteredComplaints={filteredComplaints}
              complaintPage={complaintPage}
              totalComplaintPages={totalComplaintPages}
              complaintPageSize={complaintPageSize}
              setComplaintPage={setComplaintPage}
              auditLogs={auditLogs}
              user={user}
              onOpenAutoClose={() => setIsAutoCloseModalOpen(true)}
              onForward={(c) => {
                setSelectedComplaintForForward(c);
                setForwardUnitId(units[0]?.id || "");
              }}
              onOpenDetail={handleOpenDetailModal}
              onDelete={(id) => {
                setComplaintIdToDelete(id);
                setIsDeleteModalOpen(true);
              }}
              onToggleVisibility={handleToggleVisibility}
              onDownloadLogs={handleDownloadLogs}
            />
          ) : activeTab === "complaints" ? (
            <ComplaintsTab
              units={units}
              tableTab={tableTab}
              setTableTab={setTableTab}
              unitFilter={unitFilter}
              setUnitFilter={setUnitFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              paginatedComplaintsList={paginatedComplaintsList}
              filteredComplaints={filteredComplaints}
              complaintsListPage={complaintsListPage}
              totalComplaintsListPages={totalComplaintsListPages}
              complaintsListPageSize={complaintsListPageSize}
              setComplaintsListPage={setComplaintsListPage}
              user={user}
              onForward={(c) => {
                setSelectedComplaintForForward(c);
                setForwardUnitId(units[0]?.id || "");
              }}
              onOpenDetail={handleOpenDetailModal}
              onDelete={(id) => {
                setComplaintIdToDelete(id);
                setIsDeleteModalOpen(true);
              }}
              onToggleVisibility={handleToggleVisibility}
            />
          ) : activeTab === "units" ? (
            <UnitsTab
              units={units}
              filteredUnits={filteredUnits}
              unitSearchQuery={unitSearchQuery}
              setUnitSearchQuery={setUnitSearchQuery}
              selectedUnitId={selectedUnitId}
              setSelectedUnitId={setSelectedUnitId}
              unitMembers={unitMembers}
              complaints={complaints}
              onOpenCreateUnit={() => {
                setNewUnitName("");
                setNewUnitDesc("");
                setIsCreateUnitModalOpen(true);
              }}
              onOpenEditUnit={(unit) => {
                setSelectedUnitId(unit.id);
                setEditUnitName(unit.name);
                setEditUnitDesc(unit.description || "");
                setIsEditUnitModalOpen(true);
              }}
              onDeleteUnit={handleDeleteUnit}
              onOpenAddMember={(unitId, isPic) => {
                setSelectedUnitForMember(unitId);
                setMemberIsPic(isPic);
                setNewMemberEmail("");
                setIsAddMemberModalOpen(true);
              }}
              onRemoveMember={handleRemoveMember}
              onNavigateToMembers={() => setActiveTab("members")}
            />
          ) : activeTab === "members" ? (
            <MembersTab
              userSearchQuery={userSearchQuery}
              setUserSearchQuery={setUserSearchQuery}
              userRoleFilter={userRoleFilter}
              setUserRoleFilter={setUserRoleFilter}
              userStatusFilter={userStatusFilter}
              setUserStatusFilter={setUserStatusFilter}
              paginatedUsers={paginatedUsers}
              filteredUsers={filteredUsers}
              userPage={userPage}
              totalUserPages={totalUserPages}
              userPageSize={userPageSize}
              setUserPage={setUserPage}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onExportUsers={handleExportUsers}
              onOpenCreateUser={() => {
                setEditingUserId(null);
                setUserFormData({
                  name: "",
                  email: "",
                  password: "",
                  phone_number: "",
                  role: "USER",
                  userType: "SISWA",
                });
                setIsUserFormModalOpen(true);
              }}
              onOpenEditUser={(u) => {
                setEditingUserId(u.id);
                setUserFormData({
                  name: u.name,
                  email: u.email,
                  password: "",
                  phone_number: u.phone === "-" ? "" : u.phone,
                  role: u.originalRole || "USER",
                  userType: u.originalUserType || "SISWA",
                });
                setIsUserFormModalOpen(true);
              }}
              onViewUser={(u) => setSelectedUserForView(u)}
              onRestoreUser={handleRestoreUser}
              onDeleteUser={handleDeleteUser}
            />
          ) : activeTab === "whatsapp" ? (
            <WhatsAppManager isActive={activeTab === "whatsapp"} />
          ) : activeTab === "audit_logs" ? (
            <AuditLogsManager />
          ) : null}
        </div>
      </div>

      {/* ─── MODALS ─── */}
      <ForwardComplaintModal
        complaint={selectedComplaintForForward}
        units={units}
        forwardUnitId={forwardUnitId}
        forwardNote={forwardNote}
        onSelectUnit={setForwardUnitId}
        onChangeNote={setForwardNote}
        onClose={() => setSelectedComplaintForForward(null)}
        onSubmit={handleForwardComplaint}
      />

      <CreateUnitModal
        isOpen={isCreateUnitModalOpen}
        unitName={newUnitName}
        unitDesc={newUnitDesc}
        isSubmitting={isSubmitting}
        onChangeName={setNewUnitName}
        onChangeDesc={setNewUnitDesc}
        onClose={() => setIsCreateUnitModalOpen(false)}
        onSubmit={handleCreateUnit}
      />

      <EditUnitModal
        isOpen={isEditUnitModalOpen}
        unitName={editUnitName}
        unitDesc={editUnitDesc}
        isSubmitting={isSubmitting}
        onChangeName={setEditUnitName}
        onChangeDesc={setEditUnitDesc}
        onClose={() => setIsEditUnitModalOpen(false)}
        onSubmit={handleUpdateUnit}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        memberIsPic={memberIsPic}
        selectedUnitForMember={selectedUnitForMember}
        newMemberEmail={newMemberEmail}
        units={units}
        allDbUsers={allDbUsers}
        isSubmitting={isSubmitting}
        onChangeUnit={setSelectedUnitForMember}
        onChangeEmail={setNewMemberEmail}
        onChangeIsPic={setMemberIsPic}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSubmit={handleAddMember}
      />

      <AutoCloseConfigModal
        isOpen={isAutoCloseModalOpen}
        autoCloseDays={autoCloseDays}
        isUpdating={isUpdatingAutoClose}
        onChangeDays={setAutoCloseDays}
        onClose={() => setIsAutoCloseModalOpen(false)}
        onSubmit={handleSaveAutoCloseConfig}
      />

      <ImportUsersModal
        isOpen={isImportModalOpen}
        importStep={importStep}
        importFile={importFile}
        importData={importData}
        units={units}
        isSubmitting={isSubmitting}
        onClose={() => setIsImportModalOpen(false)}
        onSetImportFile={setImportFile}
        onSetImportStep={setImportStep}
        onSetImportData={setImportData}
        onSuccess={fetchData}
        setIsSubmitting={setIsSubmitting}
      />

      <UserFormModal
        isOpen={isUserFormModalOpen}
        editingUserId={editingUserId}
        userFormData={userFormData}
        isSubmitting={isSubmitting}
        onClose={() => setIsUserFormModalOpen(false)}
        onChangeFormData={setUserFormData}
        onSubmit={handleSaveUser}
      />

      <ViewUserModal
        user={selectedUserForView}
        onClose={() => setSelectedUserForView(null)}
      />

      <DetailComplaintModal
        isOpen={isDetailModalOpen}
        isLoading={isDetailLoading}
        data={detailModalData}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailModalData(null);
        }}
      />

      <DeleteComplaintModal
        isOpen={isDeleteModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteComplaint}
      />
    </div>
  );
}
