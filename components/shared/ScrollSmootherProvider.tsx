"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const SMOOTHER_ROUTES = [
  "/",
  "/complaints",
  "/profile",
  "/help",
  "/privacy",
  "/terms",
  "/credits",
  "/search",
];

function isSmootherRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return SMOOTHER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export default function ScrollSmootherProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const enabled = isSmootherRoute(pathname);

  const createSmoother = useCallback(() => {
    if (smootherRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    smootherRef.current = ScrollSmoother.create({
      smooth: 1,
      effects: true,
      ignoreMobileResize: true,
      content: contentRef.current ?? undefined,
      wrapper: contentRef.current?.parentElement ?? undefined,
    });

    ScrollTrigger.refresh();
  }, []);

  const destroySmoother = useCallback(() => {
    smootherRef.current?.kill();
    smootherRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled) {
      destroySmoother();
      return;
    }
    createSmoother();
    return destroySmoother;
  }, [enabled, createSmoother, destroySmoother]);

  useEffect(() => {
    if (!enabled) return;
    smootherRef.current?.scrollTop(0);
  }, [pathname, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const content = contentRef.current;
    if (!content) return;

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest(
        'a[href^="#"]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      smootherRef.current?.scrollTo(target, true, "top top");
    };

    content.addEventListener("click", handleClick);
    return () => content.removeEventListener("click", handleClick);
  }, [enabled]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
