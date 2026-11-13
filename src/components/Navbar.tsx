"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getCurrentUser, logoutUser, UserSession } from "@/lib/authStore";
import { Menu, X, Sparkles, User, LogOut, PenTool } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const check = () => {
      setCurrentUser(getCurrentUser());
    };
    check();
    window.addEventListener("ficforge_auth_changed", check);
    return () => window.removeEventListener("ficforge_auth_changed", check);
  }, []);

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050B16]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-4 sm:px-6">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6D5DFB] via-[#9333EA] to-[#F97316] text-2xl shadow-lg shadow-purple-900/30 group-hover:scale-105 transition-transform">
            🔥
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Fic<span className="text-[#F97316]">Forge</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-slate-300">
          <Link href="/" className="text-white hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/browse" className="hover:text-white transition-colors">
            Browse
          </Link>
          <Link href="/write" className="hover:text-white transition-colors">
            Write
          </Link>
          <Link href="/community" className="hover:text-white transition-colors">
            Community
          </Link>
          <Link href="/premium" className="hover:text-[#F97316] transition-colors">
            Premium
          </Link>
        </nav>

        {/* Right Action: Auth Session */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Sparks pill */}
              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                <span>⚡</span>
                <span>{currentUser.sparksBalance} Sparks</span>
              </div>

              {/* Creator Studio Shortcut */}
              <Link
                href="/my-stories"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition-all"
              >
                <PenTool className="h-3.5 w-3.5 text-[#F97316]" />
                Workshop
              </Link>

              {/* Creator Spotlight Shortcut */}
              <Link
                href="/write/promote"
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 transition-all"
                title="Creator Spotlight Promotion"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Spotlight
              </Link>

              {/* Avatar & Name */}
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-2.5 py-1 hover:border-white/30 transition-all"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
                <span className="text-xs font-bold text-white">{currentUser.name}</span>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-[#6D5DFB] hover:bg-[#5B4BE0] px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
              >
                Log In
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#070E1E] px-4 pt-3 pb-6 md:hidden">
          <div className="flex flex-col space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 rounded-lg"
            >
              Home
            </Link>
            <Link
              href="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg"
            >
              Browse
            </Link>
            <Link
              href="/write"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg"
            >
              Write
            </Link>
            <Link
              href="/community"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg"
            >
              Community
            </Link>
            <Link
              href="/premium"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-semibold text-[#F97316] hover:bg-slate-800 rounded-lg"
            >
              Premium
            </Link>

            <div className="pt-3 border-t border-white/10">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>{currentUser.name}</span>
                    <span className="text-amber-400 font-bold">⚡ {currentUser.sparksBalance} Sparks</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 text-xs font-bold text-red-400"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 rounded-lg bg-[#6D5DFB] text-xs font-bold text-white"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 rounded-lg border border-white/20 text-xs font-bold text-slate-300"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
