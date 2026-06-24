"use client";

import React from "react";
import { TimelineEvent, ComplaintStatus } from "@/types/complaint";
import { Clock } from "lucide-react";

interface TimelineProps {
  events?: TimelineEvent[];
}

export default function Timeline({ events = [] }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
        <p className="text-xs text-slate-400 font-semibold">Belum ada perkembangan terbaru.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
        <Clock className="h-4 w-4 text-red-600" />
        <span>Perkembangan Terbaru</span>
      </h3>

      <div className="relative border-l-2 border-slate-100 ml-3.5 pl-6 space-y-6">
        {events.map((event, idx) => {
          const isLast = idx === events.length - 1;
          return (
            <div key={event.id} className="relative group">
              {/* Timeline Indicator Dot */}
              <div 
                className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 transition-colors ${
                  idx === 0
                    ? "bg-red-600 border-red-600 ring-4 ring-red-50"
                    : "bg-white border-slate-350"
                }`}
              />

              {/* Event Content */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-400">
                  {new Date(event.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  {new Date(event.createdAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <h4 className="text-sm font-bold text-slate-800 leading-snug">{event.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
