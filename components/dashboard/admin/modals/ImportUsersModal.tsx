import React from "react";
import { Download, X, FileText, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnitModel } from "@/types/complaint";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface ImportUsersModalProps {
  isOpen: boolean;
  importStep: number;
  importFile: File | null;
  importData: any[];
  units: UnitModel[];
  isSubmitting: boolean;
  onClose: () => void;
  onSetImportFile: (file: File | null) => void;
  onSetImportStep: (step: number) => void;
  onSetImportData: (data: any[]) => void;
  onSuccess: () => void;
  setIsSubmitting: (loading: boolean) => void;
}

export default function ImportUsersModal({
  isOpen,
  importStep,
  importFile,
  importData,
  units,
  isSubmitting,
  onClose,
  onSetImportFile,
  onSetImportStep,
  onSetImportData,
  onSuccess,
  setIsSubmitting,
}: ImportUsersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={cn(
          "bg-white rounded-3xl p-6 w-full shadow-xl space-y-5 animate-in fade-in zoom-in duration-150 transition-all",
          importStep === 1 ? "max-w-md" : "max-w-4xl"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Import Pengguna</h3>
              <p className="text-[11px] text-slate-400">
                {importStep === 1
                  ? "Pilih dan verifikasi data pengguna"
                  : "Verifikasi & Edit Data"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onSetImportStep(1);
              onSetImportFile(null);
            }}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {importStep === 1 ? (
          <div className="space-y-4">
            {importFile ? (
              <div className="border-2 border-dashed border-[#b61722]/50 bg-red-50/30 rounded-xl p-6 flex items-center justify-between transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center text-[#b61722]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{importFile.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(importFile.size / 1024).toFixed(1)} KB • Siap diimport
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onSetImportFile(null)}
                  className="h-8 w-8 rounded-lg hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[#b61722]/50 hover:bg-red-50/10 transition-all cursor-pointer relative group">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onSetImportFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="h-12 w-12 rounded-full bg-slate-100 group-hover:bg-red-100 flex items-center justify-center text-slate-400 group-hover:text-[#b61722] transition-colors mb-3">
                  <Upload className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-[#b61722] transition-colors">
                  Pilih file CSV atau Excel
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  atau drag & drop di sini. Maksimal ukuran file 5MB
                </span>
              </div>
            )}

            {/* Format Preview & Download */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Preview Format Kolom</span>
                <button
                  onClick={() => {
                    const csvContent =
                      "data:text/csv;charset=utf-8,Nama,Email,Nomor HP,Role,Unit\nBudi Santoso,budi@moklet.org,08123456789,Siswa,\nSiti Aminah,siti@moklet.org,08987654321,Guru,Kurikulum\nAgus Supriyanto,agus@example.com,08111222333,Orangtua,";
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "format_import_pengguna.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="text-[10px] font-bold text-[#b61722] hover:text-red-650 flex items-center gap-1.5 cursor-pointer bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-100 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  Download Format (.csv)
                </button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left border-collapse text-[10px] min-w-125">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <th className="p-2 font-semibold">Nama</th>
                      <th className="p-2 font-semibold border-l border-slate-200">Email</th>
                      <th className="p-2 font-semibold border-l border-slate-200">Nomor HP</th>
                      <th className="p-2 font-semibold border-l border-slate-200">Role</th>
                      <th className="p-2 font-semibold border-l border-slate-200">Unit (Opsional)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-slate-600 divide-y divide-slate-100">
                    <tr>
                      <td className="p-2">Budi Santoso</td>
                      <td className="p-2 border-l border-slate-100">budi@moklet.org</td>
                      <td className="p-2 border-l border-slate-100">08123456789</td>
                      <td className="p-2 border-l border-slate-100">Siswa</td>
                      <td className="p-2 border-l border-slate-100 text-slate-400 italic">kosong</td>
                    </tr>
                    <tr>
                      <td className="p-2">Siti Aminah</td>
                      <td className="p-2 border-l border-slate-100">siti@moklet.org</td>
                      <td className="p-2 border-l border-slate-100">08987654321</td>
                      <td className="p-2 border-l border-slate-100">Guru</td>
                      <td className="p-2 border-l border-slate-100">Kurikulum</td>
                    </tr>
                    <tr>
                      <td className="p-2">Agus Supriyanto</td>
                      <td className="p-2 border-l border-slate-100">agus@example.com</td>
                      <td className="p-2 border-l border-slate-100">08111222333</td>
                      <td className="p-2 border-l border-slate-100">Orangtua</td>
                      <td className="p-2 border-l border-slate-100 text-slate-400 italic">kosong</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSetImportFile(null);
                }}
                className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold rounded-xl transition-all text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  if (!importFile) return;

                  try {
                    setIsSubmitting(true);
                    const res = await apiClient.users.bulkImportPreview(importFile);
                    onSetImportData(res.data || []);
                    onSetImportStep(2);
                  } catch (err: any) {
                    toast.error(err?.response?.data?.message || "Gagal memproses file");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting || !importFile}
                className={cn(
                  "flex-1 h-10 font-extrabold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5",
                  !importFile
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-[#b61722] hover:bg-red-650 text-white shadow-xs cursor-pointer active:scale-[0.98]"
                )}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Preview Data"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-800">Total Data:</span> {importData.length}
              </div>
              <div className="text-red-600">
                <span className="font-bold">Error:</span>{" "}
                {importData.filter((d: any) => !d.isValid).length}
              </div>
              <div className="text-amber-600">
                <span className="font-bold">Ganda:</span>{" "}
                {importData.filter((d: any) => d.isDuplicate).length}
              </div>
            </div>

            <div className="overflow-y-auto max-h-100 border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-[11px] min-w-200">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0 z-10">
                    <th className="p-2 font-semibold">Nama</th>
                    <th className="p-2 font-semibold border-l border-slate-200">Email</th>
                    <th className="p-2 font-semibold border-l border-slate-200">Nomor HP</th>
                    <th className="p-2 font-semibold border-l border-slate-200">Role</th>
                    <th className="p-2 font-semibold border-l border-slate-200">Unit</th>
                    <th className="p-2 font-semibold border-l border-slate-200 w-48">
                      Status / Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-600">
                  {importData.map((row, i) => (
                    <tr
                      key={i}
                      className={cn(
                        !row.isValid ? "bg-red-50" : row.isDuplicate ? "bg-amber-50" : ""
                      )}
                    >
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => {
                            const nd = [...importData];
                            nd[i].name = e.target.value;
                            nd[i].isValid =
                              !!e.target.value && !!nd[i].email && !!nd[i].role;
                            onSetImportData(nd);
                          }}
                          className="w-full h-8 px-2 border border-slate-200 rounded-lg text-xs bg-white"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="email"
                          value={row.email}
                          onChange={(e) => {
                            const nd = [...importData];
                            nd[i].email = e.target.value;
                            nd[i].isValid =
                              !!e.target.value && !!nd[i].name && !!nd[i].role;
                            onSetImportData(nd);
                          }}
                          className="w-full h-8 px-2 border border-slate-200 rounded-lg text-xs bg-white"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.phone_number}
                          onChange={(e) => {
                            const nd = [...importData];
                            nd[i].phone_number = e.target.value;
                            onSetImportData(nd);
                          }}
                          className="w-full h-8 px-2 border border-slate-200 rounded-lg text-xs bg-white"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={row.role?.toUpperCase() || ""}
                          onChange={(e) => {
                            const nd = [...importData];
                            nd[i].role = e.target.value;
                            onSetImportData(nd);
                          }}
                          className="w-full h-8 px-2 border border-slate-200 rounded-lg text-xs bg-white"
                        >
                          <option value="SISWA">Siswa</option>
                          <option value="GURU">Guru</option>
                          <option value="ORANGTUA">Orangtua</option>
                          <option value="KARYAWAN">Karyawan</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <select
                          value={row.unit}
                          onChange={(e) => {
                            const nd = [...importData];
                            nd[i].unit = e.target.value;
                            onSetImportData(nd);
                          }}
                          className="w-full h-8 px-2 border border-slate-200 rounded-lg text-xs bg-white"
                        >
                          <option value="">Pilih Unit</option>
                          {units.map((u) => (
                            <option key={u.id} value={u.name}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-col gap-1">
                          {!row.isValid && (
                            <span className="text-[10px] text-red-600 font-bold wrap-break-word">
                              {row.errors?.join(", ") || "Data tidak lengkap"}
                            </span>
                          )}
                          {row.isDuplicate && (
                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={row.updateDuplicate}
                                onChange={(e) => {
                                  const nd = [...importData];
                                  nd[i].updateDuplicate = e.target.checked;
                                  onSetImportData(nd);
                                }}
                                className="accent-amber-600 rounded"
                              />
                              Timpa / Update Data
                            </label>
                          )}
                          {row.isValid && !row.isDuplicate && (
                            <span className="text-[10px] text-emerald-600 font-bold">
                              Siap Import
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                onClick={() => onSetImportStep(1)}
                className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-600 font-extrabold rounded-xl transition-all text-xs cursor-pointer"
              >
                Kembali ke Pilih File
              </button>
              <button
                onClick={async () => {
                  const hasErrors = importData.some((d) => !d.isValid);
                  if (hasErrors) {
                    return toast.error("Masih ada data yang error", {
                      description: "Harap perbaiki baris berwarna merah terlebih dahulu",
                    });
                  }

                  try {
                    setIsSubmitting(true);
                    const res = await apiClient.users.bulkImport(importData);
                    toast.success(res.message || "Data berhasil diimport");
                    onClose();
                    onSetImportFile(null);
                    onSetImportStep(1);
                    onSuccess();
                  } catch (err: any) {
                    toast.error(err?.response?.data?.message || "Gagal mengimport data");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="flex-1 h-10 bg-[#b61722] hover:bg-red-650 text-white font-extrabold rounded-xl transition-all text-xs shadow-xs cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Submit Import"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
