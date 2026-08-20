import React, { useState } from "react";
import {
  AlertCircle,
  HelpCircle,
  FileText,
  Building2,
  ChevronDown,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Complaint } from "@/types/complaint";
import CommentSection from "@/components/comments/CommentSection";

function Accordion({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
          <Icon className="h-4 w-4 text-red-500" />
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-xs text-slate-650 leading-relaxed">{children}</div>
      )}
    </div>
  );
}

interface ComplaintBodyProps {
  complaint: Complaint;
  isDisliked: boolean;
  isOwner: boolean;
  onRestoreDisliked: () => void;
}

export default function ComplaintBody({
  complaint,
  isDisliked,
  isOwner,
  onRestoreDisliked,
}: ComplaintBodyProps) {
  if (isDisliked) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-4 py-12">
        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-450">
          <EyeOff className="h-6 w-6 text-slate-500" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-800">Aspirasi Ini Disembunyikan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Anda memberikan dislike pada aspirasi ini. Isinya disembunyikan agar kenyamanan
            penelusuran Anda tetap terjaga.
          </p>
        </div>
        <button
          onClick={onRestoreDisliked}
          className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl mx-auto block cursor-pointer transition-colors"
        >
          Tampilkan Kembali Aspirasi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Mobile: accordion sections */}
      <div className="lg:hidden space-y-3">
        <Accordion title="Permasalahan" icon={AlertCircle} defaultOpen={true}>
          <p className="whitespace-pre-wrap">
            {complaint.description || (
              <span className="text-slate-400 italic">Deskripsi belum tersedia.</span>
            )}
          </p>

          {complaint.status === "OPEN" && complaint.handlingPlan && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                Rencana Penanganan (Diproses)
              </span>
              <p className="text-xs text-slate-600 whitespace-pre-wrap">
                {complaint.handlingPlan}
              </p>
            </div>
          )}

          {complaint.status === "DONE" && complaint.resolution && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                Solusi Resmi (Selesai)
              </span>
              <p className="text-xs text-slate-600 whitespace-pre-wrap">
                {complaint.resolution}
              </p>
            </div>
          )}
        </Accordion>

        {complaint.expectedOutput && (
          <Accordion title="Yang Diharapkan" icon={HelpCircle}>
            <p className="whitespace-pre-wrap">{complaint.expectedOutput}</p>
          </Accordion>
        )}

        {complaint.evidenceUrl && (
          <Accordion title="Lampiran Bukti" icon={FileText}>
            <div className="relative h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={complaint.evidenceUrl}
                alt="Lampiran Bukti"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => window.open(complaint.evidenceUrl, "_blank")}
              />
            </div>
          </Accordion>
        )}
      </div>

      {/* Desktop: full expanded cards */}
      <div className="hidden lg:block space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertCircle className="h-4.5 w-4.5 text-red-500" />
            Permasalahan
          </h3>
          <p className="text-xs text-slate-655 leading-relaxed whitespace-pre-wrap">
            {complaint.description || (
              <span className="text-slate-400 italic">Deskripsi belum tersedia.</span>
            )}
          </p>

          {complaint.status === "OPEN" && complaint.handlingPlan && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="block text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
                Rencana Penanganan (Diproses)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                {complaint.handlingPlan}
              </p>
            </div>
          )}

          {complaint.status === "DONE" && complaint.resolution && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="block text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
                Solusi Resmi (Selesai)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                {complaint.resolution}
              </p>
            </div>
          )}
        </div>

        {complaint.expectedOutput && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <HelpCircle className="h-4.5 w-4.5 text-red-500" />
              Yang Diharapkan
            </h3>
            <p className="text-xs text-slate-655 leading-relaxed whitespace-pre-wrap">
              {complaint.expectedOutput}
            </p>
          </div>
        )}

        {complaint.evidenceUrl && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="h-4.5 w-4.5 text-red-500" />
              Lampiran Bukti
            </h3>
            <div className="relative max-w-md h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={complaint.evidenceUrl}
                alt="Lampiran Bukti"
                className="w-full h-full object-cover hover:scale-102 transition-transform duration-300 cursor-pointer"
                onClick={() => window.open(complaint.evidenceUrl, "_blank")}
              />
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tujuan Keluhan
            </span>
            <h4 className="text-sm font-bold text-slate-800 mt-0.5">Unit {complaint.unit}</h4>
          </div>
        </div>
      </div>

      {/* Discussion Section */}
      <CommentSection
        complaintId={complaint.id}
        isClosed={complaint.status === "DONE"}
        isOwner={isOwner}
      />
    </div>
  );
}
