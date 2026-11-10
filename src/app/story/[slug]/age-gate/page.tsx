"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { mockStories } from "@/data/mockStories";
import { ShieldAlert, ArrowLeft, CheckCircle2, Lock } from "lucide-react";

function AgeGateContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const story = mockStories[slug];

  const handleConfirmAge = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ficforge_age_verified", "true");
      router.push(`/story/${slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B16] text-white flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full rounded-3xl border border-red-500/30 bg-[#070E1E]/95 p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-red-600/15 blur-3xl pointer-events-none" />

        {/* Warning Icon & Badge */}
        <div className="text-center relative z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 mb-4 shadow-lg shadow-red-500/10">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <span className="inline-flex items-center text-xs font-black tracking-widest uppercase text-red-400 bg-red-500/10 border border-red-500/30 rounded-full px-3.5 py-1 mb-3">
            CONTENT FIREWALL • 18+ ONLY
          </span>

          <h1 className="text-3xl font-black text-white tracking-tight">
            Mature Content Advisory
          </h1>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            The story you are attempting to view contains themes, violence, language, or explicit scenes intended exclusively for mature audiences.
          </p>
        </div>

        {/* Story Card Preview */}
        {story && (
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/80 p-4 relative z-10">
            <img
              src={story.coverImageUrl}
              alt={story.title}
              className="h-20 w-14 rounded-lg object-cover shadow-md shrink-0 border border-white/10"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-500/15 px-2 py-0.5 rounded">
                EXPLICIT (18+)
              </span>
              <h3 className="text-base font-extrabold text-white truncate mt-1">
                {story.title}
              </h3>
              <p className="text-xs text-slate-400 truncate">by {story.author.name}</p>
            </div>
          </div>
        )}

        {/* Regulatory & Platform Compliance Notice */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-[#020617]/70 p-4 text-xs text-slate-400 relative z-10 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-200">Zero Commercialization:</strong> FicForge strictly disables all Sparks tipping, paid unlock tiers, and Fast Pass monetization on Explicit content.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-200">Legal Confirmation:</strong> By proceeding, you certify that you are at least 18 years old or the age of legal majority in your country of residence.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-col sm:flex-row gap-3 relative z-10">
          <button
            type="button"
            onClick={handleConfirmAge}
            className="flex-1 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-orange-500 transition-all cursor-pointer"
          >
            I am 18 or Older — Enter Story
          </button>
          <Link
            href="/browse"
            className="flex-1 rounded-xl border border-white/20 bg-slate-800/80 py-3.5 text-sm font-bold text-slate-300 hover:text-white transition-all text-center flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Browse
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function AgeGatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050B16] flex items-center justify-center text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      }
    >
      <AgeGateContent />
    </Suspense>
  );
}
