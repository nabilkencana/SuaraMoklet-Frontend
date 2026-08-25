import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MessageSquare, RefreshCw, Send, Paperclip, X, Loader2, FileText, Reply, Eye, Search, Image as ImageIcon } from "lucide-react";
import { cn, isSafeMediaUrl } from "@/lib/utils";
import { Complaint } from "@/types/complaint";
import { Comment } from "@/types/comment";

interface DiscussionThreadProps {
  complaint: Complaint;
  comments: Comment[];
  replyText: string;
  isSendingReply: boolean;
  onChangeReplyText: (text: string) => void;
  onSubmitReply: (e: React.FormEvent, parentId?: string) => void;
  replyFile: File | null;
  replyFileUrl: string | null;
  isUploadingReplyFile: boolean;
  onReplyFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveReplyFile: () => void;
}

export default function DiscussionThread({
  complaint,
  comments,
  replyText,
  isSendingReply,
  onChangeReplyText,
  onSubmitReply,
  replyFile,
  replyFileUrl,
  isUploadingReplyFile,
  onReplyFileChange,
  onRemoveReplyFile,
}: DiscussionThreadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasInitialScrolled = useRef(false);
  const isAtBottom = useRef(true);
  
  const [selectedFile, setSelectedFile] = useState<{ url: string, isImage: boolean } | null>(null);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMediaOnly, setFilterMediaOnly] = useState(false);

  const checkIsImage = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.split("?")[0].toLowerCase();
    // Since we only accept images and PDFs, anything that isn't explicitly a PDF is treated as an image.
    return !cleanUrl.endsWith('.pdf');
  };

  const filteredComments = comments.filter((c) => {
    if (filterMediaOnly && !c.evidenceUrl) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      if (!c.content.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    isAtBottom.current = scrollHeight - scrollTop - clientHeight < 50;
  };

  React.useEffect(() => {
    if (scrollContainerRef.current && comments.length > 0) {
      if (!hasInitialScrolled.current || isAtBottom.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: hasInitialScrolled.current ? "smooth" : "auto",
        });
        hasInitialScrolled.current = true;
      }
    }
  }, [comments, filteredComments]);

  return (
    <div
      id="reply-form-section"
      className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-slate-400" />
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Diskusi Pribadi dengan Pelapor ({comments.length})
          </span>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Cari pesan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-red-400 focus:bg-white transition-all w-full sm:w-40"
            />
          </div>
          <button
            onClick={() => setFilterMediaOnly(!filterMediaOnly)}
            className={cn(
              "p-1.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer",
              filterMediaOnly 
                ? "bg-red-50 border-red-200 text-red-600 shadow-3xs" 
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
            title="Hanya tampilkan lampiran media"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Message thread */}
      <div 
        ref={scrollContainerRef} 
        onScroll={handleScroll}
        className="space-y-3 max-h-60 overflow-y-auto pr-1"
      >
        {filteredComments.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <MessageSquare className="h-6 w-6 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold">Belum ada pesan dalam diskusi ini.</p>
          </div>
        ) : (
          filteredComments.map((comment) => {
            const isOfficial = comment.isPic;
            return (
              <div
                key={comment.id}
                id={`comment-${comment.id}`}
                className={cn(
                  "p-3.5 rounded-2xl text-xs space-y-1.5 max-w-[90%] border shadow-3xs",
                  isOfficial
                    ? "bg-red-50/50 border-red-200/60 rounded-tr-none ml-auto"
                    : "bg-white border-slate-100 rounded-tl-none mr-auto"
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {complaint.isAnonymous && !isOfficial ? "Anonim" : comment.user?.name || "Anonim"}
                    </span>
                    {isOfficial && (
                      <span className="px-2 py-0.5 bg-[#b61722] text-white font-extrabold text-[8px] uppercase tracking-wider rounded-md">
                        Unit
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      type="button" 
                      onClick={() => setReplyingTo(comment)}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                      title="Balas pesan ini"
                    >
                      <Reply className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[9px] text-slate-400 font-semibold">
                      {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      {new Date(comment.createdAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Parent Quote Block */}
                {comment.parent && (
                  <div 
                    onClick={() => {
                      const el = document.getElementById(`comment-${comment.parent!.id}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        const originalBg = el.style.backgroundColor;
                        const originalTransition = el.style.transition;
                        el.style.transition = 'background-color 0.5s ease';
                        el.style.backgroundColor = '#fee2e2'; // Tailwind red-100
                        setTimeout(() => {
                          el.style.backgroundColor = originalBg;
                          setTimeout(() => {
                            el.style.transition = originalTransition;
                          }, 500);
                        }, 2000);
                      }
                    }}
                    className="p-2 bg-slate-100/80 border-l-2 border-red-500 rounded text-[10px] text-slate-500 font-medium cursor-pointer hover:bg-slate-200/50 transition-colors mt-1 mb-2"
                  >
                    <p className="font-bold text-red-600 mb-0.5">
                      {complaint.isAnonymous && !comment.parent.isPic
                        ? "Anonim"
                        : comment.parent.user?.name || (comment.parent.isPic ? "Unit" : "Anonim")}
                    </p>
                    <p className="line-clamp-2">{comment.parent.content}</p>
                  </div>
                )}
                <p className="text-slate-500 leading-relaxed font-semibold">
                  {comment.content}
                </p>
                {comment.evidenceUrl && (
                  <div className="mt-2.5">
                    {(() => {
                      const url = comment.evidenceUrl;
                      const isImage = checkIsImage(url);
                      return isImage ? (
                        <div 
                          className="relative h-40 max-w-xs rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
                          onClick={() => setSelectedFile({ url, isImage: true })}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt="Lampiran diskusi"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Eye className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => setSelectedFile({ url, isImage: false })}
                          className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors max-w-sm"
                        >
                          <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">
                              Dokumen Lampiran
                            </p>
                            <p className="text-[10px] text-slate-500">Klik untuk melihat file</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Inline reply form */}
      {complaint.status !== "DONE" ? (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          {/* Reply Banner */}
          {replyingTo && (
            <div className="flex items-center justify-between bg-slate-50 border-l-2 border-red-500 p-2 rounded-r-xl">
              <div>
                <p className="text-[10px] font-bold text-red-600">
                  Membalas {complaint.isAnonymous && !replyingTo.isPic
                    ? "Anonim"
                    : replyingTo.user?.name || (replyingTo.isPic ? "Unit" : "Anonim")}
                </p>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-medium">{replyingTo.content}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setReplyingTo(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Pratinjau Gambar */}
          {(replyFileUrl || isUploadingReplyFile) && (
            <div className="relative inline-block">
              {isUploadingReplyFile ? (
                <div className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin mb-1" />
                  <span className="text-[9px] font-bold">Uploading</span>
                </div>
              ) : (
                <div className="relative h-20 w-20 rounded-xl border border-slate-200 shadow-3xs group">
                  {replyFile?.type.startsWith("image/") || (replyFileUrl && checkIsImage(replyFileUrl)) ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={replyFileUrl!}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-xl cursor-pointer"
                      onClick={() => setSelectedFile({ url: replyFileUrl!, isImage: true })}
                    />
                  ) : (
                    <div 
                      className="h-full w-full flex flex-col items-center justify-center bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => setSelectedFile({ url: replyFileUrl!, isImage: false })}
                    >
                      <FileText className="h-6 w-6 text-blue-500 mb-1" />
                      <span className="text-[8px] font-bold text-slate-500 truncate w-full px-2 text-center">
                        {replyFile?.name || "Dokumen"}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={onRemoveReplyFile}
                    className="absolute -top-1.5 -right-1.5 bg-white text-slate-500 hover:text-red-500 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-slate-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={(e) => {
            e.preventDefault();
            onSubmitReply(e, replyingTo?.id);
            setReplyingTo(null);
          }} className="flex items-end gap-2">
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={onReplyFileChange}
              disabled={isUploadingReplyFile || isSendingReply}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingReplyFile || isSendingReply}
              className="w-[52px] h-[52px] shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-[0.98]"
              title="Lampirkan File/Gambar"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <textarea
              rows={2}
              required={!replyFileUrl}
              placeholder="Balas pesan pelapor..."
              value={replyText}
              onChange={(e) => onChangeReplyText(e.target.value)}
              disabled={isSendingReply || isUploadingReplyFile}
              className="flex-1 p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-red-400 resize-none font-medium"
            />
            <button
              type="submit"
              disabled={isSendingReply || isUploadingReplyFile || (!replyText.trim() && !replyFileUrl)}
              className="w-[52px] h-[52px] shrink-0 bg-[#b61722] hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-[0.98]"
            >
              {isSendingReply ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="pt-2 border-t border-slate-100 text-center text-[10px] text-slate-400 font-semibold">
          Keluhan ditutup. Diskusi dinonaktifkan.
        </div>
      )}

      {/* File/Image Preview Modal */}
      {selectedFile && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedFile(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
            className="absolute top-4 right-4 z-[10000] bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
            {!isSafeMediaUrl(selectedFile.url) ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-semibold text-center max-w-sm">
                Tautan media tidak valid atau tidak aman untuk ditampilkan.
              </div>
            ) : selectedFile.isImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img 
                src={selectedFile.url} 
                alt="Preview Full" 
                className="w-full h-full object-contain drop-shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <iframe 
                src={selectedFile.url} 
                className="w-11/12 h-5/6 rounded-xl shadow-2xl bg-white"
                onClick={(e) => e.stopPropagation()}
                title="Document Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
