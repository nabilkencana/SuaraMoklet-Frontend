import React from "react";
import { AlertTriangle, RefreshCw, Save } from "lucide-react";
import { WhatsAppTemplate } from "./types";

interface WhatsAppTemplatesCardProps {
  templates: WhatsAppTemplate[];
  isTemplatesLoading: boolean;
  editingTemplate: string | null;
  editContent: string;
  onRefresh: () => void;
  onStartEdit: (name: string, content: string) => void;
  onCancelEdit: () => void;
  onContentChange: (content: string) => void;
  onSaveTemplate: (name: string) => void;
}

export default function WhatsAppTemplatesCard({
  templates,
  isTemplatesLoading,
  editingTemplate,
  editContent,
  onRefresh,
  onStartEdit,
  onCancelEdit,
  onContentChange,
  onSaveTemplate,
}: WhatsAppTemplatesCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-125">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-bold text-slate-800">Template Pesan Otomatis</h4>
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isTemplatesLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-4 text-xs text-blue-700 flex gap-2 items-start">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Gunakan variabel (dibungkus kurung kurawal) di bawah ini sesuai template: <br />
          <strong>{`{title}`}</strong>: Judul Keluhan
          <br />
          <strong>{`{name}`}</strong>: Nama Pembuat Keluhan
          <br />
          <strong>{`{status}`}</strong>: Status (NEW, OPEN, DONE)
          <br />
          <strong>{`{unit}`}</strong>: Nama Unit
          <br />
          <strong>{`{note}`}</strong>: Catatan Forward
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {templates.length === 0 && !isTemplatesLoading && (
          <div className="text-center text-slate-400 py-4 text-sm">Tidak ada template.</div>
        )}
        {templates.map((tpl) => (
          <div key={tpl.name} className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-extrabold text-slate-800">{tpl.name}</span>
              {editingTemplate !== tpl.name ? (
                <button
                  onClick={() => onStartEdit(tpl.name, tpl.content)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onCancelEdit}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => onSaveTemplate(tpl.name)}
                    className="text-[11px] font-bold text-green-600 hover:text-green-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="h-3 w-3" /> Simpan
                  </button>
                </div>
              )}
            </div>
            <div className="p-4 bg-white">
              {editingTemplate === tpl.name ? (
                <textarea
                  className="w-full min-h-25 text-xs p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  value={editContent}
                  onChange={(e) => onContentChange(e.target.value)}
                />
              ) : (
                <p className="text-xs text-slate-600 whitespace-pre-wrap">{tpl.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
