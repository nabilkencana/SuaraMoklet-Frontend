"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/auth.store";
import { apiClient } from "@/lib/api";
import { ComplaintCardData } from "@/components/shared/complaint-card";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

// Landing Submodules
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import TrendingSection from "@/components/landing/TrendingSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import LatestReportsSection from "@/components/landing/LatestReportsSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaBannerSection from "@/components/landing/CtaBannerSection";

export default function LandingPage() {
  const router = useRouter();
  const [petitionTitle, setPetitionTitle] = useState("");
  const [trendingComplaints, setTrendingComplaints] = useState<ComplaintCardData[]>([]);
  const [latestComplaints, setLatestComplaints] = useState<ComplaintCardData[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [summaryStats, setSummaryStats] = useState({ total: 0, resolved: 0 });

  const handleStartPetition = (e: React.FormEvent) => {
    e.preventDefault();
    const title = petitionTitle.trim();
    if (!title) {
      toast.error("Silakan masukkan keluhan atau aspirasi Anda terlebih dahulu.");
      return;
    }

    const auth = useAuthStore.getState().isAuthenticated;
    const createUrl = `/complaints/create?title=${encodeURIComponent(title)}`;
    if (auth) {
      router.push(createUrl);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(createUrl)}`);
    }
  };

  useEffect(() => {
    const loadPublicComplaints = async () => {
      try {
        const publicList = await apiClient.complaints.getPublic({ limit: 10 });

        const formatTimeAgo = (dateStr: string) => {
          const diffMs = Date.now() - new Date(dateStr).getTime();
          const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));
          const diffHours = Math.floor(diffMs / (3600 * 1000));
          if (diffDays > 0) return `${diffDays} hari yang lalu`;
          if (diffHours > 0) return `${diffHours} jam yang lalu`;
          return "Baru saja";
        };

        const dislikedIds =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("disliked_complaints") || "[]")
            : [];
        const filteredList = publicList.filter((c) => !dislikedIds.includes(c.id));

        const mapped: ComplaintCardData[] = filteredList.map((c) => {
          const reporterName = c.isAnonymous
            ? "Anonim"
            : c.reporter?.name || "Warga Moklet";
          const reporterInitial =
            reporterName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase() || "AN";
          return {
            id: c.id,
            title: c.title,
            description: c.description,
            image:
              c.evidenceUrl &&
              (c.evidenceUrl.startsWith("http") || c.evidenceUrl.startsWith("/")) &&
              c.evidenceUrl !== "<string>"
                ? c.evidenceUrl
                : undefined,
            category: c.unit as any,
            status: c.status as any,
            supports: c.supports || 0,
            reporter: reporterName,
            reporterInitial,
            timeAgo: formatTimeAgo(c.createdAt),
          };
        });

        // 1. Trending sorted by supports count
        const trending = [...mapped]
          .sort((a, b) => b.supports - a.supports)
          .slice(0, 3)
          .map((item, idx) => ({
            ...item,
            rank: idx + 1,
          }));
        setTrendingComplaints(trending);

        // 2. Latest sorted by date
        setLatestComplaints(mapped.slice(0, 4));

        // 3. Fetch summary stats from backend
        try {
          const stats = await apiClient.complaints.getLandingStats();
          setSummaryStats({ total: stats.total, resolved: stats.resolved });
        } catch (statsErr) {
          console.error("Failed to load landing stats:", statsErr);
        }
      } catch (err) {
        console.error("Failed to load public complaints:", err);
      } finally {
        setIsLoadingComplaints(false);
      }
    };

    loadPublicComplaints();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Header />

      <HeroSection
        petitionTitle={petitionTitle}
        onTitleChange={setPetitionTitle}
        onSubmit={handleStartPetition}
      />

      <StatsSection
        isLoading={isLoadingComplaints}
        summaryStats={summaryStats}
      />

      <TrendingSection
        trendingComplaints={trendingComplaints}
        isLoading={isLoadingComplaints}
      />

      <HowItWorksSection />

      <LatestReportsSection
        latestComplaints={latestComplaints}
        isLoading={isLoadingComplaints}
      />

      <FaqSection />

      <CtaBannerSection />

      <Footer />
    </div>
  );
}
