"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, BookOpen, PenTool, Sparkles, Shield, Bookmark, User } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050B16]/85 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-xl shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              🔥
            </span>
            <span className="text-2xl font-black tracking-tight text-white">
              Fic<span className="text-[#F97316]">Forge</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-300">
            <Link href="/browse" className="hover:text-white transition-colors">
              Browse
            </Link>
            <Link href="/premium" className="flex items-center gap-1.5 hover:text-[#F97316] transition-colors">
              <Sparkles className="h-4 w-4 text-[#F97316]" />
              Premium
            </Link>
            <Link href="/community" className="hover:text-white transition-colors">
              Community
            </Link>
            <Link href="/write" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <PenTool className="h-4 w-4 text-[#A78BFA]" />
              Write
            </Link>
            <Link href="/library" className="hover:text-white transition-colors">
              My Library
            </Link>
          </nav>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/browse"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white hover:border-white/25 transition-all"
            title="Search Stories"
          >
            <Search className="h-4 w-4" />
          </Link>

          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>

          <Link
            href="/write"
            className="rounded-lg bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-5 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/25 hover:from-[#5B4BE0] hover:to-[#6D5DFB] hover:shadow-indigo-600/40 transition-all active:scale-95"
          >
            Start Writing
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:text-white"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#0B1220] px-4 py-6 md:hidden">
          <nav className="flex flex-col gap-4 text-base font-bold text-slate-200">
            <Link
              href="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5"
            >
              <BookOpen className="h-5 w-5 text-[#F97316]" />
              Browse Stories
            </Link>
            <Link
              href="/premium"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5"
            >
              <Sparkles className="h-5 w-5 text-[#F97316]" />
              Premium & Sparks
            </Link>
            <Link
              href="/community"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5"
            >
              <Shield className="h-5 w-5 text-[#34D399]" />
              Community Hub
            </Link>
            <Link
              href="/write"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5"
            >
              <PenTool className="h-5 w-5 text-[#A78BFA]" />
              Writer Portal
            </Link>
            <Link
              href="/library"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5"
            >
              <Bookmark className="h-5 w-5 text-[#60A5FA]" />
              My Saved Library
            </Link>

            <div className="my-2 border-t border-white/10 pt-4 flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-lg border border-white/15 px-4 py-2.5 text-center font-bold text-white hover:bg-white/5"
              >
                Sign In
              </Link>
              <Link
                href="/write"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-4 py-2.5 text-center font-extrabold text-white shadow-md shadow-indigo-600/30"
              >
                Start Writing
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
