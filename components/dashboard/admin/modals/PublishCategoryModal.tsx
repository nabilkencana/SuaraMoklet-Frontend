import React, { useEffect, useState } from "react";
import { X, Save, Plus, Trash2, Edit2, Check, Hash } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/auth.store";

interface PublishCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (category: string) => void;
  complaintTitle?: string;
  complaintContent?: string;
  isSubmitting?: boolean;
}

export default function PublishCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  complaintTitle,
  complaintContent,
  isSubmitting,
}: PublishCategoryModalProps) {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  
  // CRUD states
  const [isAdding, setIsAdding] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTopicName, setEditTopicName] = useState("");
  const [isLoadingCats, setIsLoadingCats] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    setIsLoadingCats(true);
    try {
      const data = await apiClient.categories.getAll();
      setCategories(data);
      if (data.length > 0 && !selectedTopic) {
        setSelectedTopic(data[0].name);
      }
    } catch (err) {
      toast.error("Gagal memuat kategori");
    } finally {
      setIsLoadingCats(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newTopicName.trim()) return;
    try {
      const res = await apiClient.categories.create({ name: newTopicName.trim() });
      setCategories([...categories, res]);
      setSelectedTopic(res.name);
      setNewTopicName("");
      setIsAdding(false);
      toast.success("Kategori berhasil ditambahkan");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menambahkan kategori");
    }
  };

  const handleEditCategory = async (id: string) => {
    if (!editTopicName.trim()) return;
    try {
      const res = await apiClient.categories.update(id, { name: editTopicName.trim() });
      setCategories(categories.map(c => c.id === id ? res : c));
      if (selectedTopic === categories.find(c => c.id === id)?.name) {
        setSelectedTopic(res.name);
      }
      setEditingId(null);
      toast.success("Kategori berhasil diubah");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengubah kategori");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Hapus kategori ${name}?`)) return;
    try {
      await apiClient.categories.delete(id);
      setCategories(categories.filter(c => c.id !== id));
      if (selectedTopic === name) {
        setSelectedTopic(categories.length > 1 ? categories.find(c => c.id !== id)?.name || "" : "");
      }
      toast.success("Kategori berhasil dihapus");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus kategori");
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) {
      toast.error("Pilih kategori terlebih dahulu");
      return;
    }
    onSubmit(selectedTopic);
  };

  const snippet = complaintContent && complaintContent.length > 150
    ? complaintContent.substring(0, 150) + "..."
    : complaintContent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <h3 className="font-extrabold text-slate-800 text-lg">Publikasi Keluhan</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Preview Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                Pratinjau Publik
              </span>
            </div>
            <h4 className="font-extrabold text-slate-900 text-base mb-1.5 line-clamp-2">
              {complaintTitle || "Tidak ada judul"}
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed break-words whitespace-pre-wrap line-clamp-3">
              {snippet || "Tidak ada deskripsi"}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Kategori Topik
              </label>
              {(user?.role === "SUPERADMIN" || user?.role === "SUPER_PIC") && (
                <button
                  type="button"
                  onClick={() => setIsAdding(!isAdding)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg"
                >
                  <Plus className="h-3 w-3" /> Tambah
                </button>
              )}
            </div>

            {isAdding && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Kategori baru..."
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-red-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={!newTopicName.trim()}
                  className="h-9 px-3 bg-red-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="h-9 px-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2">
              {isLoadingCats ? (
                <div className="text-center py-4 text-xs text-slate-400 animate-pulse">Memuat kategori...</div>
              ) : categories.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">Belum ada kategori</div>
              ) : (
                categories.map((topic) => (
                  <div key={topic.id} className={`flex items-center justify-between p-2 rounded-xl border transition-all ${selectedTopic === topic.name ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    
                    {editingId === topic.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editTopicName}
                          onChange={(e) => setEditTopicName(e.target.value)}
                          className="flex-1 h-8 px-2 rounded border border-slate-200 text-sm focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditCategory(topic.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <button type="button" onClick={() => handleEditCategory(topic.id)} className="text-emerald-600 p-1 hover:bg-emerald-50 rounded"><Check className="h-4 w-4" /></button>
                        <button type="button" onClick={() => setEditingId(null)} className="text-slate-400 p-1 hover:bg-slate-100 rounded"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedTopic(topic.name)}
                          className="flex-1 flex items-center gap-2 text-left"
                        >
                          <Hash className={`h-4 w-4 ${selectedTopic === topic.name ? 'text-red-500' : 'text-slate-400'}`} />
                          <span className={`text-sm font-semibold ${selectedTopic === topic.name ? 'text-red-700' : 'text-slate-700'}`}>{topic.name}</span>
                        </button>
                        
                        <div className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setEditingId(topic.id); setEditTopicName(topic.name); }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(topic.id, topic.name); }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedTopic}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer shadow-md shadow-red-200"
          >
            {isSubmitting ? (
              <>Loading...</>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Publikasikan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
