import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function Footer() {
  const socialMedia = [
    {
      label: "Instagram",
      path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
      url: "https://www.instagram.com/smktelkommalang",
    },
    {
      label: "LinkedIn",
      path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
      url: "https://www.linkedin.com/school/smk-telkom-malang",
    },
    {
      label: "YouTube",
      path: "M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z",
      url: "https://www.youtube.com/c/SMKTelkomMalang",
    },
  ];

  return (
    <footer className="bg-white border-t border-slate-200/80 pt-16 mt-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-12">
        {/* Top Section: Contacts & Nav Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Left Column: Socials & School Contact */}
          <div className="md:col-span-5 space-y-6">
            {/* Circular Social Media Icons */}
            <div className="flex items-center gap-3">
              {socialMedia.map(({ label, path, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-11 w-11 rounded-full border border-slate-300 flex items-center justify-center text-slate-700 hover:text-red-650 hover:border-red-500 hover:bg-red-50/50 transition-all cursor-pointer shadow-2xs"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>

            {/* Address & Contact Info */}
            <div className="space-y-2 text-sm text-slate-600 leading-relaxed font-normal pt-1">
              <p className="font-semibold text-slate-800">
                Jl. Danau Ranau, Sawojajar, Kec. Kedungkandang,
                <br />
                Kota Malang, Jawa Timur 65139
              </p>
              <p className="text-slate-500 hover:text-slate-800 transition-colors">
                info@smktelkom-mlg.sch.id
              </p>
              <p className="text-slate-500 hover:text-slate-800 transition-colors">
                (+62) 341-712500
              </p>
            </div>
          </div>

          {/* Right Columns: Nav Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1: MENU */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                MENU
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-600 font-medium">
                <li>
                  <Link href="/" className="hover:text-red-650 transition-colors">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="hover:text-red-650 transition-colors">
                    Jelajahi Laporan
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-red-650 transition-colors">
                    Panduan &amp; Bantuan
                  </Link>
                </li>
                <li>
                  <Link href="/complaints/create" className="hover:text-red-650 transition-colors">
                    Buat Keluhan
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: UNIT SEKOLAH */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                UNIT SEKOLAH
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-600 font-medium">
                <li>
                  <Link href="/search?unit=Sarpras" className="hover:text-red-650 transition-colors">
                    Sarpras
                  </Link>
                </li>
                <li>
                  <Link href="/search?unit=Kesiswaan" className="hover:text-red-650 transition-colors">
                    Kesiswaan
                  </Link>
                </li>
                <li>
                  <Link href="/search?unit=Kurikulum" className="hover:text-red-650 transition-colors">
                    Kurikulum
                  </Link>
                </li>
                <li>
                  <Link href="/search?unit=Hubin" className="hover:text-red-650 transition-colors">
                    Hubin &amp; Industri
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: INFORMASI */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                INFORMASI
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-600 font-medium">
                <li>
                  <a
                    href="https://smktelkom-mlg.sch.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-650 transition-colors inline-flex items-center gap-1"
                  >
                    <span>Website SMK Telkom</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                  </a>
                </li>
                <li>
                  <Link href="/help" className="hover:text-red-650 transition-colors">
                    Pusat Bantuan
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Horizontal Line Divider with Pill Button */}
        <div className="relative flex items-center justify-between pt-4">
          <div className="w-full border-t border-slate-300" />
          <Link
            href="/complaints/create"
            className="shrink-0 ml-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-300 bg-white hover:bg-red-650 hover:text-white hover:border-red-650 text-slate-800 font-semibold text-xs tracking-wide transition-all shadow-2xs group cursor-pointer"
          >
            <span>Mulai Lapor</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-white transition-colors" />
          </Link>
        </div>

        {/* Sub-line Section: Description & Terms/Privacy */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-medium text-slate-500 pb-2">
          <p className="max-w-md leading-relaxed">
            Platform resmi aspirasi &amp; pengaduan terbuka SMK Telkom Malang.
            Suaramu menciptakan perubahan positif untuk sekolah kita.
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-800 tracking-wider font-semibold text-[11px] uppercase">
            <Link href="/credits" className="hover:text-red-650 transition-colors text-red-650 font-bold">
              CREDITS
            </Link>
            <Link href="/terms" className="hover:text-red-650 transition-colors">
              SYARAT &amp; KETENTUAN
            </Link>
            <Link href="/privacy" className="hover:text-red-650 transition-colors">
              KEBIJAKAN PRIVASI
            </Link>
          </div>
        </div>
      </div>

      {/* Giant Watermark Typography at Very Bottom */}
      <div className="w-full overflow-hidden select-none pointer-events-none leading-none pt-6 pb-0 -mb-3 text-center">
        <span className="text-[14vw] sm:text-[14.5vw] font-black tracking-tighter uppercase text-red-650/10 block whitespace-nowrap leading-none font-sans">
          suara.-moklet
        </span>
      </div>
    </footer>
  );
}
