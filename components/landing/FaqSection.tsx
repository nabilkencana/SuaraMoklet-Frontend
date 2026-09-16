"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BlurredStagger } from "@/components/ui/text-reveal-faqs";

const FAQ_DATA = [
  {
    id: "item-1",
    question: "Apa itu SuaraMoklet?",
    answer:
      "SuaraMoklet adalah platform aspirasi dan pengaduan resmi bagi seluruh siswa, guru, dan warga SMK Telkom Malang untuk menyampaikan masukan, ide, maupun kendala terkait sarana prasarana, kurikulum, kesiswaan, hubungan industri, tata usaha, dan layanan umum secara terbuka dan terpercaya.",
  },
  {
    id: "item-2",
    question: "Apakah saya bisa melapor secara anonim?",
    answer:
      "Ya, tentu saja! Kamu dapat mengaktifkan opsi 'Kirim Sebagai Anonim'. Identitasmu (nama dan profil) dijamin 100% dirahasiakan oleh sistem dan tidak akan pernah ditampilkan baik ke publik maupun ke petugas unit sekolah yang menangani laporan. Kamu bisa menyampaikan keluhan dan aspirasi dengan tenang dan aman.",
  },
  {
    id: "item-3",
    question: "Bagaimana alur tindak lanjut dari laporan saya?",
    answer:
      "Setiap laporan baru (BARU) akan langsung masuk ke antrean verifikasi unit sekolah yang dituju (seperti Sarpras, Kurikulum, atau Kesiswaan) dan diproses (DIPROSES). Kamu dapat memantau progres penanganan secara transparan melalui linimasa riwayat dan saling berdiskusi hingga masalah dinyatakan selesai (SELESAI).",
  },
  {
    id: "item-4",
    question: "Format dokumen bukti apa saja yang didukung?",
    answer:
      "Kami mendukung berkas lampiran berupa foto/gambar (JPG, JPEG, PNG) atau dokumen digital (PDF) dengan batas ukuran maksimal 5MB untuk mempermudah unit pengelola melakukan inspeksi dan verifikasi di lapangan.",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="py-16 md:py-24 border-t border-slate-100 bg-white overflow-hidden">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-14 xl:gap-20 items-start">
          {/* Sisi Kiri: Judul & Informasi dengan Animasi Slide-In */}
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4 xl:col-span-4 flex flex-col justify-start"
          >
            <h2 className="text-foreground text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mt-1">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-muted-foreground text-slate-500 mt-4 text-balance text-base leading-relaxed">
              Temukan jawaban atas kebingungan Anda seputar penggunaan platform aspirasi SuaraMoklet.
            </p>
            <p className="text-muted-foreground text-slate-500 mt-6 hidden lg:block text-sm leading-relaxed">
              Tidak menemukan jawaban yang kamu cari? Kunjungi{" "}
              <Link
                href="/help"
                className="text-red-600 font-semibold hover:underline"
              >
                Pusat Bantuan SuaraMoklet
              </Link>{" "}
              untuk panduan lebih lanjut.
            </p>
          </motion.div>

          {/* Sisi Kanan: Accordion Luas dengan Staggered Entrance dan Text Reveal */}
          <div className="lg:col-span-8 xl:col-span-8">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {FAQ_DATA.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <AccordionItem
                    value={item.id}
                    className="border-b border-slate-200/80 rounded-xl px-3 transition-colors duration-200 hover:bg-slate-50/50 data-[state=open]:bg-slate-50/40"
                  >
                    <AccordionTrigger className="cursor-pointer text-base md:text-lg font-semibold text-slate-800 hover:text-red-600 hover:no-underline py-4 text-left transition-colors group">
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                        {item.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-slate-600 pb-4 pt-1">
                        <BlurredStagger text={item.answer} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>

          {/* Link bantuan untuk tampilan mobile */}
          <p className="text-muted-foreground text-slate-500 mt-4 lg:hidden text-sm">
            Tidak menemukan jawaban yang kamu cari? Kunjungi{" "}
            <Link
              href="/help"
              className="text-red-600 font-semibold hover:underline"
            >
              Pusat Bantuan SuaraMoklet
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
