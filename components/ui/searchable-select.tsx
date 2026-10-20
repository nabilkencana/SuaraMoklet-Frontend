"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  value: string;
  label: string;
  subLabel?: string;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
  disabledReason?: string;
  avatarText?: string;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  error?: string;
}

const getInitials = (text: string): string => {
  if (!text) return "";
  const parts = text.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "-- Pilih Opsi --",
  searchPlaceholder = "Cari data...",
  emptyMessage = "Data tidak ditemukan",
  disabled = false,
  required = false,
  className,
  id,
  error,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Cari opsi yang saat ini dipilih
  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  // Filter opsi secara realtime berdasarkan keyword (label, subLabel, badge)
  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return options;

    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(query);
      const matchSubLabel = opt.subLabel?.toLowerCase().includes(query) ?? false;
      const matchBadge = opt.badge?.toLowerCase().includes(query) ?? false;
      return matchLabel || matchSubLabel || matchBadge;
    });
  }, [options, searchQuery]);

  // Otomatis fokus ke input pencarian ketika dropdown terbuka
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Tutup dropdown saat klik di luar komponen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Scroll otomatis ke item yang sedang di-highlight dengan keyboard
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll<HTMLButtonElement>("[data-select-item]");
      const currentItem = items[highlightedIndex];
      if (currentItem) {
        currentItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (option: SearchableSelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev + 1;
        return next >= filteredOptions.length ? 0 : next;
      });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? filteredOptions.length - 1 : next;
      });
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (
        highlightedIndex >= 0 &&
        highlightedIndex < filteredOptions.length
      ) {
        const option = filteredOptions[highlightedIndex];
        if (option && !option.disabled) {
          handleSelect(option);
        }
      } else if (filteredOptions.length === 1 && !filteredOptions[0].disabled) {
        handleSelect(filteredOptions[0]);
      }
    }
  };

  const hasValue = Boolean(value);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full text-left", className)}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input untuk mendukung native form */}
      <input
        type="hidden"
        id={id}
        value={value}
        required={required}
        aria-hidden="true"
      />

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "w-full h-10 px-3.5 text-xs rounded-xl border transition-all flex items-center justify-between gap-2 bg-white cursor-pointer select-none text-left",
          isOpen
            ? "border-red-500 ring-2 ring-red-100 shadow-xs"
            : error
            ? "border-red-400 ring-1 ring-red-100"
            : "border-slate-200 hover:border-slate-300",
          disabled && "opacity-60 cursor-not-allowed bg-slate-50"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedOption ? (
            <>
              <div className="h-6 w-6 rounded-full bg-red-50 text-[#b61722] border border-red-100 flex items-center justify-center font-bold text-[10px] shrink-0">
                {selectedOption.avatarText || getInitials(selectedOption.label)}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-bold text-slate-800 truncate leading-tight">
                  {selectedOption.label}
                </span>
                {selectedOption.subLabel && (
                  <span className="text-[10px] text-slate-400 truncate leading-tight">
                    {selectedOption.subLabel}
                  </span>
                )}
              </div>
            </>
          ) : hasValue ? (
            <span className="font-bold text-slate-800 truncate">{value}</span>
          ) : (
            <span className="text-slate-400 font-medium truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {hasValue && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onChange("");
                }
              }}
              title="Hapus pilihan"
              className="p-1 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180 text-red-500"
            )}
          />
        </div>
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-72"
        >
          {/* Header Search Input */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    if (
                      highlightedIndex >= 0 &&
                      highlightedIndex < filteredOptions.length
                    ) {
                      const option = filteredOptions[highlightedIndex];
                      if (option && !option.disabled) {
                        handleSelect(option);
                      }
                    } else if (
                      filteredOptions.length === 1 &&
                      !filteredOptions[0].disabled
                    ) {
                      handleSelect(filteredOptions[0]);
                    }
                  }
                }}
                placeholder={searchPlaceholder}
                className="w-full h-8.5 pl-8.5 pr-8 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition-all font-medium placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Sub-counter */}
            <div className="flex items-center justify-between px-1.5 pt-1.5 text-[10px] text-slate-400 font-semibold">
              <span>
                {filteredOptions.length} dari {options.length} pilihan
              </span>
              {searchQuery && (
                <span className="text-red-500">Filter aktif</span>
              )}
            </div>
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            className="overflow-y-auto flex-1 p-1.5 space-y-1 max-h-56 divide-y divide-slate-50"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-7 px-4 text-center space-y-1.5">
                <User className="h-6 w-6 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">
                  {emptyMessage}
                </p>
                {searchQuery && (
                  <p className="text-[11px] text-slate-400">
                    Tidak ada hasil untuk &ldquo;<span className="text-slate-600 font-medium">{searchQuery}</span>&rdquo;
                  </p>
                )}
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    data-select-item
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between gap-2.5 transition-colors group cursor-pointer",
                      isHighlighted && !opt.disabled && "bg-slate-100/90",
                      isSelected && "bg-red-50/80 hover:bg-red-50",
                      opt.disabled && "opacity-50 cursor-not-allowed bg-slate-50/50 hover:bg-slate-50/50"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Avatar / Initial */}
                      <div
                        className={cn(
                          "h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border",
                          isSelected
                            ? "bg-[#b61722] text-white border-[#b61722]"
                            : "bg-slate-100 text-slate-600 border-slate-200 group-hover:border-slate-300"
                        )}
                      >
                        {opt.avatarText || getInitials(opt.label)}
                      </div>

                      {/* Labels */}
                      <div className="flex flex-col min-w-0 flex-1 leading-tight">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "text-xs font-bold truncate",
                              isSelected ? "text-[#b61722]" : "text-slate-800"
                            )}
                          >
                            {opt.label}
                          </span>
                          {opt.badge && (
                            <span
                              className={cn(
                                "text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md shrink-0",
                                opt.badgeColor ||
                                  (opt.disabled
                                    ? "bg-slate-200 text-slate-600"
                                    : "bg-slate-100 text-slate-600")
                              )}
                            >
                              {opt.badge}
                            </span>
                          )}
                        </div>

                        {opt.subLabel && (
                          <span className="text-[10px] text-slate-400 truncate mt-0.5">
                            {opt.subLabel}
                          </span>
                        )}

                        {opt.disabled && opt.disabledReason && (
                          <span className="text-[10px] text-red-500 font-semibold mt-0.5">
                            {opt.disabledReason}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Checkmark indicator */}
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-red-100 text-[#b61722] flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-[11px] text-red-500 font-semibold mt-1">{error}</p>
      )}
    </div>
  );
}
