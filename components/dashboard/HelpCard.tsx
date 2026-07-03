import React from "react";
import { HelpCircle, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HelpCard() {
  const handleContactAdmin = () => {
    window.open("https://wa.me/6281234567890", "_blank");
  };

  return (
    <div className="relative overflow-hidden bg-[#111111] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between h-[210px]">
      {/* Overlay background pattern */}
      <div className="absolute right-[-10px] bottom-[-20px] text-white/5 pointer-events-none select-none">
        <GraduationCap className="h-32 w-32 stroke-[1.5]" />
      </div>

      <div className="space-y-2 relative z-10">
        <h3 className="text-base font-bold tracking-tight">Butuh Bantuan?</h3>
        <p className="text-xs text-neutral-400 leading-relaxed max-w-[240px]">
          Jika Anda mengalami kendala teknis atau memiliki pertanyaan mendesak, hubungi administrator sekolah.
        </p>
      </div>

      <Button
        onClick={handleContactAdmin}
        variant="secondary"
        className="w-full relative z-10 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-sm font-bold text-xs py-2 rounded-xl group active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Hubungi Admin</span>
      </Button>
    </div>
  );
}
