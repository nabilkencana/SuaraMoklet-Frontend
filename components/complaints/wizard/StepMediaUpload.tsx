import React, { RefObject } from "react";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";

interface StepMediaUploadProps {
  file: File | null;
  fileUrl: string | null;
  isUploading: boolean;
  isDragOver: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

export default function StepMediaUpload({
  file,
  fileUrl,
  isUploading,
  isDragOver,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onRemoveFile,
}: StepMediaUploadProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">
          Lampirkan Foto atau Dokumen Bukti
        </h3>
        <p className="text-xs text-slate-500">
          Foto bukti langsung membantu mempercepat investigasi laporan Anda.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={onFileChange}
      />

      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer select-none ${
            isDragOver
              ? "border-red-600 bg-red-50/40"
              : "border-slate-300 hover:border-red-400 hover:bg-red-50/20 bg-slate-50/50"
          }`}
        >
          <div className="h-10 w-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-sm">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors">
              Unggah file bukti
            </span>
            <p className="text-xs text-slate-400 mt-0.5">atau seret dan taruh di sini</p>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mt-0.5 text-center">
            JPG, PNG (Otomatis Kompres), PDF (Maks. 5MB)
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3.5">
            {file.type.startsWith("image/") ? (
              <div className="h-14 w-14 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 relative">
                {fileUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fileUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-14 w-14 rounded-xl border border-slate-200 bg-white shrink-0 flex items-center justify-center text-red-600">
                <FileText className="h-7 w-7" />
              </div>
            )}
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="text-sm font-bold text-slate-800 line-clamp-1">{file.name}</p>
              <p className="text-xs text-slate-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveFile}
            className="h-8 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      )}

      {isUploading && (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium pt-2">
          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
          <span>Mengunggah bukti ke server...</span>
        </div>
      )}
    </div>
  );
}
