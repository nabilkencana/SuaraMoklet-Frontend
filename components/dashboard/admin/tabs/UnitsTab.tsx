import React from "react";
import {
  Search,
  Building,
  GraduationCap,
  BookOpen,
  Briefcase,
  Trash2,
  Pencil,
  UserPlus,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Complaint, UnitModel } from "@/types/complaint";
import { UnitMember } from "../types";
import { mapBackendUnitToFrontend } from "@/lib/api";
import { toast } from "sonner";

interface UnitsTabProps {
  units: UnitModel[];
  filteredUnits: UnitModel[];
  unitSearchQuery: string;
  setUnitSearchQuery: (query: string) => void;
  selectedUnitId: string;
  setSelectedUnitId: (id: string) => void;
  unitMembers: UnitMember[];
  complaints: Complaint[];
  onOpenCreateUnit: () => void;
  onOpenEditUnit: (unit: UnitModel) => void;
  onDeleteUnit: (unitId: string) => void;
  onOpenAddMember: (unitId: string, isPic: boolean) => void;
  onRemoveMember: (memberId: string, unitId: string) => void;
  onNavigateToMembers: () => void;
}

const getUnitIcon = (name: string) => {
  const norm = name.toLowerCase();
  if (norm.includes("kesiswaan")) return <GraduationCap className="h-5 w-5 text-white" />;
  if (norm.includes("kurikulum")) return <BookOpen className="h-5 w-5 text-white" />;
  if (norm.includes("humas") || norm.includes("hubinkom") || norm.includes("relations"))
    return <Briefcase className="h-5 w-5 text-white" />;
  return <Building className="h-5 w-5 text-white" />;
};

const getUnitIconBg = (name: string) => {
  const norm = name.toLowerCase();
  if (norm.includes("kesiswaan") || norm.includes("kurikulum")) return "bg-[#b61722]";
  return "bg-slate-700";
};

const getUnitDescription = (unit: UnitModel) => {
  if (unit.description) return unit.description;
  const norm = unit.name.toLowerCase();
  if (norm.includes("kurikulum"))
    return "Academic planning, syllabus management, and educational processes.";
  if (norm.includes("kesiswaan"))
    return "Student affairs, discipline, extracurricular activities, and counseling.";
  if (norm.includes("humas") || norm.includes("hubinkom"))
    return "Public relations, industry partnerships, and external relations.";
  if (norm.includes("sarpras"))
    return "Facilities, infrastructure maintenance, and resource management.";
  return "Management and operation of department resources.";
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const getUnitPIC = (unitId: string, unitName: string, unitMembers: UnitMember[]) => {
  const pic = unitMembers.find((m) => m.unitId === unitId && m.isPic);
  if (pic) return pic;
  return { name: "Belum Ditunjuk", email: "-", initials: "BD" };
};

export default function UnitsTab({
  units,
  filteredUnits,
  unitSearchQuery,
  setUnitSearchQuery,
  selectedUnitId,
  setSelectedUnitId,
  unitMembers,
  complaints,
  onOpenCreateUnit,
  onOpenEditUnit,
  onDeleteUnit,
  onOpenAddMember,
  onRemoveMember,
  onNavigateToMembers,
}: UnitsTabProps) {
  const activeUnit = units.find((u) => u.id === selectedUnitId) || units[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Unit Organisasi</h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Kelola unit sekolah dan personil yang ditugaskan.
          </p>
        </div>

        {/* Search and Create Unit */}
        <div className="flex items-center gap-3">
          <div className="relative w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
            <input
              type="text"
              placeholder="Search units or PIC..."
              value={unitSearchQuery}
              onChange={(e) => setUnitSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-red-400 transition-all font-medium animate-all"
            />
          </div>

          <button
            onClick={onOpenCreateUnit}
            className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Building className="h-4 w-4 text-slate-500" />
            <span>Membuat Unit</span>
          </button>
        </div>
      </div>

      {/* Core Layout Grid: 2/3 Left (Cards Grid), 1/3 Right (Selected Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Unit Cards Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredUnits.map((unit) => {
              const isSelected = selectedUnitId === unit.id;
              const icon = getUnitIcon(unit.name);
              const iconBg = getUnitIconBg(unit.name);
              const desc = getUnitDescription(unit);

              const membersCount = unitMembers.filter((m) => m.unitId === unit.id).length;
              const mappedUnitName = mapBackendUnitToFrontend(unit.name);
              const activeIssuesCount = complaints.filter(
                (c) => c.unit === mappedUnitName && c.status !== "DONE"
              ).length;

              const pic = getUnitPIC(unit.id, unit.name, unitMembers);
              const picInitials =
                (pic as { initials?: string }).initials || getInitials(pic.name);

              return (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnitId(unit.id)}
                  className={cn(
                    "bg-white p-6 rounded-3xl border shadow-sm transition-all duration-300 flex flex-col justify-between h-60 relative cursor-pointer group",
                    isSelected
                      ? "border-[#b61722] ring-1 ring-[#b61722] scale-[1.01]"
                      : "border-slate-200/80 hover:border-slate-350 hover:shadow-md"
                  )}
                >
                  {/* Top row: Name & icon badge */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 pr-8">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-800 text-lg leading-tight group-hover:text-[#b61722] transition-colors">
                          {unit.name}
                        </h3>
                        {isSelected && (
                          <span className="bg-[#b61722] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap">
                            TERPILIH
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-2">
                        {desc}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "p-2.5 rounded-2xl shadow-xs shrink-0 flex items-center justify-center",
                        iconBg
                      )}
                    >
                      {icon}
                    </div>
                  </div>

                  {/* Middle row: Stats boxes */}
                  <div className="grid grid-cols-2 gap-4 my-2">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Members
                      </span>
                      <span className="text-xl font-extrabold text-slate-800 mt-0.5">
                        {membersCount}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Active Issues
                      </span>
                      <span
                        className={cn(
                          "text-xl font-extrabold mt-0.5",
                          activeIssuesCount > 5 ? "text-[#b61722]" : "text-slate-800"
                        )}
                      >
                        {activeIssuesCount}
                      </span>
                    </div>
                  </div>

                  {/* Bottom row: Primary PIC info */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
                    <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {picInitials}
                    </div>
                    <div className="text-[11px] font-medium leading-none">
                      <span className="block text-slate-400 text-[9px] font-bold uppercase tracking-wider pb-0.5">
                        Primary PIC
                      </span>
                      <span className="font-bold text-slate-800">{pic.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Selected Detail Sidebar */}
        <div className="lg:col-span-1">
          {!activeUnit ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm text-center text-slate-400 font-medium">
              No Unit Selected
            </div>
          ) : (
            (() => {
              const pic = getUnitPIC(activeUnit.id, activeUnit.name, unitMembers);
              const picInitials =
                (pic as { initials?: string }).initials || getInitials(pic.name);
              const activeMembers = unitMembers.filter((m) => m.unitId === activeUnit.id);
              const displayMembers = activeMembers;
              const totalMembers = activeMembers.length;

              return (
                <div className="bg-white rounded-3xl border border-[#b61722] shadow-md p-6 flex flex-col justify-between min-h-145">
                  <div className="space-y-6">
                    {/* Header section with Edit & Delete */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5">
                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                          {activeUnit.name}
                        </h2>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                          {getUnitDescription(activeUnit)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            toast.error("Hapus Unit", {
                              description: `Apakah Anda yakin ingin menghapus unit ${activeUnit.name} secara permanen?`,
                              action: {
                                label: "Hapus",
                                onClick: () => onDeleteUnit(activeUnit.id),
                              },
                              cancel: {
                                label: "Batal",
                                onClick: () => {},
                              },
                            });
                          }}
                          className="h-9 w-9 border border-red-100 hover:bg-red-50 rounded-xl flex items-center justify-center text-red-650 transition-colors cursor-pointer shrink-0"
                          title="Delete Unit"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onOpenEditUnit(activeUnit)}
                          className="h-9 w-9 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors cursor-pointer shrink-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* CURRENT PIC details */}
                    <div className="space-y-3">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        PIC Saat Ini
                      </span>

                      <div className="bg-slate-50/80 rounded-2xl border border-slate-150 p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-red-50 text-red-600 border border-red-100 text-sm font-extrabold flex items-center justify-center shrink-0">
                            {picInitials}
                          </div>
                          <div className="space-y-0.5">
                            <span className="block text-xs font-bold text-slate-800">
                              {pic.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => onOpenAddMember(activeUnit.id, true)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                          >
                            Ganti PIC
                          </button>
                          {pic.name !== "Belum Ditunjuk" && (
                            <button
                              onClick={() =>
                                onRemoveMember((pic as any).id, activeUnit.id)
                              }
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-[10px] font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center"
                              title="Hapus PIC"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Unit Members List */}
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          Anggota Unit ({totalMembers})
                        </span>

                        <button
                          onClick={() => onOpenAddMember(activeUnit.id, false)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-[#b61722] hover:text-red-650 transition-colors cursor-pointer"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>Tambah Anggota</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {displayMembers.length > 0 ? (
                          displayMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between gap-3 group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                                  {(member as { initials?: string }).initials ||
                                    getInitials(member.name)}
                                </div>
                                <div className="space-y-0.5 leading-none">
                                  <span className="block text-xs font-bold text-slate-800">
                                    {member.name}
                                  </span>
                                  <span className="block text-[10px] text-slate-400 font-medium">
                                    {member.role || "Staff Member"}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => onRemoveMember(member.id, activeUnit.id)}
                                className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                title="Hapus Anggota"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-400 text-xs text-center py-4">
                            Belum ada anggota di unit ini.
                          </div>
                        )}
                      </div>

                      {totalMembers > 3 && (
                        <button
                          onClick={onNavigateToMembers}
                          className="block w-full text-center text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-wider pt-2 cursor-pointer"
                        >
                          LIHAT SEMUA {totalMembers} ANGGOTA
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Manage Settings Button */}
                  <div className="pt-6 border-t border-slate-100">
                    <button
                      onClick={() => {
                        toast.info(`Membuka Pengaturan Unit: ${activeUnit.name}`);
                      }}
                      className="w-full h-11 bg-[#b61722] hover:bg-red-650 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                      <Sliders className="h-4 w-4" />
                      <span>Kelola Pengaturan Unit</span>
                    </button>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
