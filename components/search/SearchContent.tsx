"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { Complaint } from "@/types/complaint";
import { apiClient } from "@/lib/api";

// Subcomponents & Types
import ExploreLandingView from "./ExploreLandingView";

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const statusParam = searchParams.get("status") || "ALL";
  const sortParam = searchParams.get("sort") || "POPULAR";
  const topicParam = searchParams.get("topic") || "Semua Topik";

  const [mounted, setMounted] = useState(false);
  const [searchVal, setSearchVal] = useState(query);
  const [selectedTopic, setSelectedTopic] = useState(topicParam);
  const [selectedStatus, setSelectedStatus] = useState(statusParam);
  const [sortBy, setSortBy] = useState(sortParam);

  const [complaints, setComplaints] = useState<
    (Complaint & { category?: string; location?: string })[]
  >([]);
  const [categories, setCategories] = useState<{id: string; name: string; icon?: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    setSearchVal(query);
    setSelectedStatus(statusParam);
    setSortBy(sortParam);
    setSelectedTopic(topicParam);
  }, [query, statusParam, sortParam, topicParam]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setIsLoading(true);
        const [cats, data] = await Promise.all([
          apiClient.categories.getAll().catch(() => []),
          apiClient.complaints.getPublic({ limit: 100 })
        ]);
        
        if (active) {
          setCategories(cats);
          
          const dislikedIds =
            typeof window !== "undefined"
              ? JSON.parse(localStorage.getItem("disliked_complaints") || "[]")
              : [];
          const filtered = data.filter((item: any) => !dislikedIds.includes(item.id));
          const mapped = filtered.map((item: any) => ({
            ...item,
            category: item.category || (typeof item.unit === "string" ? item.unit : (item.unit as any)?.name || "Umum"),
            location: (item as any).location || "Gedung Sekolah",
          }));
          setComplaints(mapped);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by searchVal state directly
  };

  const handleCategorySelect = (category: string) => {
    setSelectedTopic(category);
  };

  const filteredResults = complaints
    .filter((item) => {
      const queryNormalized = searchVal.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(queryNormalized);
      const descMatch = item.description.toLowerCase().includes(queryNormalized);
      const unitMatch = item.unit.toLowerCase().includes(queryNormalized);
      const categoryMatch = item.category?.toLowerCase().includes(queryNormalized);

      const matchesSearch = !searchVal || titleMatch || descMatch || unitMatch || categoryMatch;

      const matchesTopic =
        selectedTopic === "Semua Topik" ||
        item.category === selectedTopic ||
        item.unit === selectedTopic;

      const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;

      return matchesSearch && matchesTopic && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "POPULAR") {
        return (b.supports || 0) - (a.supports || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans flex flex-col">
      <Header />

      <ExploreLandingView
        searchVal={searchVal}
        topicParam={selectedTopic}
        statusParam={selectedStatus}
        sortParam={sortBy}
        isLoading={isLoading}
        complaints={filteredResults}
        categories={categories}
        onSearchChange={setSearchVal}
        onSearchSubmit={handleSearchSubmit}
        onTopicSelect={handleCategorySelect}
        onQuickAction={(status, sort) => {
          if (status) setSelectedStatus(status);
          if (sort) setSortBy(sort);
        }}
      />

      <Footer />
    </div>
  );
}
