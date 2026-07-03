"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ComplaintList from "@/components/complaints/ComplaintList";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyComplaintsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex text-slate-800">
      {/* 1. Left Sidebar Navigation (Dark) */}
      <DashboardSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* 2. Right Main Layout Wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Header Greeting & Notifications */}
        <DashboardHeader 
          onToggleSidebar={() => setSidebarOpen(true)} 
        />

        {/* Main Content Area */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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
      </div>
    </div>
  );
}
