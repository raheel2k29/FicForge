"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { getAllStories } from "@/lib/storyStore";
import { getActiveSpotlights, SpotlightCampaign, isStorySpotlighted } from "@/lib/promotionStore";
import { StoryData } from "@/data/mockStories";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Heart,
  Star,
  FileText,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function HomeFeaturedStories() {
  const [stories, setStories] = useState<StoryData[]>([]);
  const [activeSpotlights, setActiveSpotlights] = useState<SpotlightCampaign[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const load = () => {
      const all = Object.values(getAllStories());
      setStories(all);
      const spotlights = getActiveSpotlights();
      setActiveSpotlights(spotlights);
      // Ensure index is within range
      setCurrentIndex((prev) => (spotlights.length > 0 ? prev % spotlights.length : 0));
    };

    load();
    window.addEventListener("ficforge_stories_updated", load);
    window.addEventListener("ficforge_spotlight_updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("ficforge_stories_updated", load);
      window.removeEventListener("ficforge_spotlight_updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  // Auto-advance multi-spotlight carousel every 6 seconds when not hovered
  useEffect(() => {
    if (activeSpotlights.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSpotlights.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [activeSpotlights.length, isPaused]);

  // Current active spotlight story
  const currentCampaign = activeSpotlights[currentIndex] || activeSpotlights[0];
  const spotlightStory = currentCampaign
    ? stories.find((s) => s.slug === currentCampaign.storySlug) || stories[0]
    : stories[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeSpotlights.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSpotlights.length);
  };

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-white/10 bg-[#050B16]">
      <div className="max-w-[1180px] mx-auto space-y-12">
        
        {/* ========================================= */}
        {/* CREATOR SPOTLIGHT PROMOTION SHOWCASE      */}
        {/* ========================================= */}
        {spotlightStory && (
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-slate-900/95 via-[#0A1020] to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden group transition-all"
          >
            {/* Ambient Spotlight Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/15 via-[#F97316]/10 to-transparent blur-3xl pointer-events-none" />

            {/* Spotlight Header Badges & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-md shadow-amber-500/20">
                  <Sparkles className="h-3.5 w-3.5 fill-slate-950" />
                  CREATOR SPOTLIGHT
                </span>

                {activeSpotlights.length > 1 && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                    {currentIndex + 1} of {activeSpotlights.length} Spotlighted Stories
                  </span>
                )}

                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                  • 7-Day Discovery Feature
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Previous / Next buttons when multiple spotlights are active */}
                {activeSpotlights.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-slate-800/80 border border-white/10 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                      title="Previous Spotlight"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-[11px] font-mono font-bold text-amber-400 px-1">
                      {currentIndex + 1}/{activeSpotlights.length}
                    </span>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                      title="Next Spotlight"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <Link
                  href="/write/promote"
                  className="text-xs font-bold text-amber-300 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Promote Your Story <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Spotlight Story Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
              {/* Cover Art (3 cols) */}
              <div className="md:col-span-3 flex justify-center">
                <Link href={`/story/${spotlightStory.slug}`} className="block">
                  <div className="h-64 w-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/30 bg-slate-950 relative group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={spotlightStory.coverImageUrl}
                      alt={spotlightStory.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  </div>
                </Link>
              </div>

              {/* Story Details (9 cols) */}
              <div className="md:col-span-9 space-y-4 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  {spotlightStory.classification === "FANFICTION" ? (
                    <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase">
                      100% Free Fanfiction • {spotlightStory.fandom || "Fandom"}
                    </span>
                  ) : (
                    <span className="rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase">
                      Original Webnovel
                    </span>
                  )}

                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300 uppercase">
                    {spotlightStory.rating || "GENERAL"}
                  </span>

                  {currentCampaign && (
                    <span className="text-[10px] font-mono text-amber-400/90 ml-auto hidden sm:inline">
                      ⚡ Active Campaign: {currentCampaign.impressions.toLocaleString()} views
                    </span>
                  )}
                </div>

                <Link href={`/story/${spotlightStory.slug}`}>
                  <h3 className="text-2xl sm:text-3xl font-black text-white hover:text-amber-300 transition-colors">
                    {spotlightStory.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-2">
                  <img
                    src={spotlightStory.author?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                    alt={spotlightStory.author?.name || "Author"}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span className="text-xs font-bold text-slate-300">
                    by {spotlightStory.author?.name || "Author"}
                  </span>
                  {spotlightStory.author?.isVerified && (
                    <span className="text-blue-400 text-xs font-bold" title="Verified Creator">
                      ✓
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl line-clamp-3">
                  {spotlightStory.synopsis}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="font-semibold text-slate-300">
                    📖 {(spotlightStory.chapters || []).length} Chapters
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-slate-300">
                    ✍️ {(spotlightStory.stats?.words || 0).toLocaleString()} Words
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-amber-300">
                    ⚡ Featured Spotlight Story
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    href={`/story/${spotlightStory.slug}`}
                    className="rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-[#F97316] px-6 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-orange-500/20 hover:opacity-95 transition-all inline-flex items-center gap-1.5"
                  >
                    Read Spotlight Story <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    href="/browse"
                    className="rounded-xl border border-white/20 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-all"
                  >
                    View in Library
                  </Link>
                </div>
              </div>
            </div>

            {/* Multi-Spotlight Selector Shelf: When multiple stories are spotlighted */}
            {activeSpotlights.length > 1 && (
              <div className="mt-8 pt-5 border-t border-white/10 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" /> All Live Spotlights ({activeSpotlights.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click to switch featured preview
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {activeSpotlights.map((camp, idx) => {
                    const s = stories.find((item) => item.slug === camp.storySlug);
                    const isSelected = idx === currentIndex;
                    const cover = camp.coverImageUrl || s?.coverImageUrl;
                    const title = camp.storyTitle || s?.title || "Story";

                    return (
                      <button
                        key={camp.id || camp.storySlug}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`text-left p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? "border-amber-400 bg-amber-500/20 shadow-md shadow-amber-500/10"
                            : "border-white/10 bg-slate-800/60 hover:bg-slate-800 hover:border-white/20"
                        }`}
                      >
                        <img
                          src={cover}
                          alt={title}
                          className="h-10 w-8 rounded-lg object-cover shrink-0 border border-white/10"
                        />
                        <div className="overflow-hidden">
                          <p className={`text-xs font-bold truncate ${isSelected ? "text-amber-300" : "text-white"}`}>
                            {title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            by {camp.authorName || s?.author?.name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Section Header for Trending Stories */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center text-xs font-black tracking-widest uppercase text-[#F97316] bg-orange-500/10 border border-orange-500/30 rounded-full px-3.5 py-1 mb-3">
              ✦ LIBRARY DISCOVERY
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Trending Stories & Releases
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Explore standout fanfiction, original serialized webnovels, and newly forged chapters published by creators across FicForge.
            </p>
          </div>

          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all self-start sm:self-auto shrink-0"
          >
            Explore Library ({stories.length} Stories) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => {
            const storyId = story.id || story.slug;
            const isSpotlighted = isStorySpotlighted(story.slug);

            return (
              <div
                key={storyId}
                className={`group relative flex flex-col rounded-2xl border bg-slate-900/80 overflow-hidden shadow-xl hover:bg-slate-900/95 transition-all duration-300 ${
                  isSpotlighted
                    ? "border-amber-500/40 ring-1 ring-amber-500/30 hover:border-amber-400"
                    : "border-white/10 hover:border-[#6D5DFB]/50"
                }`}
              >
                {/* Cover & Badges */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                  <img
                    src={story.coverImageUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"}
                    alt={story.title || "Story"}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/60" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isSpotlighted && (
                        <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                          ✦ Spotlight
                        </span>
                      )}

                      {story.classification === "FANFICTION" ? (
                        <span className="rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                          100% Free Fanfiction
                        </span>
                      ) : (
                        <span className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                          Original Webnovel
                        </span>
                      )}
                    </div>

                    <span className="rounded-full bg-white/20 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                      {story.rating || "GENERAL"}
                    </span>
                  </div>

                  {/* Bottom Cover Info */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 pointer-events-none">
                    <span className="font-extrabold text-[#F97316] drop-shadow-sm truncate max-w-[200px]">
                      {story.fandom ? `⚔️ ${story.fandom}` : story.genres?.[0] ? `✨ ${story.genres[0]}` : "✨ Story"}
                    </span>
                    <span className="text-[11px] text-slate-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md">
                      {story.chapters?.length || 0} Chapters
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-col flex-1 p-5">
                  <Link
                    href={`/story/${story.slug}`}
                    className="group-hover:text-[#F97316] transition-colors"
                  >
                    <h3 className="text-lg font-black text-white leading-snug line-clamp-1">
                      {story.title || "Untitled Story"}
                    </h3>
                  </Link>

                  <div className="mt-1 flex items-center gap-2">
                    <img
                      src={story.author?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                      alt={story.author?.name || "Author"}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      {story.author?.name || "Author"}
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {story.synopsis}
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      {(story.stats?.words || 0).toLocaleString()} words
                    </span>

                    <Link
                      href={`/story/${story.slug}`}
                      className="rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-4 py-1.5 text-xs font-extrabold text-white shadow-md shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all"
                    >
                      Read Now →
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
