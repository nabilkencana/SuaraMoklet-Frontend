'use client'

import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'
import { motion } from "framer-motion";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQsProps {
  items?: FaqItem[];
  title?: string;
  subtitle?: string;
  helpLinkText?: string;
  helpLinkHref?: string;
}

const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  {
    id: 'item-1',
    question: 'Apa itu SuaraMoklet?',
    answer:
      'SuaraMoklet adalah platform aspirasi dan pengaduan resmi bagi seluruh siswa, guru, dan warga SMK Telkom Malang untuk menyampaikan masukan, ide, maupun kendala terkait sarana prasarana, kurikulum, kesiswaan, hubungan industri, tata usaha, dan layanan umum secara terbuka dan terpercaya.',
  },
  {
    id: 'item-2',
    question: 'Apakah saya bisa melapor secara anonim?',
    answer:
      "Ya, tentu saja! Kamu dapat mengaktifkan opsi 'Kirim Sebagai Anonim'. Identitasmu (nama dan profil) dijamin 100% dirahasiakan oleh sistem dan tidak akan pernah ditampilkan baik ke publik maupun ke petugas unit sekolah yang menangani laporan. Kamu bisa menyampaikan keluhan dan aspirasi dengan tenang dan aman.",
  },
  {
    id: 'item-3',
    question: 'Bagaimana alur tindak lanjut dari laporan saya?',
    answer:
      'Setiap laporan baru (BARU) akan langsung masuk ke antrean verifikasi unit sekolah yang dituju (seperti Sarpras, Kurikulum, atau Kesiswaan) dan diproses (DIPROSES). Kamu dapat memantau progres penanganan secara transparan melalui linimasa riwayat dan saling berdiskusi hingga masalah dinyatakan selesai (SELESAI).',
  },
  {
    id: 'item-4',
    question: 'Format dokumen bukti apa saja yang didukung?',
    answer:
      'Kami mendukung berkas lampiran berupa foto/gambar (JPG, JPEG, PNG) atau dokumen digital (PDF) dengan batas ukuran maksimal 5MB untuk mempermudah unit pengelola melakukan inspeksi dan verifikasi di lapangan.',
  },
];

export default function FAQs({
  items = DEFAULT_FAQ_ITEMS,
  title = "FAQs",
  subtitle = "Semua yang perlu kamu ketahui tentang SuaraMoklet",
  helpLinkText = "Pusat Bantuan SuaraMoklet",
  helpLinkHref = "/help",
}: FAQsProps) {
  return (
    <section id="faq" className="py-16 md:py-24 border-t border-slate-100 bg-white">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-14 xl:gap-20">
          {/* Left Column: Title, Subtitle, Help link */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-start">
            <h2 className="text-foreground text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="text-muted-foreground text-slate-500 mt-4 text-balance text-base md:text-lg leading-relaxed">
              {subtitle}
            </p>
            <p className="text-muted-foreground text-slate-500 mt-6 hidden lg:block text-sm leading-relaxed">
              Tidak menemukan jawaban yang kamu cari? Kunjungi{' '}
              <Link
                href={helpLinkHref}
                className="text-red-600 font-semibold hover:underline"
              >
                {helpLinkText}
              </Link>{' '}
              untuk panduan lebih lanjut.
            </p>
          </div>

          {/* Right Column: Accordion */}
          <div className="lg:col-span-8 xl:col-span-8">
            <Accordion
              type="single"
              collapsible
              className="w-full space-y-1"
            >
              {items.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-b border-gray-200 dark:border-gray-700"
                >
                  <AccordionTrigger className="cursor-pointer text-base md:text-lg font-semibold text-slate-800 hover:text-red-600 hover:no-underline py-4 text-left transition-colors">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-slate-600 dark:text-slate-300 pb-3 pt-1">
                      <BlurredStagger text={item.answer} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Mobile bottom help text */}
          <p className="text-muted-foreground text-slate-500 mt-2 lg:hidden text-sm">
            Tidak menemukan jawaban yang kamu cari? Kunjungi{' '}
            <Link
              href={helpLinkHref}
              className="text-red-600 font-semibold hover:underline"
            >
              {helpLinkText}
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export const BlurredStagger = ({
  text = "built by ruixen.com",
}: {
  text: string;
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.005,
      },
    },
  };

  const letterAnimation = {
    hidden: {
      opacity: 0,
      filter: "blur(8px)",
      y: 2,
    },
    show: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
    },
  };

  // Membagi teks per kata agar browser tidak memotong huruf di tengah kata saat wrap
  const words = text.split(" ");

  return (
    <div className="w-full">
      <motion.p
        variants={container}
        initial="hidden"
        animate="show"
        className="text-sm md:text-base leading-relaxed text-slate-600 font-normal"
      >
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.3em]">
            {word.split("").map((char, charIndex) => (
              <motion.span
                key={charIndex}
                variants={letterAnimation}
                transition={{ duration: 0.2 }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.p>
    </div>
  );
};
