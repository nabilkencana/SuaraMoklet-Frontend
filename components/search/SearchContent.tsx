"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/shared/Header";
import { Complaint } from "@/types/complaint";
import { apiClient } from "@/lib/api";

// Subcomponents & Types
import ExploreLandingView from "./ExploreLandingView";
import SearchResultsView from "./SearchResultsView";

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
    async function loadComplaints() {
      try {
        setIsLoading(true);
        const data = await apiClient.complaints.getPublic({ limit: 100 });
        if (active) {
          const dislikedIds =
            typeof window !== "undefined"
              ? JSON.parse(localStorage.getItem("disliked_complaints") || "[]")
              : [];
          const filtered = data.filter((item) => !dislikedIds.includes(item.id));
          const mapped = filtered.map((item) => ({
            ...item,
            category: typeof item.unit === "string" ? item.unit : (item.unit as any)?.name || "Umum",
            location: (item as any).location || "Gedung Sekolah",
          }));
          setComplaints(mapped);
        }
      } catch (error) {
        console.error("Failed to load complaints from API:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    loadComplaints();
    return () => {
      active = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedTopic(category);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (statusParam !== "ALL") params.set("status", statusParam);
    if (sortBy !== "POPULAR") params.set("sort", sortBy);
    if (category !== "Semua Topik") params.set("topic", category);
    router.push(`/search?${params.toString()}`);
  };

  const isResultsView =
    Boolean(query) ||
    statusParam !== "ALL" ||
    searchParams.has("sort") ||
    topicParam !== "Semua Topik";

  const filteredResults = complaints
    .filter((item) => {
      const queryNormalized = query.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(queryNormalized);
      const descMatch = item.description.toLowerCase().includes(queryNormalized);
      const unitMatch = item.unit.toLowerCase().includes(queryNormalized);
      const categoryMatch = item.category?.toLowerCase().includes(queryNormalized);

      const matchesSearch = !query || titleMatch || descMatch || unitMatch || categoryMatch;

      const matchesTopic =
        topicParam === "Semua Topik" ||
        item.category === topicParam ||
        item.unit === topicParam;

      const matchesStatus = statusParam === "ALL" || item.status === statusParam;

      return matchesSearch && matchesTopic && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "POPULAR") {
        return (b.supports || 0) - (a.supports || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans flex flex-col pt-16">
      <Header />

      {!isResultsView ? (
        <ExploreLandingView
          searchVal={searchVal}
          topicParam={topicParam}
          isLoading={isLoading}
          complaints={complaints}
          onSearchChange={setSearchVal}
          onSearchSubmit={handleSearchSubmit}
          onTopicSelect={handleCategorySelect}
        />
      ) : (
        <SearchResultsView
          query={query}
          statusParam={statusParam}
          searchVal={searchVal}
          sortBy={sortBy}
          selectedStatus={selectedStatus}
          selectedTopic={selectedTopic}
          filteredResults={filteredResults}
          onSearchChange={setSearchVal}
          onSearchSubmit={handleSearchSubmit}
          onResetSearch={() => {
            setSelectedStatus("ALL");
            setSelectedTopic("Semua Topik");
            setSearchVal("");
            router.push("/search");
          }}
          onSortChange={(newSort) => {
            setSortBy(newSort);
            const params = new URLSearchParams();
            if (query) params.set("q", query);
            if (statusParam !== "ALL") params.set("status", statusParam);
            if (newSort !== "POPULAR") params.set("sort", newSort);
            router.push(`/search?${params.toString()}`);
          }}
          onStatusChange={(newStatus) => {
            setSelectedStatus(newStatus);
            const params = new URLSearchParams();
            if (query) params.set("q", query);
            if (newStatus !== "ALL") params.set("status", newStatus);
            if (sortBy !== "POPULAR") params.set("sort", sortBy);
            router.push(`/search?${params.toString()}`);
          }}
          onTopicChange={setSelectedTopic}
        />
      )}
    </div>
  );
}
