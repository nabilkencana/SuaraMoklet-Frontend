import React from "react";

export default function AuthHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain shrink-0" />
      <span className="text-xl font-bold tracking-tight text-neutral-900">
        Suara<span className="text-red-600">Moklet</span>
      </span>
    </div>
  );
}
