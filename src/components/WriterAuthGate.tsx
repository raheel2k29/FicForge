"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCurrentUser, loginAsDemoCreator, UserSession } from "@/lib/authStore";
import {
  Lock,
  Sparkles,
  BookOpen,
  UploadCloud,
  TrendingUp,
  UserCheck,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface WriterAuthGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function WriterAuthGate({
  children,
  title = "Welcome to the FicForge Writer Portal",
  description = "Create a FicForge account or sign in to access your writer dashboard, workshop, story editor, and bulk chapter importer.",
}: WriterAuthGateProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const check = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      setHasChecked(true);
    };

    check();
    window.addEventListener("ficforge_auth_changed", check);
    return () => window.removeEventListener("ficforge_auth_changed", check);
  }, []);

  const handleQuickDemoLogin = () => {
    loginAsDemoCreator();
  };

  // Prevent flash of unauthenticated gate before reading localStorage
  if (!hasChecked) {
    return (
      <div className="min-h-[60vh] bg-[#050B16] flex items-center justify-center text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // If user is authenticated, render the writer tools directly!
  if (currentUser) {
    return <>{children}</>;
  }

  // Unauthenticated: Show the Writer Portal Gate
  return (
    <div className="min-h-[80vh] bg-[#050B16] text-white py-14 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-[1080px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Main Gate Card (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-[#070E1E] to-slate-950 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#6D5DFB]/15 to-[#F97316]/10 blur-3xl pointer-events-none" />

          <span className="inline-flex items-center text-xs font-black tracking-widest uppercase text-[#F97316] bg-orange-500/10 border border-orange-500/30 rounded-full px-3.5 py-1.5 mb-5">
            WRITER AUTHENTICATION REQUIRED
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {title}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            {description}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all"
            >
              Sign In <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/register"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-slate-800/80 px-6 py-3.5 text-sm font-bold text-slate-200 hover:text-white hover:border-white/40 transition-all"
            >
              Create Account
            </Link>
          </div>

          {/* 1-Click Demo Login for Testing */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-slate-400 font-semibold">
                Client / Review Testing:
              </span>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-black text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer shadow-md shadow-amber-500/10"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                1-Click Sign In as Creator (Test)
              </button>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-slate-500">
            🔒 Authors retain 100% intellectual rights to their original works. FicForge complies strictly with Safe Harbor protections for fanfiction.
          </div>
        </div>

        {/* Right: Feature Highlights (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <BookOpen className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Creator Workshop</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create stories, organize drafts, format individual chapters, and manage releases from one central dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <UploadCloud className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Smart Bulk Importer</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload 5, 10, 25, or 50+ chapters in one click or paste your full manuscript. Auto-splits without merging.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Reader Engagement & Tipping</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Build a dedicated following with comment discussions, reaction emojis, and optional Fast Pass monetization.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
