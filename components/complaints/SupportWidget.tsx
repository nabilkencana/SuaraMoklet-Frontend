"use client";

import React, { useState } from "react";
import { Heart, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SupportWidgetProps {
  complaintId: string;
  supports: number;
  targetSupports?: number;
  isSupported?: boolean;
  onSupport: (id: string, name?: string, comment?: string) => Promise<boolean>;
}

export default function SupportWidget({
  complaintId,
  supports,
  targetSupports = 500,
  isSupported = false,
  onSupport,
}: SupportWidgetProps) {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const percent = Math.min(Math.round((supports / targetSupports) * 100), 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await onSupport(complaintId, name || undefined, comment || undefined);
    if (success) {
      setName("");
      setComment("");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Metric details */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-slate-800">{supports}</span>
          <span className="text-xs text-slate-400 font-medium">dukungan terkumpul dari target {targetSupports}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-600 rounded-full transition-all duration-500" 
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {isSupported ? (
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 flex items-start gap-2.5 text-emerald-700">
          <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
            <Check className="h-3 w-3" />
          </div>
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider">Anda Mendukung Keluhan Ini</h5>
            <p className="text-xs text-emerald-600 leading-relaxed mt-0.5">
              Terima kasih! Dukungan Anda sangat berarti untuk mempercepat tindak lanjut laporan ini oleh pihak tata kelola sekolah.
            </p>
          </div>
        </div>
      ) : (
        /* Action Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="supportName" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Nama <span className="text-slate-400">(Opsional, bisa Anonim)</span>
            </label>
            <Input
              id="supportName"
              type="text"
              placeholder="Masukkan nama..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="supportComment" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Pesan Dukungan <span className="text-slate-400">(Opsional)</span>
            </label>
            <textarea
              id="supportComment"
              rows={3}
              placeholder="Tuliskan mengapa keluhan ini penting..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
              className="flex w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-red-500/80 focus:ring-4 focus:ring-red-500/10"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-xs font-bold uppercase tracking-wider h-10 shadow-sm shadow-red-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2 fill-white/10" />
                <span>Dukung Keluhan Ini</span>
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
