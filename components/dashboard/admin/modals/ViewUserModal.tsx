import React from "react";
import { X, User } from "lucide-react";

interface ViewUserModalProps {
  user: any | null;
  onClose: () => void;
}

export default function ViewUserModal({ user, onClose }: ViewUserModalProps) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-start">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
            Detail Pengguna
          </h3>
          <button
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-slate-655 hover:bg-slate-150 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <User className="h-10 w-10" />
          </div>
          <div className="text-center">
            <h4 className="text-lg font-bold text-slate-900">{user.name}</h4>
            <p className="text-xs font-medium text-slate-500">{user.email}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
              {user.phone || "-"}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 space-y-3 mt-4 border border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Role
            </span>
            <span className="text-xs font-bold text-slate-700">{user.role}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Unit
            </span>
            <span className="text-xs font-bold text-[#b61722]">{user.unitName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Status
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                user.status === "Active"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {user.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
