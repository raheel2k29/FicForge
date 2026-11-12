"use client";

import Link from "next/link";
import WriterAuthGate from "@/components/WriterAuthGate";
import {
  PenTool,
  UploadCloud,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight,
  FolderOpen,
} from "lucide-react";

export default function WriterPortalPage() {
  return (
    <WriterAuthGate
      title="Welcome to the FicForge Writer Portal"
      description="Create a FicForge account or sign in to access your writer dashboard, workshop, profile tools, analytics, earnings, and chapter editors."
    >
      <div className="min-h-screen bg-[#050B16] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1180px] mx-auto space-y-12">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center text-xs font-black tracking-widest uppercase text-[#F97316] bg-orange-500/10 border border-orange-500/30 rounded-full px-3.5 py-1.5 mb-4">
            CREATOR STUDIO
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Where Worlds Are Built & Stories Are Forged
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Write serialized fiction, batch import full manuscripts without hassle, and share your storytelling with an ad-free community of passionate readers.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/write/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] via-[#7C3AED] to-[#F97316] px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-indigo-600/30 hover:opacity-95 transition-all"
            >
              <PenTool className="h-4 w-4" /> Start a New Story
            </Link>

            <Link
              href="/write/bulk-import"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-slate-200 hover:border-[#6D5DFB] hover:text-[#A78BFA] transition-all"
            >
              <UploadCloud className="h-4 w-4" /> Bulk Import Manuscript
            </Link>

            <Link
              href="/my-stories"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <FolderOpen className="h-4 w-4" /> Open My Stories
            </Link>
          </div>
        </div>

        {/* Core Publishing Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl relative overflow-hidden group hover:border-[#6D5DFB]/40 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
              <UploadCloud className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Smart Bulk Importer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload 5, 10, 25, or 50+ chapters in one click or paste your full manuscript. Our engine splits and indexes each chapter atomically.
            </p>
            <Link
              href="/write/bulk-import"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300"
            >
              Try Bulk Importer →
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">100% Free Fanfiction</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transformative fanworks remain strictly free with zero paywalls. Connect with passionate fandom communities in a safe environment.
            </p>
            <Link
              href="/write/new"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              Forge Fanfiction →
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl relative overflow-hidden group hover:border-orange-500/40 transition-all">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-[#F97316] mb-4 border border-orange-500/20">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Fast Pass & Tipping</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monetize original webnovels with early access Fast Pass countdowns and reader Sparks tipping deposited directly into your creator vault.
            </p>
            <Link
              href="/write/new"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#F97316] hover:text-orange-400"
            >
              Publish Original Fiction →
            </Link>
          </div>

        </div>

      </div>
    </div>
    </WriterAuthGate>
  );
}
