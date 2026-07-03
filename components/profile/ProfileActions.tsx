import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileActionsProps {
  onCancel: () => void;
  isSaving: boolean;
  isDirty: boolean;
}

export default function ProfileActions({
  onCancel,
  isSaving,
  isDirty,
}: ProfileActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSaving}
        className="px-6 h-11 rounded-xl font-bold transition-all active:scale-[0.98] cursor-pointer hover:bg-slate-50 text-slate-700 border-slate-200"
      >
        Batal
      </Button>
      <Button
        type="submit"
        disabled={isSaving || !isDirty}
        className="px-6 h-11 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-sm shadow-red-900/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            <span>Simpan...</span>
          </>
        ) : (
          <span>Simpan Perubahan</span>
        )}
      </Button>
    </div>
  );
}
