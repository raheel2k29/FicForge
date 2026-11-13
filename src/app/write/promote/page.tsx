"use client";

import Link from "next/link";
import { useState, useEffect, Suspense, useMemo } from "react";
import WriterAuthGate from "@/components/WriterAuthGate";
import { getAllStories } from "@/lib/storyStore";
import {
  getPromoCredits,
  setPromoCredits,
  getAllSpotlightCampaigns,
  getActiveSpotlight,
  activateSpotlight,
  SpotlightCampaign,
} from "@/lib/promotionStore";
import { StoryData } from "@/data/mockStories";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Eye,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Zap,
  Star,
  ExternalLink,
} from "lucide-react";

function PromotionDashboardContent() {
  const [stories, setStories] = useState<StoryData[]>([]);
  const [credits, setCredits] = useState<number>(1);
  const [campaigns, setCampaigns] = useState<SpotlightCampaign[]>([]);
  const [selectedStorySlug, setSelectedStorySlug] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const load = () => {
      const all = Object.values(getAllStories());
      setStories(all);
      setCredits(getPromoCredits());
      setCampaigns(getAllSpotlightCampaigns());

      if (all.length > 0 && !selectedStorySlug) {
        setSelectedStorySlug(all[0].slug);
      }
    };

    load();
    window.addEventListener("ficforge_spotlight_updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("ficforge_spotlight_updated", load);
      window.removeEventListener("storage", load);
    };
  }, [selectedStorySlug]);

  const selectedStory = useMemo(() => {
    return stories.find((s) => s.slug === selectedStorySlug) || stories[0];
  }, [stories, selectedStorySlug]);

  const activeSpotlight = useMemo(() => {
    return campaigns.find((c) => c.status === "ACTIVE");
  }, [campaigns]);

  const handleLaunchPromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStorySlug || credits < 1) return;

    const ok = activateSpotlight(selectedStorySlug, 7);
    if (ok) {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 4000);
    }
  };

  // Add 1 test credit for easy client testing
  const addTestCredit = () => {
    setPromoCredits(credits + 1);
  };

  return (
    <div className="min-h-screen bg-[#050B16] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1180px] mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/my-stories"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Workshop
          </Link>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Forge Plus Member
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="border-b border-white/10 pb-6">
          <span className="text-xs font-black tracking-widest uppercase text-[#F97316]">
            CREATOR DISCOVERY ENGINE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
            Homepage Spotlight Promotions
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
            Redeem monthly membership promotion credits to feature your story on the FicForge Homepage & Discovery Showcase for 7 days.
          </p>
        </div>

        {/* Success Alert */}
        {isSuccess && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-sm text-emerald-300 flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Spotlight Activated!</strong> "{selectedStory?.title}" is now live in the Homepage & Discovery Spotlight Showcase.
            </span>
          </div>
        )}

        {/* Stats & Credit Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Spotlight Credits
              </span>
              <button
                type="button"
                onClick={addTestCredit}
                className="text-[10px] font-bold text-amber-400/80 hover:text-amber-300 underline"
                title="Add 1 credit for test"
              >
                + Add Test Credit
              </button>
            </div>
            <p className="text-3xl font-black text-white mt-1">
              {credits} {credits === 1 ? "Credit" : "Credits"}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">
              Monthly allocation: 1 for Plus, 3 for Elite
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Current Active Spotlight
            </span>
            <p className="text-xl font-black text-white mt-2 truncate">
              {activeSpotlight ? activeSpotlight.storyTitle : "None active"}
            </p>
            <span className="text-[11px] text-emerald-400 mt-1 inline-block">
              ● Active on Homepage & Browse
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Spotlight Reach
            </span>
            <p className="text-3xl font-black text-white mt-1">
              {activeSpotlight ? activeSpotlight.impressions.toLocaleString() : "0"}
            </p>
            <span className="text-[11px] text-indigo-400 mt-1 inline-block">
              Reader impressions generated
            </span>
          </div>
        </div>

        {/* Transparent Compliance Standard Box */}
        <div className="rounded-2xl border border-white/10 bg-[#020617]/70 p-4 text-xs text-slate-400 space-y-1.5 leading-relaxed">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Transparent Platform Policy</span>
          </div>
          <p>
            Creator Spotlights are clearly and honestly labeled with the golden <strong className="text-amber-300">✦ Creator Spotlight</strong> badge. FicForge strictly prohibits buying reviews, fake rating stars, or manipulating algorithmic ranking scores. All reader reviews, comment threads, and organic charts remain 100% independent.
          </p>
        </div>

        {/* Launch New Spotlight Campaign Form & Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-slate-900/85 p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#F97316]">
                NEW CAMPAIGN
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                Launch a 7-Day Spotlight
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select one of your published stories to showcase in the top discovery banner.
              </p>
            </div>

            <form onSubmit={handleLaunchPromotion} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                  Select Story to Promote
                </label>
                <select
                  value={selectedStorySlug}
                  onChange={(e) => setSelectedStorySlug(e.target.value)}
                  className="w-full h-12 rounded-xl border border-white/15 bg-[#020617] px-4 text-sm font-bold text-white outline-none focus:border-[#6D5DFB]"
                >
                  {stories.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title} ({s.classification === "FANFICTION" ? "Fanfiction" : "Original"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-slate-800/60 p-4">
                  <span className="block text-xs text-slate-400 font-bold uppercase mb-1">
                    Placement
                  </span>
                  <strong className="text-sm text-white">Homepage & Browse Hero</strong>
                  <span className="block text-[11px] text-slate-400 mt-0.5">Top prominent showcase</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-800/60 p-4">
                  <span className="block text-xs text-slate-400 font-bold uppercase mb-1">
                    Duration
                  </span>
                  <strong className="text-sm text-white">7 Days Active</strong>
                  <span className="block text-[11px] text-slate-400 mt-0.5">Cost: 1 Spotlight Credit</span>
                </div>
              </div>

              {credits > 0 ? (
                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-[#F97316] text-sm font-black text-slate-950 shadow-xl shadow-orange-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  Redeem 1 Credit & Activate Spotlight
                </button>
              ) : (
                <div className="rounded-xl border border-white/10 bg-slate-800/80 p-4 text-center space-y-2">
                  <p className="text-xs text-slate-300">
                    You have 0 Spotlight Credits remaining this month.
                  </p>
                  <Link
                    href="/premium"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#F97316] hover:underline"
                  >
                    Upgrade to Forge Plus / Elite for Monthly Credits →
                  </Link>
                </div>
              )}
            </form>
          </div>

          {/* Live Preview Card (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <span className="block text-xs font-black uppercase tracking-wider text-slate-400">
              Live Showcase Preview
            </span>

            {selectedStory && (
              <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-slate-900 to-[#070E1E] p-5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl pointer-events-none" />

                {/* Golden Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 shadow-sm shadow-amber-500/20">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    CREATOR SPOTLIGHT
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">
                    Homepage Feature
                  </span>
                </div>

                <div className="flex gap-4">
                  <img
                    src={selectedStory.coverImageUrl}
                    alt={selectedStory.title}
                    className="h-28 w-20 rounded-xl object-cover shadow-lg border border-white/15 shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase text-[#F97316]">
                      {selectedStory.classification === "FANFICTION" ? "100% Free Fanfiction" : "Original Webnovel"}
                    </span>
                    <h4 className="text-base font-black text-white truncate mt-0.5">
                      {selectedStory.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      by {selectedStory.author?.name || "Author"}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {selectedStory.synopsis}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>{(selectedStory.chapters || []).length} Chapters</span>
                  <span className="text-amber-400 font-bold">Featured 7 Days</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Spotlight History Table */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-black text-white">Campaign Performance History</h3>
              <p className="text-xs text-slate-400">
                Track reader reach, impressions, and duration for all active and past promotions.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Story</th>
                  <th className="py-3 px-3">Placement</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Impressions</th>
                  <th className="py-3 px-3">Clicks</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-2.5">
                      <img src={c.coverImageUrl} alt={c.storyTitle} className="h-8 w-6 rounded object-cover" />
                      <span className="truncate max-w-[220px]">{c.storyTitle}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-300">
                      Homepage & Browse Hero
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-400 font-mono">
                      {c.startDate} – {c.endDate}
                    </td>
                    <td className="py-3 px-3 text-xs font-mono text-indigo-400">
                      {c.impressions.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-xs font-mono text-emerald-400">
                      {c.clicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                          c.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-white/5 text-slate-400"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function PromotionDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050B16] flex items-center justify-center text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      }
    >
      <WriterAuthGate
        title="Creator Spotlight Promotion"
        description="Sign in to your creator account to redeem promotion credits and launch Spotlight campaigns on the Homepage and Browse Showcase."
      >
        <PromotionDashboardContent />
      </WriterAuthGate>
    </Suspense>
  );
}
