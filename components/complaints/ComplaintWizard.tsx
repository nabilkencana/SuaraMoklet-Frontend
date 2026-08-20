"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import useComplaint from "@/hooks/useComplaint";
import { apiClient } from "@/lib/api";
import imageCompression from "browser-image-compression";
import Stepper, { Step } from "@/components/Stepper";

// Wizard Subcomponents & Types
import { complaintSchema, ComplaintFormData } from "./wizard/types";
import StepTitle from "./wizard/StepTitle";
import StepDescription from "./wizard/StepDescription";
import StepUnitCategory from "./wizard/StepUnitCategory";
import StepMediaUpload from "./wizard/StepMediaUpload";
import StepReviewSubmit from "./wizard/StepReviewSubmit";

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
      unit: "",
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

  // Upload Logic
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processAndUploadFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processAndUploadFile(e.dataTransfer.files[0]);
    }
  };

  const processAndUploadFile = async (rawFile: File) => {
    try {
      setIsUploading(true);
      let fileToUpload = rawFile;

      if (rawFile.type.startsWith("image/")) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        try {
          fileToUpload = await imageCompression(rawFile, options);
        } catch (compressionError) {
          console.warn("Image compression failed, using original file:", compressionError);
        }
      }

      setFile(fileToUpload);

      const response = await apiClient.upload(fileToUpload);
      if (response && response.url) {
        setFileUrl(response.url);
        toast.success("Foto berhasil diunggah");
      } else {
        throw new Error("Format respon tidak valid");
      }
    } catch (err: any) {
      toast.error("Gagal mengunggah foto", {
        description: err.response?.data?.message || err.message || "Silakan coba lagi",
      });
      setFile(null);
      setFileUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: ComplaintFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title,
        description: data.description,
        expectedOutput: data.expectedOutput,
        unit: data.unit,
        isAnonymous: data.isAnonymous,
        evidenceUrl: fileUrl || undefined,
      };

      const result = await createComplaint(payload);
      if (result) {
        toast.success("Aspirasi Berhasil Diajukan!", {
          description: "Laporan Anda telah masuk ke sistem dan akan segera ditindaklanjuti.",
        });
        router.push(`/complaints/${result.id}`);
      }
    } catch (err: any) {
      toast.error("Gagal mengajukan aspirasi", {
        description: err.message || "Terjadi kesalahan pada server. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <Stepper
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onBeforeNext={async (step) => {
          if (step === 1) return await trigger("title");
          if (step === 2) return await trigger(["description", "expectedOutput"]);
          if (step === 3) return await trigger("unit");
          return true;
        }}
        onFinalStepCompleted={() => {
          const values = getValues();
          onSubmit(values);
        }}
        isSubmitting={isSubmitting}
        renderCustomButton={(step, isFinal, isCurrent, nextStep, prevStep) => {
          if (!isCurrent) return null;
          return (
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1 || isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors cursor-pointer"
              >
                Kembali
              </button>

              <button
                type="button"
                onClick={async () => {
                  const isValid = await validateStep(step);
                  if (isValid) {
                    if (isFinal) {
                      const values = getValues();
                      onSubmit(values);
                    } else {
                      nextStep();
                    }
                  }
                }}
                disabled={isSubmitting || (step === 4 && isUploading)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Mengirim...</span>
                ) : isFinal ? (
                  <span>Kirim Laporan</span>
                ) : (
                  <span>Lanjutkan</span>
                )}
              </button>
            </div>
          );
        }}
      >
        <Step>
          <StepTitle register={register} errors={errors} />
        </Step>

        <Step>
          <StepDescription register={register} errors={errors} />
        </Step>

        <Step>
          <StepUnitCategory
            register={register}
            errors={errors}
            watchedUnit={watchedUnit}
          />
        </Step>

        <Step>
          <StepMediaUpload
            file={file}
            fileUrl={fileUrl}
            isUploading={isUploading}
            isDragOver={isDragOver}
            fileInputRef={fileInputRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileChange={handleFileChange}
            onRemoveFile={removeFile}
          />
        </Step>

        <Step>
          <StepReviewSubmit
            register={register}
            watchedTitle={watchedTitle}
            watchedUnit={watchedUnit}
            watchedIsAnonymous={watchedIsAnonymous}
          />
        </Step>
      </Stepper>
    </div>
  );
}
