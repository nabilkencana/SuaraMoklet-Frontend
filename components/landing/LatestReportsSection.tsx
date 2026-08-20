"use client";

import React from "react";
import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import SectionEyebrow from "./SectionEyebrow";
import {
  LatestComplaintListItem,
  ComplaintCardData,
} from "@/components/shared/complaint-card";

interface LatestReportsSectionProps {
  latestComplaints: ComplaintCardData[];
  isLoading: boolean;
}

export default function LatestReportsSection({
  latestComplaints,
  isLoading,
}: LatestReportsSectionProps) {
  return (
    <section className="py-16 sm:py-20 bg-slate-50/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <SectionEyebrow label="Terbaru" icon={FileText} />
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Laporan Terbaru
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Aspirasi dan pengaduan yang baru saja dilaporkan oleh siswa
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-red-600 hover:text-red-700 transition-colors shrink-0 cursor-pointer"
            >
              Lihat Semua
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="py-12 flex justify-center text-slate-400 font-medium">
              Memuat data keluhan terbaru...
            </div>
          ) : latestComplaints.length > 0 ? (
            latestComplaints.map((complaint) => (
              <LatestComplaintListItem key={complaint.id} data={complaint} />
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 font-medium">
              Belum ada keluhan publik saat ini.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
