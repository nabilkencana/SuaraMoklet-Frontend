"use client";

import React from "react";
import ProfileContainer from "@/features/profile/ProfileContainer";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 flex flex-col pt-16">
      <Header />

      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto py-10">
        <ProfileContainer />
      </main>

      <Footer />
    </div>
  );
}
