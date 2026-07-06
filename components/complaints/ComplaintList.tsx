"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, PenTool, Clock, Inbox, Plus, ArrowRight, Tag } from "lucide-react";
import useComplaint from "@/hooks/useComplaint";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Complaint, ComplaintStatus } from "@/types/complaint";

// Centralized status badge styling mapping
const STATUS_CONFIG: Record<ComplaintStatus, { label: string; classes: string }> = {
  OPEN: {
    label: "OPEN",
    classes: "bg-slate-100 text-slate-600 border border-slate-200 ring-1 ring-slate-100/50",
  },
  IN_PROGRESS: {
    label: "IN PROGRESS",
    classes: "bg-blue-50 text-blue-600 border border-blue-200 ring-1 ring-blue-100/50",
  },
  WAITING_USER: {
    label: "WAITING USER",
    classes: "bg-amber-50 text-amber-600 border border-amber-200 ring-1 ring-amber-100/50",
  },
  CLOSED: {
    label: "CLOSED",
    classes: "bg-emerald-50 text-emerald-600 border border-emerald-200 ring-1 ring-emerald-100/50",
  },
};

export default function ComplaintList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { complaints, isLoading, fetchOwnComplaints } = useComplaint();

  // Search & Filter State — pre-populate from URL ?q= param
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const [activeFilter, setActiveFilter] = useState<"ALL" | ComplaintStatus>("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST">("NEWEST");

  useEffect(() => {
    fetchOwnComplaints();
  }, []);

  // Filtering Logic — guard against non-array state
  const complaintsList = Array.isArray(complaints) ? complaints : [];
  const filteredComplaints = complaintsList
    .filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = activeFilter === "ALL" || c.status === activeFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "NEWEST" ? dateB - dateA : dateA - dateB;
    });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Filters skeleton */}
        <div className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-slate-100 rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-xs group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
          <Input
            type="text"
            placeholder="Cari keluhan Anda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Sort Select */}
        <div className="w-full md:w-auto flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Urutkan:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "NEWEST" | "OLDEST")}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-red-500/85 focus:ring-4 focus:ring-red-500/10 cursor-pointer select-none transition-all"
          >
            <option value="NEWEST">Terbaru</option>
            <option value="OLDEST">Terlama</option>
          </select>
        </div>
      </div>

      {/* Status Tags Filter */}
      <div className="flex flex-wrap gap-2 pb-2">
        {(["ALL", "OPEN", "IN_PROGRESS", "WAITING_USER", "CLOSED"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer",
              activeFilter === filter
                ? "bg-red-600 border-red-600 text-white shadow-sm shadow-red-200"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            )}
          >
            {filter === "ALL" ? "Semua Laporan" : filter.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Grid List */}
      {filteredComplaints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => {
            const statusInfo = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.OPEN;
            return (
              <div
                key={complaint.id}
                onClick={() => router.push(`/complaints/${complaint.id}`)}
                className="group flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                {/* Header info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2.5">
                    {/* Unit */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border border-slate-100 bg-slate-50 text-slate-500">
                      <Tag className="h-3 w-3" />
                      {complaint.unit}
                    </span>
                    {/* Status */}
                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide", statusInfo.classes)}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-slate-800 text-base leading-snug group-hover:text-red-600 transition-colors line-clamp-1">
                    {complaint.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {complaint.description}
                  </p>
                </div>

                {/* Footer details */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {/* Support */}
                  <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold">
                    <PenTool className="h-4 w-4" />
                    <span>{complaint.supports} Dukungan</span>
                  </div>
                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {new Date(complaint.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm space-y-4">
          <div className="h-14 w-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Inbox className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-extrabold text-slate-800">Tidak ada keluhan ditemukan</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Anda belum mengirimkan laporan apapun atau hasil pencarian Anda kosong.
            </p>
          </div>
          <Link href="/complaints/create" className="inline-flex">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 shadow-sm shadow-red-200">
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Buat Keluhan Baru</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
