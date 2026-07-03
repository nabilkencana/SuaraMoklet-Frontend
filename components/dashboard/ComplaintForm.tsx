import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Upload, 
  FileText, 
  X, 
  Loader2, 
  Send, 
  AlertCircle, 
  UserX, 
  UserCheck 
} from "lucide-react";
import { toast } from "sonner";
import { useComplaint } from "@/hooks/useComplaint";
import { ComplaintUnit } from "@/types/complaint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Validation schema
const complaintSchema = z.object({
  title: z.string().min(5, "Judul keluhan minimal 5 karakter").max(100, "Judul terlalu panjang (maksimal 100 karakter)"),
  unit: z.string().min(1, "Harap pilih unit kerja tujuan"),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH"]),
  description: z.string().min(15, "Deskripsi keluhan minimal harus 15 karakter"),
  isAnonymous: z.boolean(),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

interface ComplaintFormProps {
  onSuccessSubmit?: () => void;
}

export default function ComplaintForm({ onSuccessSubmit }: ComplaintFormProps) {
  const { units, createComplaint, uploadEvidence, isSubmitting } = useComplaint();
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: "",
      unit: "",
      urgency: "MEDIUM",
      description: "",
      isAnonymous: false,
    },
  });

  const isAnonymousValue = watch("isAnonymous");
  const selectedUnit = watch("unit");
  const selectedUrgency = watch("urgency");

  // File type and size validations
  const validateFile = (selectedFile: File): boolean => {
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Format file tidak didukung. Harap unggah PNG, JPG, JPEG, atau PDF.");
      return false;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file melebihi batas 5MB.");
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        if (selectedFile.type.startsWith("image/")) {
          setFilePreview(URL.createObjectURL(selectedFile));
        } else {
          setFilePreview(null);
        }
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        if (droppedFile.type.startsWith("image/")) {
          setFilePreview(URL.createObjectURL(droppedFile));
        } else {
          setFilePreview(null);
        }
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmitForm = async (data: ComplaintFormData) => {
    let evidenceUrl = "";
    
    if (file) {
      setIsUploading(true);
      const url = await uploadEvidence(file);
      setIsUploading(false);
      if (url) {
        evidenceUrl = url;
      } else {
        toast.error("Gagal mengunggah berkas pendukung.");
        return;
      }
    }

    // Append urgency into description context so backend is aware
    const finalDescription = `[URGENSI: ${data.urgency}]\n\n${data.description}`;

    const res = await createComplaint({
      title: data.title,
      description: finalDescription,
      unit: data.unit as ComplaintUnit,
      isAnonymous: data.isAnonymous,
      evidenceUrl: evidenceUrl || undefined,
    });

    if (res) {
      reset();
      setFile(null);
      setFilePreview(null);
      if (onSuccessSubmit) {
        onSuccessSubmit();
      }
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header Form */}
      <div className="bg-red-600 text-white p-5 flex items-center justify-between">
        <h3 className="text-base font-bold tracking-tight">Lapor Sekarang</h3>
        <Upload className="h-4.5 w-4.5 text-red-100" />
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Judul Keluhan
          </label>
          <Input
            id="title"
            placeholder="Singkat dan jelas..."
            className={errors.title ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/10" : ""}
            {...register("title")}
          />
          {errors.title && (
            <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Dropdowns row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Unit Dropdown */}
          <div className="space-y-1.5">
            <label htmlFor="unit" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Pilih Unit
            </label>
            <div className="relative">
              <select
                id="unit"
                className={`w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all ${
                  errors.unit ? "border-red-500/60" : ""
                }`}
                {...register("unit")}
              >
                <option value="">Pilih Unit Kerja...</option>
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            {errors.unit && (
              <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.unit.message}
              </p>
            )}
          </div>

          {/* Urgency Dropdown */}
          <div className="space-y-1.5">
            <label htmlFor="urgency" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Tingkat Urgensi
            </label>
            <select
              id="urgency"
              className={`w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all ${
                errors.urgency ? "border-red-500/60" : ""
              }`}
              {...register("urgency")}
            >
              <option value="LOW">Rendah (Low)</option>
              <option value="MEDIUM">Sedang (Medium)</option>
              <option value="HIGH">Tinggi (High)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Isi Keluhan
          </label>
          <Textarea
            id="description"
            rows={5}
            placeholder="Deskripsikan keluhan Anda secara detail beserta kronologi jika ada..."
            className={`resize-none ${
              errors.description ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/10" : ""
            }`}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3" />
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Drag & Drop File Upload */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Lampiran Pendukung (Opsional)
          </label>
          
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer select-none transition-all flex flex-col items-center justify-center gap-2.5 ${
                isDragActive
                  ? "border-red-500 bg-red-50/40 text-red-600"
                  : "border-slate-200 hover:border-red-300 hover:bg-slate-50 text-slate-450"
              }`}
            >
              <Upload className="h-8 w-8 stroke-[1.5]" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-700">Klik untuk unggah atau seret file ke sini</p>
                <p className="text-[10px] text-slate-400 font-semibold">PNG, JPG, PDF (MAX 5MB)</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".png,.jpg,.jpeg,.pdf"
                className="hidden"
              />
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-3.5 min-w-0">
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-slate-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="h-8 w-8 rounded-xl bg-white border border-slate-200 text-slate-450 hover:text-red-600 flex items-center justify-center hover:bg-red-50/40 hover:border-red-200 transition-colors shadow-sm cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Anonymous Toggle */}
        <div className="bg-slate-50/80 border border-slate-150 rounded-2xl p-4 flex items-center justify-between gap-6">
          <div className="flex gap-3 items-start min-w-0">
            <div className={`p-2 rounded-xl shrink-0 ${isAnonymousValue ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-550"}`}>
              {isAnonymousValue ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Kirim sebagai Anonim</p>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-0.5">Identitas Anda tidak akan terlihat oleh publik.</p>
            </div>
          </div>
          
          {/* Custom Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isAnonymousValue}
              onChange={(e) => setValue("isAnonymous", e.target.checked)}
            />
            <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-500/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          {isSubmitting || isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span>Kirim Keluhan</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
