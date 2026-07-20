"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Loader2, 
  ArrowLeft, 
  ArrowRight, 
  UploadCloud, 
  FileText, 
  X, 
  CheckCircle2, 
  ShieldCheck,
  Tag
} from "lucide-react";
import { toast } from "sonner";
import useComplaint from "@/hooks/useComplaint";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ComplaintUnit } from "@/types/complaint";
import { apiClient } from "@/lib/api";

const complaintSchema = z.object({
  title: z.string().min(5, "Judul keluhan minimal harus 5 karakter"),
  description: z.string().min(1, "Deskripsi keluhan tidak boleh kosong"),
  expectedOutput: z.string().optional(),
  unit: z.enum(["Umum (ISO)", "Sarpras", "Kurikulum", "Kesiswaan", "Hubin", "Tata Usaha"] as const),
  isAnonymous: z.boolean(),
});

const UNIT_DETAILS = [
  {
    name: "Umum (ISO)" as const,
    desc: "Kebijakan mutu pelayanan, kritik operasional umum, tata kelola, dan koordinasi sekolah.",
  },
  {
    name: "Sarpras" as const,
    desc: "Kerusakan sarana prasarana sekolah, fasilitas kelas, AC/listrik, kebersihan, dan gedung.",
  },
  {
    name: "Kurikulum" as const,
    desc: "Proses pembelajaran kelas, jadwal pelajaran, kegiatan akademis, ujian/tes, dan rapor.",
  },
  {
    name: "Kesiswaan" as const,
    desc: "Tata tertib, kedisiplinan siswa, beasiswa, ekstrakurikuler, OSIS/MPK, dan pembinaan karakter.",
  },
  {
    name: "Hubin" as const,
    desc: "Kerjasama luar, program magang/PKL, kunjungan industri, dan hubungan alumni/karir.",
  },
  {
    name: "Tata Usaha" as const,
    desc: "Surat-menyurat, legalisir ijazah/rapor, kartu pelajar, keuangan, dan dokumen administrasi.",
  },
];

type ComplaintFormData = z.infer<typeof complaintSchema>;

export default function ComplaintWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const { createComplaint } = useComplaint(undefined, { skipFetchUnits: true });

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: "",
      description: "",
      expectedOutput: "",
      unit: "Umum (ISO)",
      isAnonymous: false,
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const titleParam = searchParams.get("title");
      if (titleParam) {
        setValue("title", titleParam);
      }
    }
  }, [setValue]);

  const watchedTitle = watch("title");
  const watchedUnit = watch("unit");
  const watchedIsAnonymous = watch("isAnonymous");

  const nextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger("title");
    } else if (currentStep === 2) {
      isValid = await trigger(["description", "expectedOutput"]);
    } else if (currentStep === 3) {
      isValid = await trigger("unit");
    } else {
      isValid = true;
    }

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      await processFile(droppedFile);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await processFile(selectedFile);
    }
  };

  const processFile = async (fileToUpload: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(fileToUpload.type)) {
      toast.error("Format file tidak didukung! Gunakan JPG, PNG, atau PDF.");
      return;
    }

    // Validate file size: max 5MB
    if (fileToUpload.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }

    setFile(fileToUpload);
    setIsUploading(true);
    try {
      const res = await apiClient.upload.uploadFile(fileToUpload);
      setFileUrl(res.url);
      toast.success("File bukti berhasil diunggah!");
    } catch {
      // Fallback: buat object URL lokal ketika backend tidak tersedia
      await new Promise((r) => setTimeout(r, 500));
      const objectUrl = URL.createObjectURL(fileToUpload);
      setFileUrl(objectUrl);
      toast.success("File bukti berhasil dilampirkan! (Mode Demo)");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileUrl(null);
    toast.info("File lampiran dihapus");
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const payload = {
      title: getValues("title"),
      description: getValues("description"),
      expectedOutput: getValues("expectedOutput"),
      unit: getValues("unit"),
      isAnonymous: getValues("isAnonymous"),
      evidenceUrl: fileUrl || undefined,
    };

    const res = await createComplaint(payload);
    setIsSubmitting(false);
    if (res) {
      router.push(`/complaints/${res.id}`);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between min-h-[500px]">
      {/* Step Indicator Header */}
      <div>
        <div className="relative flex items-center justify-between mb-8">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 z-0" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-red-600 z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />

          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-2">
              <div 
                className={`h-9 w-9 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all duration-300 ${
                  step === currentStep
                    ? "border-red-600 bg-red-50 text-red-600 shadow-sm shadow-red-100"
                    : step < currentStep
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {step < currentStep ? "✓" : step}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${
                step === currentStep ? "text-red-600" : "text-slate-400"
              }`}>
                {step === 1 ? "Judul" : step === 2 ? "Deskripsi" : step === 3 ? "Unit" : step === 4 ? "Bukti" : "Privasi"}
              </span>
            </div>
          ))}
        </div>

        {/* Wizard Form Sections */}
        <div className="space-y-6 min-h-[250px]">
          {/* STEP 1: Judul */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Apa masalah utama yang ingin Anda sampaikan?</h3>
                <p className="text-xs text-slate-500">Berikan judul singkat dan jelas agar mudah dipahami oleh pihak sekolah.</p>
              </div>
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Judul Keluhan <span className="text-red-500">*</span></label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Contoh: AC Laboratorium RPL 2 Sering Mati"
                  className={errors.title ? "border-red-500/60 focus:border-red-500" : ""}
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-xs font-medium text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Deskripsi */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Jelaskan keluhan Anda secara mendetail</h3>
                <p className="text-xs text-slate-500">Tulis permasalahan secara kronologis serta tuliskan pula hasil/harapan yang Anda inginkan.</p>
              </div>

              {/* Description */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Deskripsi Permasalahan <span className="text-red-500">*</span></label>
                <textarea
                  id="description"
                  rows={5}
                  placeholder="Jelaskan detail permasalahan agar admin dapat meninjau dengan lengkap..."
                  className={`flex w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-red-500/80 focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.description ? "border-red-500/60 focus:border-red-500" : ""
                  }`}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-xs font-medium text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Expected Output */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hasil Yang Diharapkan <span className="text-slate-400">(Opsional)</span></label>
                <textarea
                  id="expectedOutput"
                  rows={3}
                  placeholder="Contoh: Pihak sekolah segera memanggil teknisi untuk memeriksa AC yang mati."
                  className="flex w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-red-500/80 focus:ring-4 focus:ring-red-500/10"
                  {...register("expectedOutput")}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Unit Tujuan */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Unit Sekolah Mana yang Berwenang?</h3>
                <p className="text-xs text-slate-500">Pilih departemen sekolah yang paling tepat untuk menindaklanjuti isu Anda.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {UNIT_DETAILS.map((item) => (
                  <label 
                    key={item.name}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer select-none transition-all ${
                      watchedUnit === item.name 
                        ? "border-red-650 bg-red-50/50 text-red-750 shadow-xs" 
                        : "border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-700"
                    }`}
                  >
                    <input 
                      type="radio" 
                      value={item.name} 
                      className="mt-1 text-red-600 focus:ring-red-550/20 cursor-pointer"
                      {...register("unit")}
                    />
                    <div className="space-y-1">
                      <span className="text-sm font-bold block">{item.name}</span>
                      <span className={`text-[10px] leading-relaxed block transition-colors ${
                        watchedUnit === item.name ? "text-red-700/80 font-medium" : "text-slate-400"
                      }`}>
                        {item.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.unit && (
                <p className="text-xs font-medium text-red-600 mt-1">{errors.unit.message}</p>
              )}
            </div>
          )}

          {/* STEP 4: Upload Bukti */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Lampirkan Foto atau Dokumen Bukti</h3>
                <p className="text-xs text-slate-500">Foto bukti langsung membantu mempercepat investigasi laporan Anda.</p>
              </div>

              {/* Upload Dropzone */}
              {/* Hidden file input controlled via ref */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />

              {!file ? (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer select-none ${
                    isDragOver 
                      ? "border-red-600 bg-red-50/40" 
                      : "border-slate-300 hover:border-red-400 hover:bg-red-50/20 bg-slate-50/50"
                  }`}
                >
                  <div className="h-12 w-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-sm">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors">
                      Unggah file bukti
                    </span>
                    <p className="text-xs text-slate-400 mt-1">atau seret dan taruh di sini</p>
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mt-1">JPG, JPEG, PNG, atau PDF (Maks. 5MB)</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div className="flex items-center gap-3.5">
                    {file.type.startsWith("image/") ? (
                      <div className="h-16 w-16 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 relative">
                        {fileUrl ? (
                          <img src={fileUrl} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-xl border border-slate-200 bg-white shrink-0 flex items-center justify-center text-red-600">
                        <FileText className="h-8 w-8" />
                      </div>
                    )}
                    <div className="space-y-0.5 text-center sm:text-left">
                      <p className="text-sm font-bold text-slate-800 line-clamp-1">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={removeFile}
                    className="h-8 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              )}

              {isUploading && (
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium pt-2">
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-red-600" />
                  <span>Mengunggah bukti ke server...</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Privasi & Summary */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Pengaturan Privasi & Konfirmasi</h3>
                <p className="text-xs text-slate-500">Tentukan privasi nama Anda untuk keluhan ini.</p>
              </div>

              {/* Anonymity Toggle Card */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex items-start gap-3.5">
                <input 
                  type="checkbox" 
                  id="isAnonymous" 
                  className="mt-1 text-red-600 focus:ring-red-500/20 h-4.5 w-4.5 rounded"
                  {...register("isAnonymous")}
                />
                <div className="space-y-1 cursor-pointer select-none flex-1">
                  <label htmlFor="isAnonymous" className="text-sm font-bold text-slate-800 block">Kirim Sebagai Anonim</label>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Nama Anda tidak akan ditampilkan kepada publik atau siswa lain di platform. Hanya pihak unit pengelola berwenang yang dapat melihat identitas Anda untuk kebutuhan klarifikasi internal.
                  </p>
                </div>
              </div>

              {/* Summary Card */}
              <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Ringkasan Pengajuan</h4>
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Judul Keluhan</span>
                    <span className="text-sm font-bold text-slate-800 leading-snug mt-0.5 block">{watchedTitle}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unit Sekolah</span>
                      <span className="text-sm font-semibold text-slate-700 mt-0.5 block">{watchedUnit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tingkat Privasi</span>
                      <span className="text-sm font-semibold text-slate-700 mt-0.5 block">
                        {watchedIsAnonymous ? "Anonim" : "Publik (Terlihat)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-6">
        {currentStep > 1 ? (
          <Button 
            type="button" 
            variant="outline" 
            onClick={prevStep}
            disabled={isSubmitting || isUploading}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span>Kembali</span>
          </Button>
        ) : (
          <div /> // placeholder for alignment
        )}

        {currentStep < 5 ? (
          <Button 
            type="button" 
            onClick={nextStep}
            disabled={isUploading}
          >
            <span>Lanjut</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={handleFinalSubmit}
            disabled={isSubmitting || isUploading}
            className="bg-red-600 hover:bg-red-700 shadow-md shadow-red-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <span>Kirim Keluhan</span>
                <CheckCircle2 className="h-4 w-4 ml-1.5" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
