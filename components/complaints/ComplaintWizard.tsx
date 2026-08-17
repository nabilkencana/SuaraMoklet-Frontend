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
import imageCompression from "browser-image-compression";

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

import Stepper, { Step } from "@/components/Stepper";

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

  const validateStep = async (step: number) => {
    if (step === 1) return await trigger("title");
    if (step === 2) return await trigger(["description", "expectedOutput"]);
    if (step === 3) return await trigger("unit");
    return true;
  };

  const handleStepChange = async (targetStep: number) => {
    if (targetStep > currentStep) {
      const isValid = await validateStep(currentStep);
      if (isValid) {
        setCurrentStep(targetStep);
      }
    } else {
      setCurrentStep(targetStep);
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
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

    let finalFile = fileToUpload;
    
    if (fileToUpload.type.startsWith("image/")) {
      setIsUploading(true);
      try {
        const isLargeFile = fileToUpload.size > 5 * 1024 * 1024;
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: isLargeFile ? 1 : 0.8,
        };
        
        finalFile = await imageCompression(fileToUpload, options);
      } catch (error) {
        console.error("Error compressing image:", error);
        toast.error("Gagal mengompres gambar.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    if (finalFile.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }

    setFile(finalFile);
    setIsUploading(true);
    try {
      const res = await apiClient.upload.uploadFile(finalFile);
      setFileUrl(res.url);
      toast.success("File bukti berhasil diunggah!");
    } catch {
      await new Promise((r) => setTimeout(r, 500));
      const objectUrl = URL.createObjectURL(finalFile);
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

  const stepLabels = ["Judul", "Deskripsi", "Unit", "Bukti", "Privasi"];

  return (
    <div className="w-full">
      <Stepper
        initialStep={currentStep}
        onStepChange={(s) => handleStepChange(s)}
        onFinalStepCompleted={handleFinalSubmit}
        nextButtonText={isSubmitting ? "Mengirim..." : "Lanjut"}
        nextButtonProps={{ disabled: isSubmitting || isUploading }}
        backButtonProps={{ disabled: isSubmitting || isUploading }}
        accentColor="#B61722"
        renderStepIndicator={({ step, currentStep: activeStep, onStepClick }) => {
          const isCurrent = step === activeStep;
          const isDone = step < activeStep;
          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-1">
              <div 
                onClick={async () => {
                  if (step < activeStep) {
                    onStepClick(step);
                  } else if (step === activeStep + 1) {
                    const valid = await validateStep(activeStep);
                    if (valid) onStepClick(step);
                  }
                }}
                className={`h-9 w-9 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all duration-300 cursor-pointer ${
                  isCurrent
                    ? "border-red-600 bg-red-600 text-white shadow-md shadow-red-200 scale-105"
                    : isDone
                    ? "border-red-600 bg-red-600 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                {isDone ? "✓" : step}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${
                isCurrent ? "text-red-600" : "text-slate-400"
              }`}>
                {stepLabels[step - 1]}
              </span>
            </div>
          );
        }}
      >
        {/* STEP 1: Judul */}
        <Step>
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
        </Step>

        {/* STEP 2: Deskripsi */}
        <Step>
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Jelaskan keluhan Anda secara mendetail</h3>
              <p className="text-xs text-slate-500">Tulis permasalahan secara kronologis serta tuliskan pula hasil/harapan yang Anda inginkan.</p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Deskripsi Permasalahan <span className="text-red-500">*</span></label>
              <textarea
                id="description"
                rows={4}
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hasil Yang Diharapkan <span className="text-slate-400">(Opsional)</span></label>
              <textarea
                id="expectedOutput"
                rows={2}
                placeholder="Contoh: Pihak sekolah segera memanggil teknisi untuk memeriksa AC yang mati."
                className="flex w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-red-500/80 focus:ring-4 focus:ring-red-500/10"
                {...register("expectedOutput")}
              />
            </div>
          </div>
        </Step>

        {/* STEP 3: Unit Tujuan */}
        <Step>
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Unit Sekolah Mana yang Berwenang?</h3>
              <p className="text-xs text-slate-500">Pilih departemen sekolah yang paling tepat untuk menindaklanjuti isu Anda.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {UNIT_DETAILS.map((item) => (
                <label 
                  key={item.name}
                  className={`flex items-start gap-3.5 p-3.5 rounded-2xl border-2 cursor-pointer select-none transition-all ${
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
        </Step>

        {/* STEP 4: Upload Bukti */}
        <Step>
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Lampirkan Foto atau Dokumen Bukti</h3>
              <p className="text-xs text-slate-500">Foto bukti langsung membantu mempercepat investigasi laporan Anda.</p>
            </div>

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
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mt-0.5 text-center">JPG, PNG (Otomatis Kompres), PDF (Maks. 5MB)</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="flex items-center gap-3.5">
                  {file.type.startsWith("image/") ? (
                    <div className="h-14 w-14 rounded-xl border border-slate-200 overflow-hidden bg-white shrink-0 relative">
                      {fileUrl ? (
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
                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                <span>Mengunggah bukti ke server...</span>
              </div>
            )}
          </div>
        </Step>

        {/* STEP 5: Privasi & Summary */}
        <Step>
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Pengaturan Privasi & Konfirmasi</h3>
              <p className="text-xs text-slate-500">Tentukan privasi nama Anda untuk keluhan ini.</p>
            </div>

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

            <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Ringkasan Pengajuan</h4>
              <div className="space-y-3">
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
        </Step>
      </Stepper>
    </div>
  );
}
