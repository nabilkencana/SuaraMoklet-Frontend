"use client";

import React from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import ProfileContainer from "@/features/profile/ProfileContainer";

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header Navigation */}
      <Header />

      {/* Main Profile Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ProfileContainer />
      </main>

      {/* Footer Branding */}
      <Footer />
    </div>
  );
}
