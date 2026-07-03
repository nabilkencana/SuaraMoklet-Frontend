import React, { useRef, useState } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { toast } from "sonner";

interface ProfileAvatarProps {
  avatarUrl?: string;
  userName: string;
  onUpload: (file: File) => Promise<string | null>;
  isUploading: boolean;
}

export default function ProfileAvatar({
  avatarUrl,
  userName,
  onUpload,
  isUploading,
}: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleContainerClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // 1. Validate file format
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Format berkas tidak didukung!", {
        description: "Gunakan format PNG, JPG, atau JPEG.",
      });
      return;
    }

    // 2. Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar!", {
        description: "Batas ukuran file maksimal adalah 5MB.",
      });
      return;
    }

    // Create a local object URL for instant preview
    const localUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(localUrl);

    try {
      await onUpload(selectedFile);
    } catch {
      setPreviewUrl(null);
    }
  };

  const currentImg = previewUrl || avatarUrl;

  return (
    <div className="relative group shrink-0 select-none">
      {/* Avatar Display wrapper */}
      <div
        onClick={handleContainerClick}
        className={`h-28 w-28 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-slate-400 font-extrabold shadow-md overflow-hidden relative transition-all duration-300 ${
          isUploading ? "cursor-not-allowed opacity-80" : "cursor-pointer group-hover:scale-102 group-hover:shadow-lg"
        }`}
      >
        {currentImg ? (
          <img
            src={currentImg}
            alt={userName}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-10 w-10 text-slate-350" />
        )}

        {/* Hover overlay and Upload text / indicator */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-300 ${
            isUploading
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      </div>

      {/* Camera Icon Floating badge button */}
      {!isUploading && (
        <button
          onClick={handleContainerClick}
          type="button"
          className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white flex items-center justify-center shadow transition-all cursor-pointer border border-white/80"
        >
          <Camera className="h-4 w-4" />
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
