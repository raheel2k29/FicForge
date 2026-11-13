"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getPromoCredits } from "@/lib/promotionStore";
import { getCurrentUser, UserSession } from "@/lib/authStore";
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  UploadCloud,
  DollarSign,
  Plus,
  ArrowRight,
  ExternalLink,
  PenTool,
} from "lucide-react";

interface CreatorStudioHeaderProps {
  currentTab?: "dashboard" | "stories" | "spotlight" | "import" | "earnings";
}

export default function CreatorStudioHeader({ currentTab }: CreatorStudioHeaderProps) {
  const pathname = usePathname();
  const [credits, setCredits] = useState(2);
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    setCredits(getPromoCredits());

    const handleUpdate = () => {
      setCredits(getPromoCredits());
      setUser(getCurrentUser());
    };

    window.addEventListener("ficforge_spotlight_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("ficforge_spotlight_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const navItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      href: "/write",
      icon: LayoutDashboard,
      isActive: currentTab === "dashboard" || pathname === "/write",
    },
    {
      key: "stories",
      label: "My Stories",
      href: "/my-stories",
      icon: BookOpen,
      isActive: currentTab === "stories" || pathname === "/my-stories",
    },
    {
      key: "spotlight",
      label: "Spotlight Promotions",
      href: "/write/promote",
      icon: Sparkles,
      badge: `${credits} ${credits === 1 ? "Credit" : "Credits"}`,
      isActive: currentTab === "spotlight" || pathname === "/write/promote",
    },
    {
      key: "import",
      label: "Bulk Import",
      href: "/write/bulk-import",
      icon: UploadCloud,
      isActive: currentTab === "import" || pathname === "/write/bulk-import",
    },
    {
      key: "earnings",
      label: "Vault & Earnings",
      href: "/creator-earnings",
      icon: DollarSign,
      isActive: currentTab === "earnings" || pathname === "/creator-earnings",
    },
  ];

  return (
    <div className="w-full border-b border-white/10 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Studio Brand Bar */}
        <div className="flex items-center justify-between py-3.5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Link
              href="/write"
              className="flex items-center gap-2 group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6D5DFB] to-[#F97316] text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <PenTool className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  Creator Studio
                </span>
                <span className="block text-[10px] text-slate-400 font-medium">
                  Author Command Center
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-block h-4 w-[1px] bg-white/15" />

            <div className="hidden sm:flex items-center gap-2">
              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300">
                ✦ {user?.membershipTier ? `Forge ${user.membershipTier}` : "Forge Plus"} Creator
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {user ? user.name : "Valerius Frost"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/write/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-3.5 py-1.5 text-xs font-black text-white shadow-md shadow-indigo-600/30 hover:opacity-95 transition-all"
            >
              <Plus className="h-3.5 w-3.5" /> New Story
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
              title="Return to Reader Homepage"
            >
              <span>Reader Mode</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap shrink-0 ${
                  item.isActive
                    ? "bg-[#6D5DFB]/15 text-[#A78BFA] border border-[#6D5DFB]/40 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${item.isActive ? "text-[#A78BFA]" : "text-slate-400"}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      item.isActive
                        ? "bg-[#6D5DFB]/30 text-white"
                        : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
