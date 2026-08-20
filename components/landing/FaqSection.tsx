"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import SectionEyebrow from "./SectionEyebrow";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: "Apa itu SuaraMoklet?",
    answer:
      "SuaraMoklet adalah platform aspirasi dan pengaduan resmi untuk seluruh civitas SMK Telkom Malang guna menyampaikan masukan, ide, dan keluhan terkait sarana prasarana, kurikulum, kesiswaan, hubungan industri, dan tata kelola sekolah secara transparan.",
  },
  {
    question: "Apakah saya bisa melapor secara anonim?",
    answer:
      "Ya! Pada langkah terakhir pengisian laporan (Langkah 5), Anda dapat mengaktifkan opsi 'Kirim Sebagai Anonim'. Identitas Anda akan disembunyikan dari publik dan petugas unit, namun tetap tersimpan secara aman di sistem untuk kebutuhan verifikasi resmi.",
  },
  {
    question: "Bagaimana alur tindak lanjut dari laporan saya?",
    answer:
      "Setiap laporan baru (NEW) akan langsung masuk ke dashboard Unit Kerja terkait (seperti Sarpras atau Kesiswaan) dan diproses (OPEN). Anda dapat memantau progres penanganan secara transparan melalui linimasa dan saling bertukar tanggapan hingga status selesai (DONE).",
  },
  {
    question: "Apa fungsi fitur 'Dukung Laporan'?",
    answer:
      "Fitur dukungan (upvote) memungkinkan sesama siswa memberikan suara dukungan pada laporan Anda. Laporan dengan dukungan yang tinggi akan menjadi prioritas utama untuk segera ditindaklanjuti oleh manajemen sekolah.",
  },
  {
    question: "Format dokumen bukti apa saja yang didukung?",
    answer:
      "Kami mendukung berkas lampiran berupa foto/gambar (JPG, JPEG, PNG) atau dokumen digital (PDF) dengan batas ukuran maksimal 5MB untuk mempermudah unit pengelola melakukan inspeksi dan verifikasi di lapangan.",
  },
];

function FaqAccordionItem({
  item,
  isOpen,
  onClick,
}: {
  item: FaqItem;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs hover:border-red-200 transition-all duration-300">
      <button
        onClick={onClick}
        type="button"
        className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-red-650 transition-colors gap-4 select-none cursor-pointer"
      >
        <span className="text-sm md:text-base leading-snug">{item.question}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-slate-400 shrink-0 transition-transform duration-300",
            isOpen && "rotate-180 text-red-600"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen
            ? "grid-rows-[1fr] opacity-100 border-t border-slate-100"
            : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="p-5 text-xs md:text-sm text-slate-500 leading-relaxed bg-slate-50/50">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FaqSection() {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionEyebrow label="FAQ" icon={HelpCircle} />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-3 text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            Temukan jawaban atas kebingungan Anda seputar penggunaan platform aspirasi
            SuaraMoklet.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((faq, index) => (
            <FaqAccordionItem
              key={faq.question}
              item={faq}
              isOpen={activeFaqIndex === index}
              onClick={() => setActiveFaqIndex(activeFaqIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
