import React, { RefObject } from "react";
import { UploadCloud, FileText, X, Loader2, Plus, ImageIcon } from "lucide-react";

interface StepMediaUploadProps {
  files: File[];
  fileUrls: string[];
  isUploading: boolean;
  isDragOver: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

export default function StepMediaUpload({
  files = [],
  fileUrls = [],
  isUploading,
  isDragOver,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onRemoveFile,
}: StepMediaUploadProps) {
  const maxFiles = 5;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">
          Lampirkan Foto atau Dokumen Bukti
        </h3>
        <p className="text-xs text-slate-500">
          Foto bukti langsung membantu mempercepat investigasi laporan Anda. Anda dapat mengunggah hingga {maxFiles} foto/dokumen.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        className="hidden"
        onChange={onFileChange}
      />

      {files.length === 0 ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer select-none ${
            isDragOver
              ? "border-red-600 bg-red-50/40"
              : "border-slate-300 hover:border-red-400 hover:bg-red-50/20 bg-slate-50/50"
          }`}
        >
          <div className="h-12 w-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-xs">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div className="text-center">
            <span className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors">
              Pilih satu atau beberapa foto bukti
            </span>
            <p className="text-xs text-slate-400 mt-0.5">atau seret dan taruh di sini</p>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mt-0.5 text-center">
            JPG, PNG, WEBP, PDF (Maks. 5 file, masing-masing 5MB)
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {files.map((file, idx) => {
              const url = fileUrls[idx];
              const isImage = file.type.startsWith("image/");

              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl p-3 bg-slate-50/60 flex items-center gap-3 justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isImage ? (
                      <div className="h-12 w-12 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 relative">
                        {url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-xl border border-slate-200 bg-white shrink-0 flex items-center justify-center text-red-600">
                        <FileText className="h-6 w-6" />
                      </div>
                    )}
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                      <p className="text-[10.5px] text-slate-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveFile(idx)}
                    className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                    title="Hapus foto"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {files.length < maxFiles && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-11 rounded-2xl border-2 border-dashed border-slate-200 hover:border-red-500 hover:bg-red-50/20 text-slate-500 hover:text-red-600 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Foto/Dokumen Lainnya ({files.length}/{maxFiles})</span>
            </button>
          )}
        </div>
      )}

      {isUploading && (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium pt-1">
          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
          <span>Mengunggah bukti ke server...</span>
        </div>
      )}
    </div>
  );
}
