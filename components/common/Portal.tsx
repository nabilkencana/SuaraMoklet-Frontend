"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";

/**
 * Merender children ke document.body.
 * Wajib untuk overlay position:fixed agar berada di luar #smooth-wrapper
 * (transform ScrollSmoother membuat fixed di dalamnya relatif ke konten).
 * Hanya gunakan untuk konten yang muncul pasca-interaksi (modal/lightbox).
 */
export default function Portal({ children }: { children: React.ReactNode }) {
  const [container] = useState<HTMLElement | null>(() =>
    typeof document !== "undefined" ? document.body : null
  );

  if (!container) return null;

  return createPortal(children, container);
}
