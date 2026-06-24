"use client";

import React from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ComplaintList from "@/components/complaints/ComplaintList";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyComplaintsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Title & CTA header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
              Keluhan & Aspirasi Saya
            </h1>
            <p className="text-xs text-slate-400">
              Pantau status peninjauan, dukungan siswa lain, dan tanggapan langsung unit terkait secara berkala.
            </p>
          </div>
          <Link href="/complaints/create">
            <Button className="bg-red-600 hover:bg-red-700 shadow-md shadow-red-200">
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Buat Keluhan</span>
            </Button>
          </Link>
        </div>

        {/* Filters & Scrollable Grid */}
        <ComplaintList />

      </main>

      {/* Footer Branding */}
      <Footer />
    </div>
  );
}
