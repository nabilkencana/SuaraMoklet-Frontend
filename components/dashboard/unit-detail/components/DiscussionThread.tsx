import React from "react";
import { MessageSquare, RefreshCw, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Complaint } from "@/types/complaint";
import { Comment } from "@/types/comment";

interface DiscussionThreadProps {
  complaint: Complaint;
  comments: Comment[];
  replyText: string;
  isSendingReply: boolean;
  onChangeReplyText: (text: string) => void;
  onSubmitReply: (e: React.FormEvent) => void;
}

export default function DiscussionThread({
  complaint,
  comments,
  replyText,
  isSendingReply,
  onChangeReplyText,
  onSubmitReply,
}: DiscussionThreadProps) {
  return (
    <div
      id="reply-form-section"
      className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5"
    >
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-slate-400" />
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Diskusi Pribadi dengan Pelapor
        </span>
        <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-full uppercase tracking-wider">
          Privat
        </span>
      </div>

      {/* Message thread */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <MessageSquare className="h-6 w-6 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold">Belum ada pesan dalam diskusi ini.</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isOfficial = comment.isPic;
            return (
              <div
                key={comment.id}
                className={cn(
                  "p-3.5 rounded-2xl text-xs space-y-1.5 max-w-[90%] border shadow-3xs",
                  isOfficial
                    ? "bg-red-50/50 border-red-200/60 rounded-tr-none ml-auto"
                    : "bg-white border-slate-100 rounded-tl-none mr-auto"
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-bold text-slate-800">
                    {comment.user?.name || "Anonim"}
                  </span>
                  {isOfficial && (
                    <span className="px-2 py-0.5 bg-[#b61722] text-white font-extrabold text-[8px] uppercase tracking-wider rounded-md">
                      Unit
                    </span>
                  )}
                </div>
                <p className="text-slate-500 leading-relaxed font-semibold">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Inline reply form */}
      {complaint.status !== "DONE" ? (
        <form onSubmit={onSubmitReply} className="flex gap-2 pt-2 border-t border-slate-100">
          <textarea
            rows={2}
            required
            placeholder="Balas pesan pelapor..."
            value={replyText}
            onChange={(e) => onChangeReplyText(e.target.value)}
            disabled={isSendingReply}
            className="flex-1 p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-red-400 resize-none font-medium"
          />
          <button
            type="submit"
            disabled={isSendingReply || !replyText.trim()}
            className="h-auto px-4 bg-[#b61722] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer active:scale-[0.98]"
          >
            {isSendingReply ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </form>
      ) : (
        <div className="pt-2 border-t border-slate-100 text-center text-[10px] text-slate-400 font-semibold">
          Keluhan ditutup. Diskusi dinonaktifkan.
        </div>
      )}
    </div>
  );
}
