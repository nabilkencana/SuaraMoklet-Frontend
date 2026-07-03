import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Megaphone, 
  LayoutDashboard, 
  MessageSquare, 
  Bell, 
  User, 
  HelpCircle, 
  Settings, 
  LogOut, 
  PlusCircle,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/auth.store";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  disabled?: boolean;
}

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success("Berhasil keluar", {
      description: "Sesi Anda telah diakhiri.",
    });
    router.push("/");
  };

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Keluhan Saya", href: "/complaints", icon: MessageSquare },
    { label: "Profil Saya", href: "/profile", icon: User },
  ];

  const bottomItems: NavItem[] = [
    { label: "Help Center", href: "#", icon: HelpCircle, disabled: true },
    { label: "Settings", href: "#", icon: Settings, disabled: true },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#111111] text-white p-6 justify-between select-none font-sans">
      <div className="space-y-8">
        {/* Header Branding */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-red-650 flex items-center justify-center shadow-md shadow-red-900/50">
              <Megaphone className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block">SuaraMoklet</span>
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block mt-0.5">Governance Portal</span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden h-8 w-8 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Primary CTA button */}
        <div className="pt-2">
          <Link
            href="/complaints/create"
            onClick={onClose}
            className="w-full h-11 bg-red-650 hover:bg-red-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs shadow-sm shadow-red-900/40"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Buat Keluhan</span>
          </Link>
        </div>

        {/* Main Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.disabled ? "#" : item.href}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault();
                  onClose();
                }}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all relative border border-transparent",
                  isActive
                    ? "bg-white/[0.07] text-white border-l-4 border-l-red-600 border-white/[0.02]"
                    : item.disabled
                    ? "text-neutral-600 cursor-not-allowed opacity-60"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-red-600" />
                )}
                <Icon className={cn("h-4.5 w-4.5 shrink-0", isActive ? "text-red-500" : "text-neutral-500")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom menus */}
      <div className="space-y-5 pt-6 border-t border-white/[0.05]">
        {/* Help & Settings */}
        <div className="space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all",
                  item.disabled
                    ? "text-neutral-650 cursor-not-allowed opacity-55"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <Icon className="h-4.5 w-4.5 text-neutral-550 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User profile section */}
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.02]">
            <div className="h-9 w-9 rounded-xl bg-slate-100/10 border border-white/10 flex items-center justify-center font-extrabold text-white text-xs uppercase shadow-sm overflow-hidden select-none shrink-0">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{user.name.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-white truncate">{user.name}</span>
              <span className="block text-[9px] text-neutral-500 font-bold uppercase tracking-wider truncate mt-0.5">{user.role}</span>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide text-red-500 hover:text-red-400 hover:bg-red-950/20 border border-transparent transition-all cursor-pointer text-left"
        >
          <LogOut className="h-4.5 w-4.5 text-red-500 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed left-0 top-0 border-r border-white/[0.05] z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
          />
          {/* Drawer Element */}
          <div className="fixed inset-y-0 left-0 w-[270px] max-w-[80vw] h-full shadow-2xl z-50 transform transition-transform duration-300 ease-out">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
