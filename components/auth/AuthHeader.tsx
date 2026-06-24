import React from "react";
import { Megaphone } from "lucide-react";

export default function AuthHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-md shadow-red-600/20">
        <Megaphone className="h-5.5 w-5.5 text-white" />
      </div>
      <span className="text-xl font-bold tracking-tight text-neutral-900">
        Suara<span className="text-red-600">Moklet</span>
      </span>
    </div>
  );
}
