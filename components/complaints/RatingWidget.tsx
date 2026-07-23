"use client";

import React, { useState } from "react";
import { Star, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

interface RatingWidgetProps {
  complaintId: string;
}

// ponytail: inline, no abstraction — single-use rating widget for CLOSED complaints
export default function RatingWidget({ complaintId }: RatingWidgetProps) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await apiClient.complaints.postRating(complaintId, selected, note || undefined);
      setSubmitted(true);
      toast.success("Terima kasih! Rating kamu telah dikirim.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal mengirim rating.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center gap-3 text-center shadow-sm">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <div>
          <p className="text-sm font-bold text-emerald-800">Rating Terkirim!</p>
          <p className="text-xs text-emerald-600 mt-0.5">Terima kasih sudah memberikan penilaian.</p>
        </div>
        {/* Show submitted stars */}
        <div className="flex gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 ${star <= selected ? "text-amber-400 fill-amber-400" : "text-slate-300"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Star className="h-4.5 w-4.5 text-amber-400 fill-amber-400" />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Beri Rating Penanganan
        </h3>
      </div>

      <p className="text-xs text-slate-500">
        Seberapa puas kamu dengan penanganan keluhan ini? Tap bintang untuk memberi penilaian.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star selector */}
        <div className="flex gap-2 justify-center py-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelected(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Star
                className={`h-9 w-9 transition-colors duration-150 ${
                  star <= (hovered || selected)
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-300"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Label below stars */}
        {(hovered || selected) > 0 && (
          <p className="text-center text-xs font-semibold text-slate-500">
            {["", "Sangat Tidak Puas", "Tidak Puas", "Cukup", "Puas", "Sangat Puas"][hovered || selected]}
          </p>
        )}

        {/* Optional note */}
        <textarea
          rows={2}
          placeholder="Catatan tambahan (opsional)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
        />

        <button
          type="submit"
          disabled={!selected || submitting}
          className="w-full h-10 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-amber-200"
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Star className="h-3.5 w-3.5 fill-white" />
              Kirim Rating
            </>
          )}
        </button>
      </form>
    </div>
  );
}
