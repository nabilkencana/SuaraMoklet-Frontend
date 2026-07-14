import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "SuaraMoklet — Platform Aspirasi & Pengaduan Sekolah",
  description:
    "Platform tata kelola sekolah yang transparan. Suarakan pendapatmu, kumpulkan dukungan, dan wujudkan lingkungan belajar yang lebih baik bersama-sama.",
  keywords: ["suaramoklet", "keluhan sekolah", "aspirasi siswa", "pengaduan", "SMK Telkom Malang"],
  openGraph: {
    title: "SuaraMoklet — Platform Aspirasi & Pengaduan Sekolah",
    description: "Platform tata kelola sekolah yang transparan.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} scroll-smooth`}>
      <body className="min-h-screen font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
