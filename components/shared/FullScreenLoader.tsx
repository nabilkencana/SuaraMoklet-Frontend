import React from 'react';

export default function FullScreenLoader() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50/60 backdrop-blur-xl z-[100] fixed inset-0 overflow-hidden">
      <div className="relative flex items-center justify-center">
        {/* Subtle Animated Blur Orbs */}
        <div className="absolute h-64 w-64 bg-slate-300 rounded-full blur-[60px] opacity-20 animate-pulse scale-150 duration-[2000ms]" />
        <div className="absolute h-48 w-48 bg-white rounded-full blur-[50px] opacity-40 animate-ping duration-[2000ms] delay-300" />
        <div className="absolute h-32 w-32 bg-slate-200 rounded-full blur-[40px] opacity-30 animate-pulse scale-110 duration-[1500ms]" />
      </div>
    </div>
  );
}
