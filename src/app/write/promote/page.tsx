"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useMemo } from "react";
import WriterAuthGate from "@/components/WriterAuthGate";
import { getAllStories } from "@/lib/storyStore";
import {
  getPromoCredits,
  setPromoCredits,
  getAllSpotlightCampaigns,
  getActiveSpotlights,
  endSpotlightCampaign,
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
  const searchParams = useSearchParams();
  const storySlugParam = searchParams.get("storySlug");

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

      if (storySlugParam && all.some((s) => s.slug === storySlugParam)) {
        setSelectedStorySlug(storySlugParam);
      } else if (all.length > 0 && !selectedStorySlug) {
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
  }, [storySlugParam, selectedStorySlug]);

  const selectedStory = useMemo(() => {
    return stories.find((s) => s.slug === selectedStorySlug) || stories[0];
  }, [stories, selectedStorySlug]);

  const activeSpotlights = useMemo(() => {
    return campaigns.filter(
      (c) => c.status === "ACTIVE" || (c.endDate && c.endDate.includes("(Active)"))
    );
  }, [campaigns]);

  const totalImpressions = useMemo(() => {
    return campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
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

  const handleEndCampaign = (campaignId: string) => {
    if (confirm("Are you sure you want to end this spotlight early?")) {
      endSpotlightCampaign(campaignId);
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
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1 text-xs font-bold text-slate-300 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View Homepage Showcase
            </Link>

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
            Redeem monthly membership promotion credits to feature your story on the FicForge Homepage & Discovery Showcase for 7 days. Multiple stories can be spotlighted simultaneously.
          </p>
        </div>

        {/* Success Alert */}
        {isSuccess && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-sm text-emerald-300 flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <strong>Spotlight Activated!</strong> "{selectedStory?.title}" is now live in the Homepage Showcase alongside all active spotlights.
            </div>
            <Link
              href="/"
              className="text-xs font-black text-amber-300 hover:underline shrink-0"
            >
              View on Homepage →
            </Link>
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
              Active Spotlights Live
            </span>
            <p className="text-3xl font-black text-white mt-1">
              {activeSpotlights.length} {activeSpotlights.length === 1 ? "Story" : "Stories"}
            </p>
            <span className="text-[11px] text-emerald-400 mt-1 inline-block">
              ● Live in Homepage Multi-Spotlight Showcase
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Spotlight Reach
            </span>
            <p className="text-3xl font-black text-white mt-1">
              {totalImpressions.toLocaleString()}
            </p>
            <span className="text-[11px] text-indigo-400 mt-1 inline-block">
              Reader impressions across all campaigns
            </span>
          </div>
        </div>

        {/* Transparent Compliance Standard Box */}
        <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-0.5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-xs space-y-1">
              <h4 className="font-extrabold text-white text-sm">
                FicForge Transparent Promotion Guarantee
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Spotlight features are clearly designated with a <strong>✦ CREATOR SPOTLIGHT</strong> badge for full reader transparency. Paid promotions provide visibility through curated homepage slots and do not manipulate organic algorithm ranks. Both 100% Free Fanfiction and Original works are eligible.
              </p>
            </div>
          </div>
        </div>

        {/* Promotion Launcher Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-white">
              Launch a 7-Day Spotlight Campaign
            </h2>

            <form onSubmit={handleLaunchPromotion} className="space-y-6">
              
              {/* Story Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Select Story to Feature
                </label>
                <select
                  value={selectedStorySlug}
                  onChange={(e) => setSelectedStorySlug(e.target.value)}
                  className="w-full h-12 rounded-xl border border-white/10 bg-slate-800 px-4 text-sm font-semibold text-white outline-none focus:border-amber-400 transition-colors"
                >
                  {stories.map((story) => (
                    <option key={story.slug} value={story.slug}>
                      {story.title} ({story.classification === "FANFICTION" ? "Fanfiction" : "Original"})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Select any story from your catalog to feature prominently on the Homepage.
                </p>
              </div>

              {/* Placement Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-slate-800/60 p-4">
                  <span className="text-xs font-bold text-slate-300 block mb-1">
                    Placement
                  </span>
                  <strong className="text-sm text-white block">Homepage & Discovery Showcase</strong>
                  <span className="block text-[11px] text-slate-400 mt-0.5">Top of discovery feed with golden badge</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-800/60 p-4">
                  <span className="text-xs font-bold text-slate-300 block mb-1">
                    Campaign Duration
                  </span>
                  <strong className="text-sm text-amber-400 block">7 Consecutive Days</strong>
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
            <Link
              href="/"
              className="text-xs font-bold text-amber-300 hover:text-white transition-colors"
            >
              View on Homepage →
            </Link>
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
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {campaigns.map((c) => {
                  const isActive = c.status === "ACTIVE" || (c.endDate && c.endDate.includes("(Active)"));

                  return (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-bold text-white flex items-center gap-2.5">
                        <img src={c.coverImageUrl} alt={c.storyTitle} className="h-8 w-6 rounded object-cover" />
                        <span className="truncate max-w-[200px]">{c.storyTitle}</span>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-300">
                        Homepage & Discovery Hero
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
                      <td className="py-3 px-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                            isActive
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-white/5 text-slate-400"
                          }`}
                        >
                          {isActive ? "ACTIVE" : c.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isActive && (
                          <button
                            type="button"
                            onClick={() => handleEndCampaign(c.id)}
                            className="text-xs text-red-400 hover:text-red-300 underline font-semibold"
                            title="End this spotlight campaign early"
                          >
                            End Early
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
    <WriterAuthGate title="Creator Spotlight Promotions">
      <Suspense fallback={<div className="min-h-screen bg-[#050B16] text-white p-8">Loading promotion dashboard...</div>}>
        <PromotionDashboardContent />
      </Suspense>
    </WriterAuthGate>
  );
}
