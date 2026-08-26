"use client";

import React, { useState, useEffect, useRef } from "react";
import Portal from "@/components/common/Portal";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ExternalLink,
  X,
  Loader2,
  AlertCircle,
  FileText,
  ChevronUp,
} from "lucide-react";

interface PdfViewerProps {
  url: string;
  title?: string;
  onClose: () => void;
}

interface PdfPageItemProps {
  pdfDoc: any;
  pageNumber: number;
  scale: number;
  rotation: number;
}

function PdfPageItem({ pdfDoc, pageNumber, scale, rotation }: PdfPageItemProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const [isRendering, setIsRendering] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!pdfDoc) return;
      try {
        setIsRendering(true);
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        // Render with sharp HiDPI scaling
        const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
        const renderScale = scale * dpr;
        const viewport = page.getViewport({ scale: renderScale, rotation });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return;

        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        if (!isCancelled) {
          setIsRendering(false);
        }
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error(`Error rendering page ${pageNumber}:`, err);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [pdfDoc, pageNumber, scale, rotation]);

  return (
    <div className="flex flex-col items-center mb-6 last:mb-1 w-full">
      {/* Paper Card - snug and proportional to modal */}
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg ring-1 ring-slate-900/10 overflow-hidden relative transition-all duration-200">
        <canvas ref={canvasRef} className="block max-w-full h-auto" />
        {isRendering && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-red-600" />
          </div>
        )}
      </div>
      {/* Subtle Page Marker */}
      <div className="mt-2 px-2.5 py-0.5 rounded-full bg-white/90 text-slate-500 border border-slate-200/80 text-[10.5px] font-medium tracking-wide select-none shadow-3xs">
        Halaman {pageNumber}
      </div>
    </div>
  );
}

export default function PdfViewer({ url, title = "Dokumen PDF", onClose }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.25);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Track scroll position for Scroll-To-Top button
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setShowScrollTop(scrollContainerRef.current.scrollTop > 300);
    }
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      try {
        setIsLoading(true);
        setError(null);

        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        // Fetch via proxy or direct url to avoid CORS
        const targetUrl = url.startsWith("http")
          ? `/api/pdf-proxy?url=${encodeURIComponent(url)}`
          : url;

        const loadingTask = pdfjs.getDocument({
          url: targetUrl,
          cMapUrl: "/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setIsLoading(false);
      } catch (err: any) {
        if (isCancelled) return;
        console.error("Failed to load PDF with pdfjs:", err);
        setError(
          "Gagal memuat dokumen PDF di dalam penampil. Anda tetap dapat mengunduh atau membukanya di tab baru.",
        );
        setIsLoading(false);
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [url]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 2.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.6));
  };

  const handleResetZoom = () => {
    setScale(1.25);
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-5 animate-in fade-in duration-200"
        onClick={onClose}
      >
      {/* ── Compact Proportional Modal Container (Max-Width 780px to eliminate wide side gaps) ── */}
      <div
        className="relative max-w-[800px] w-full h-[92vh] max-h-[92vh] flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header Control Bar ── */}
        <div className="h-15 px-4 sm:px-5 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 flex items-center justify-between gap-3 text-slate-800 shrink-0 z-20">
          {/* Left: Document Info & Red Accent Badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100 shadow-3xs">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {title}
                </h3>
                <span className="px-1.5 py-0.5 rounded-md bg-red-100 text-red-700 text-[9.5px] font-extrabold uppercase tracking-wide shrink-0">
                  PDF
                </span>
              </div>
              {numPages > 0 ? (
                <p className="text-[11px] text-slate-500 font-medium">
                  {numPages} Halaman • Gulir ke bawah
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 font-medium">Dokumen Terlampir</p>
              )}
            </div>
          </div>

          {/* Right: Zoom & Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isLoading && !error && (
              <div className="hidden sm:flex items-center gap-0.5 bg-slate-100/90 px-1.5 py-0.5 rounded-xl border border-slate-200/80 shadow-3xs">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="h-7 w-7 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                  title="Perkecil (-)"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-1.5 h-7 rounded-lg hover:bg-white text-slate-700 hover:text-slate-900 text-[11px] font-bold font-mono transition-all cursor-pointer shadow-3xs"
                  title="Reset Zoom"
                >
                  {Math.round(scale * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="h-7 w-7 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                  title="Perbesar (+)"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <div className="h-3.5 w-px bg-slate-300/80 mx-0.5" />
                <button
                  type="button"
                  onClick={handleRotate}
                  className="h-7 w-7 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                  title="Putar 90°"
                >
                  <RotateCw className="h-3 w-3" />
                </button>
              </div>
            )}

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 text-xs transition-colors cursor-pointer shadow-3xs hover:border-slate-300"
              title="Buka file di tab baru"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden md:inline">Buka Tab</span>
            </a>

            <a
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="h-8.5 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 text-xs transition-all cursor-pointer shadow-xs hover:shadow-sm active:scale-98"
              title="Unduh file PDF"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="h-8.5 w-8.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95 ml-0.5"
              title="Tutup (Esc)"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* ── Snug Continuous Scrollable Viewport Area ── */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto bg-slate-100/95 px-3 sm:px-5 py-4 sm:py-6 flex flex-col items-center justify-start relative select-none scroll-smooth overscroll-contain"
        >
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50/80 backdrop-blur-xs z-10 text-slate-700">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              <p className="text-xs font-semibold text-slate-600">
                Menyiapkan dokumen PDF...
              </p>
            </div>
          )}

          {error ? (
            <div className="my-auto max-w-md w-full p-6 rounded-3xl bg-white border border-slate-200 text-center space-y-3.5 shadow-xl">
              <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Gagal Membuka Dokumen</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Buka di Tab Baru</span>
                </a>
              </div>
            </div>
          ) : (
            /* Continuous Vertical Pages List - Snug width */
            <div className="w-full flex flex-col items-center max-w-[720px]">
              {pdfDoc &&
                Array.from({ length: numPages }, (_, index) => (
                  <PdfPageItem
                    key={`page-${index + 1}`}
                    pdfDoc={pdfDoc}
                    pageNumber={index + 1}
                    scale={scale}
                    rotation={rotation}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Floating Quick Action: Scroll to Top */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="absolute bottom-5 right-5 h-9 w-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer z-30"
            title="Kembali ke Atas"
          >
            <ChevronUp className="h-4.5 w-4.5" />
          </button>
        )}
      </div>
      </div>
    </Portal>
  );
}
