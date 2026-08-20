import React, { useState } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";

interface UserFormModalProps {
  isOpen: boolean;
  editingUserId: string | null;
  userFormData: {
    name: string;
    email: string;
    password: string;
    phone_number: string;
    role: string;
    userType: string;
  };
  isSubmitting: boolean;
  onClose: () => void;
  onChangeFormData: (
    updater: (prev: {
      name: string;
      email: string;
      password: string;
      phone_number: string;
      role: string;
      userType: string;
    }) => {
      name: string;
      email: string;
      password: string;
      phone_number: string;
      role: string;
      userType: string;
    }
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function UserFormModal({
  isOpen,
  editingUserId,
  userFormData,
  isSubmitting,
  onClose,
  onChangeFormData,
  onSubmit,
}: UserFormModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-xl animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-extrabold text-slate-800 text-lg">
            {editingUserId ? "Edit Pengguna" : "Tambah Pengguna Baru"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-655 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={userFormData.name}
              onChange={(e) =>
                onChangeFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-colors bg-slate-50 focus:bg-white"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={userFormData.email}
              onChange={(e) =>
                onChangeFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-colors bg-slate-50 focus:bg-white"
              placeholder="email@contoh.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password{" "}
              {editingUserId && (
                <span className="text-slate-400 font-normal">
                  (Kosongkan jika tidak ingin mengubah)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required={!editingUserId}
                value={userFormData.password}
                onChange={(e) =>
                  onChangeFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full h-11 px-4 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-colors bg-slate-50 focus:bg-white"
                placeholder="Minimal 8 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor HP</label>
            <input
              type="text"
              value={userFormData.phone_number}
              onChange={(e) =>
                onChangeFormData((prev) => ({
                  ...prev,
                  phone_number: e.target.value,
                }))
              }
              className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-colors bg-slate-50 focus:bg-white"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Role Sistem
              </label>
              <select
                value={userFormData.role}
                onChange={(e) =>
                  onChangeFormData((prev) => ({ ...prev, role: e.target.value }))
                }
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-colors bg-slate-50 focus:bg-white"
              >
                <option value="USER">User</option>
                <option value="SUPER_PIC">Super PIC</option>
                <option value="SUPERADMIN">Superadmin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tipe Pengguna
              </label>
              <select
                value={userFormData.userType}
                onChange={(e) =>
                  onChangeFormData((prev) => ({ ...prev, userType: e.target.value }))
                }
                className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-colors bg-slate-50 focus:bg-white"
              >
                <option value="SISWA">Siswa</option>
                <option value="GURU">Guru</option>
                <option value="KARYAWAN">Karyawan</option>
                <option value="ORANGTUA">Orangtua</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-11 border border-slate-200 hover:bg-slate-50 text-slate-655 font-bold rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 h-11 bg-[#b61722] hover:bg-red-650 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>{editingUserId ? "Simpan Perubahan" : "Simpan Pengguna"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
