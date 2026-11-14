"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import WriterAuthGate from "@/components/WriterAuthGate";
import CreatorStudioHeader from "@/components/CreatorStudioHeader";
import { getAllStories, syncStoriesWithServer } from "@/lib/storyStore";
import { getActiveSpotlights, getPromoCredits, syncSpotlightsWithServer } from "@/lib/promotionStore";
import { getCurrentUser, UserSession } from "@/lib/authStore";
import { StoryData } from "@/data/mockStories";
import {
  PenTool,
  UploadCloud,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight,
  Eye,
  Plus,
  DollarSign,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function WriterPortalPage() {
  const [stories, setStories] = useState<StoryData[]>([]);
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeSpotlights, setActiveSpotlights] = useState<any[]>([]);
  const [credits, setCredits] = useState(2);

  useEffect(() => {
    const load = () => {
      const all = Object.values(getAllStories());
      setStories(all);
      setUser(getCurrentUser());
      setActiveSpotlights(getActiveSpotlights());
      setCredits(getPromoCredits());
    };

    load();

    // Reconcile with live PostgreSQL database
    syncStoriesWithServer().then((serverStories) => {
      if (serverStories) {
        setStories(Object.values(serverStories));
      }
    });

    syncSpotlightsWithServer().then((serverCampaigns) => {
      if (serverCampaigns && serverCampaigns.length > 0) {
        const now = Date.now();
        const active = serverCampaigns.filter((c) => c.status === "ACTIVE" && now < c.endTimestamp);
        setActiveSpotlights(active);
      }
    });

    window.addEventListener("ficforge_stories_updated", load);
    window.addEventListener("ficforge_spotlight_updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("ficforge_stories_updated", load);
      window.removeEventListener("ficforge_spotlight_updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  // Aggregated Author Stats
  const totalWords = stories.reduce((acc, s) => acc + (s.stats?.words || 0), 0);
  const totalViews = stories.reduce((acc, s) => acc + (s.stats?.views || 0), 0);
  const totalChapters = stories.reduce((acc, s) => acc + (s.chapters?.length || 0), 0);
  const totalLikes = stories.reduce((acc, s) => acc + (s.stats?.likes || 0), 0);

  return (
    <WriterAuthGate
      title="Creator Studio Login Required"
      description="Sign in or use 1-click test login to access your Creator Studio, stories, chapter editors, and spotlight promotions."
    >
      <div className="min-h-screen bg-[#050B16] text-white">
        
        {/* Unified Studio Navigation Header */}
        <CreatorStudioHeader currentTab="dashboard" />

        <div className="max-w-[1240px] mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Welcome Banner */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-[#0B132B] to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 via-[#F97316]/10 to-transparent blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <img
                  src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                  alt={user?.name || "Author"}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-white">
                      Welcome back, {user?.name || "Valerius Frost"}
                    </h1>
                    <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 px-3 py-0.5 text-xs font-black text-amber-300">
                      ✦ {user?.membershipTier ? `Forge ${user.membershipTier}` : "Forge Plus"} Creator
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300">
                    Your author command center. Manage your serialized catalog, publish new chapters, and grow your audience.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/write/chapter"
                  className="rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-5 py-3 text-xs font-black text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Write Chapter
                </Link>

                <Link
                  href="/write/new"
                  className="rounded-xl border border-white/20 bg-slate-800/80 px-4 py-3 text-xs font-bold text-slate-200 hover:text-white transition-all inline-flex items-center gap-1.5"
                >
                  <PenTool className="h-3.5 w-3.5 text-orange-400" /> New Story
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid (4 cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Stories Published</span>
                <BookOpen className="h-4 w-4 text-[#6D5DFB]" />
              </div>
              <p className="text-3xl font-black text-white">{stories.length}</p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {totalChapters} total chapters active
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Total Words Written</span>
                <PenTool className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-white">
                {totalWords.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Across all published works
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl hover:border-white/20 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Total Reader Views</span>
                <Eye className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-3xl font-black text-white">
                {totalViews.toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-400 mt-1 block">
                ♥ {totalLikes.toLocaleString()} story bookmarks
              </span>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 p-5 shadow-xl hover:border-amber-500/50 transition-all">
              <div className="flex items-center justify-between text-amber-400 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider">Spotlight Credits</span>
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white">
                {credits} {credits === 1 ? "Credit" : "Credits"}
              </p>
              <span className="text-[11px] text-amber-300 mt-1 block">
                {activeSpotlights.length} live on Homepage
              </span>
            </div>

          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Link
              href="/write/chapter"
              className="p-4 rounded-2xl border border-white/10 bg-slate-900/60 hover:border-[#6D5DFB]/50 hover:bg-slate-900 transition-all group flex items-center gap-3.5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Write Chapter
                </h4>
                <p className="text-[11px] text-slate-400">Word count & autosave</p>
              </div>
            </Link>

            <Link
              href="/write/bulk-import"
              className="p-4 rounded-2xl border border-white/10 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-slate-900 transition-all group flex items-center gap-3.5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Bulk Chapter Importer
                </h4>
                <p className="text-[11px] text-slate-400">Import up to 50+ chapters</p>
              </div>
            </Link>

            <Link
              href="/write/promote"
              className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60 hover:bg-amber-500/10 transition-all group flex items-center gap-3.5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Spotlight Promotion
                </h4>
                <p className="text-[11px] text-slate-400">7-Day Homepage Showcase</p>
              </div>
            </Link>

            <Link
              href="/creator-earnings"
              className="p-4 rounded-2xl border border-white/10 bg-slate-900/60 hover:border-orange-500/50 hover:bg-slate-900 transition-all group flex items-center gap-3.5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-[#F97316] border border-orange-500/20 group-hover:scale-105 transition-transform">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                  Creator Vault & Payouts
                </h4>
                <p className="text-[11px] text-slate-400">Tips, Fast Pass & Withdrawals</p>
              </div>
            </Link>

          </div>

          {/* Main Dashboard Layout (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Recent Stories Catalog (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Your Serialized Stories</h3>
                  <p className="text-xs text-slate-400">Manage drafts, add chapters, or launch promotions.</p>
                </div>

                <Link
                  href="/my-stories"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                >
                  View All in Workshop <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {stories.map((story) => {
                  return (
                    <div
                      key={story.slug}
                      className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={story.coverImageUrl}
                          alt={story.title}
                          className="h-16 w-12 rounded-xl object-cover shrink-0 border border-white/10"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-[#F97316]">
                              {story.classification === "FANFICTION" ? "100% Free Fanfic" : "Original Novel"}
                            </span>
                            <span className="text-[10px] text-slate-500">•</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {(story.chapters || []).length} Chapters
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white truncate mt-0.5">
                            {story.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {(story.stats?.words || 0).toLocaleString()} words • {(story.stats?.views || 0).toLocaleString()} views
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <Link
                          href={`/write/chapter?storySlug=${story.slug}`}
                          className="px-3 py-1.5 rounded-xl border border-white/10 bg-slate-800 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-700 transition-all"
                        >
                          + Chapter
                        </Link>

                        <Link
                          href={`/write/promote?storySlug=${story.slug}`}
                          className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all shadow-sm shadow-amber-500/10 inline-flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3 text-amber-400" /> Spotlight
                        </Link>

                        <Link
                          href={`/story/${story.slug}`}
                          className="px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                          title="View live reader page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Live Spotlight & Monetization Widgets (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Active Spotlight Card */}
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-slate-900 to-[#070E1E] p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-300 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-400" /> CREATOR SPOTLIGHT
                    </span>
                  </div>
                  <Link
                    href="/write/promote"
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Manage →
                  </Link>
                </div>

                {activeSpotlights.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      You have <strong>{activeSpotlights.length}</strong> active campaign(s) live in the Homepage & Discovery Spotlight Showcase.
                    </p>

                    <div className="space-y-2">
                      {activeSpotlights.slice(0, 2).map((camp) => (
                        <div key={camp.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-white/10">
                          <img src={camp.coverImageUrl} alt={camp.storyTitle} className="h-10 w-8 rounded object-cover" />
                          <div className="overflow-hidden flex-1">
                            <h5 className="text-xs font-bold text-white truncate">{camp.storyTitle}</h5>
                            <span className="text-[10px] text-amber-300 font-mono">
                              Ends {camp.endDate}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            Live
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/"
                        className="w-full py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View on Homepage Showcase
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-2">
                    <p className="text-xs text-slate-300">
                      No active spotlight campaigns right now.
                    </p>
                    <Link
                      href="/write/promote"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline"
                    >
                      Redeem 1 Credit to Feature a Story →
                    </Link>
                  </div>
                )}
              </div>

              {/* Creator Vault & Payouts Widget */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Creator Vault Status
                  </span>
                  <Link
                    href="/creator-earnings"
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Details →
                  </Link>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-white">450 Sparks</span>
                    <span className="text-xs text-slate-400 ml-2">($4.50 earned)</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    82/18 Vault
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                    <span>Payout Threshold</span>
                    <span className="font-mono text-slate-300">450 / 5,000 Sparks ($50 min)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full" style={{ width: "9%" }} />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    PayPal, Stripe Connect & Direct Payouts supported at $50 threshold.
                  </span>
                </div>

                <Link
                  href="/withdraw-funds"
                  className="w-full py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
                >
                  Withdrawal Portal
                </Link>
              </div>

            </div>

          </div>

        </div>

      </div>
    </WriterAuthGate>
  );
}
