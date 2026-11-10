"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        {/* Right Action: Log In */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-[#6D5DFB] hover:bg-[#5B4BE0] px-6 py-2.5 text-[15px] font-bold text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            Log In
          </Link>
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
              className="rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-slate-800"
            >
              Home
            </Link>
            <Link
              href="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Browse
            </Link>
            <Link
              href="/write"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Write
            </Link>
            <Link
              href="/community"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Community
            </Link>
            <Link
              href="/premium"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-semibold text-[#F97316] hover:bg-slate-800"
            >
              Premium
            </Link>
            <div className="pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center rounded-lg bg-[#6D5DFB] py-3 text-base font-bold text-white shadow-md shadow-indigo-600/30"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
