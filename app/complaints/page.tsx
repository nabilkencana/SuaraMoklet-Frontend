"use client";

import React, { Suspense } from "react";
import ComplaintList from "@/components/complaints/ComplaintList";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

import { useAuthStore } from "@/app/store/auth.store";
import UnitComplaintsList from "@/components/dashboard/UnitComplaintsList";

export default function MyComplaintsPage() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 flex flex-col pt-16">
      <Header />

      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
              Keluhan &amp; Aspirasi Saya
            </h1>
            <p className="text-xs text-slate-400">
              Pantau status peninjauan, dukungan siswa lain, dan tanggapan langsung unit terkait secara berkala.
            </p>
          </div>
          <Link href="/complaints/create">
            <Button className="bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 cursor-pointer">
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Buat Keluhan</span>
            </Button>
          </Link>
        </div>

        {/* Wrapped in Suspense — required by useSearchParams in ComplaintList */}
        <Suspense fallback={
          <div className="space-y-4 animate-pulse">
            <div className="h-16 bg-slate-100 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => <div key={n} className="h-56 bg-slate-100 rounded-2xl" />)}
            </div>
          </div>
        }>
          <ComplaintList />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
