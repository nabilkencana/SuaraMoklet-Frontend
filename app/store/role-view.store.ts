/**
 * role-view.store.ts
 *
 * Menyimpan pilihan tampilan aktif untuk user SUPER_PIC yang memiliki
 * dua peran: "Koordinator ISO / Umum" dan "Super Admin".
 *
 * - "iso"   → tampil seperti PIC biasa / ketua PIC (IsoDashboard + UnitSidebar)
 * - "admin" → tampil seperti Super Admin penuh (AdminDashboard + AdminSidebar)
 */

import { create } from "zustand";

export type RoleView = "iso" | "admin";

interface RoleViewStore {
  activeView: RoleView;
  setActiveView: (view: RoleView) => void;
  toggleView: () => void;
}

const STORAGE_KEY = "super_pic_role_view";

function readStoredView(): RoleView {
  if (typeof window === "undefined") return "admin";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "iso" || raw === "admin") return raw;
  } catch {
    // ignore
  }
  return "admin";
}

export const useRoleViewStore = create<RoleViewStore>((set, get) => ({
  activeView: readStoredView(),

  setActiveView: (view) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, view);
    }
    set({ activeView: view });
  },

  toggleView: () => {
    const next: RoleView = get().activeView === "admin" ? "iso" : "admin";
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
    set({ activeView: next });
  },
}));
