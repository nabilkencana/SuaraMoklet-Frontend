"use client";

// ─── AuthRehydrator ───────────────────────────────────────────────────────────
//
// F2 FIX (MD-2 partial): Client component yang memanggil rehydrateAuth() saat mount.
// Ini menggantikan localStorage.getItem("user") yang dihapus sebagai bagian dari
// hardening PII storage.
//
// Tidak me-render apapun — hanya efek samping (side-effect only component).

import { useEffect } from "react";
import { rehydrateAuth } from "@/lib/rehydrateAuth";

export default function AuthRehydrator() {
  useEffect(() => {
    rehydrateAuth();
  }, []);

  return null;
}
