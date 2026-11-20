import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Package,
  Tags,
  Menu,
  X,
  LogOut,
  Store,
  ChevronRight,
  QrCode,
} from "lucide-react";

import api from "../api/axios";
import useUIStore from "../stores/useUIStore";

const navigation = [
  {
    label: "Overview",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    label: "Categories",
    path: "/admin/categories",
    icon: Tags,
  },
  {
    label: "QR Code",
    path: "/admin/qr-code",
    icon: QrCode,
  },
];

function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      queryClient.clear();
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#201E1B] text-[#F5F0E8]">
      {/* Brand */}
      <div className="flex h-[76px] items-center gap-3 border-b border-white/[0.07] px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E99A48] text-[#201E1B]">
          <Store size={21} strokeWidth={2.2} />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight">VojCart</h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A49B8E]">
            Store management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 pt-8">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#81796E]">
          Workspace
        </p>

        <nav className="space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#E99A48] text-[#201E1B] shadow-lg shadow-black/10"
                      : "text-[#B7AEA2] hover:bg-white/[0.06] hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
                <ChevronRight
                  size={15}
                  className="ml-auto opacity-0 transition group-hover:opacity-60"
                />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="mt-auto border-t border-white/[0.07] p-4">
        <div className="mb-4 rounded-xl border border-white/[0.07] bg-white/[0.035] p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3A332B] text-sm font-bold text-[#E99A48]">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Administrator</p>
              <p className="text-xs text-[#958C80]">Store account</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-[#B7AEA2] transition hover:bg-red-400/10 hover:text-red-300"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore();

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#25221E]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] lg:block">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <Sidebar onNavigate={closeSidebar} />

          <button
            onClick={closeSidebar}
            aria-label="Close navigation"
            className="absolute right-3 top-5 rounded-lg p-2 text-white/70 hover:bg-white/10"
          >
            <X size={19} />
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="min-h-screen lg:pl-[250px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#E7E0D6] bg-[#F9F7F3]/95 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              aria-label="Open navigation"
              className="rounded-lg border border-[#E7E0D6] p-2 text-[#514A41] hover:bg-white lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9A8F80]">
                VojCart / Admin
              </p>
              <p className="text-sm font-semibold text-[#29251F] sm:text-base">
                Store workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#E7E0D6] bg-white px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-[#E99A48]" />
            <span className="text-xs font-semibold text-[#62594E]">
              Admin panel
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
