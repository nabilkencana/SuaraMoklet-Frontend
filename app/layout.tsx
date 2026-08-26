import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import AuthRehydrator from "@/components/shared/AuthRehydrator";
import ScrollSmootherProvider from "@/components/shared/ScrollSmootherProvider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="id" className={cn(plusJakartaSans.variable, "font-sans", geist.variable)}>
      <body className="min-h-screen font-sans antialiased">
        {/* Layer untuk elemen position:fixed (Navbar) — di luar #smooth-wrapper
            agar tidak terpengaruh transform ScrollSmoother */}
        <div id="fixed-layer" />
        {/* F2: Re-hydrate user state dari /users/me saat reload (menggantikan localStorage) */}
        <AuthRehydrator />
        <ScrollSmootherProvider>
          {children}
        </ScrollSmootherProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
