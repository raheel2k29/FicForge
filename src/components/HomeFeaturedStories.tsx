"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { getAllStories, syncStoriesWithServer } from "@/lib/storyStore";
import { getActiveSpotlights, SpotlightCampaign, isStorySpotlighted, syncSpotlightsWithServer } from "@/lib/promotionStore";
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
    try {
      localStorage.removeItem("ficforge_custom_stories_v1");
      localStorage.removeItem("ficforge_stories_v2");
    } catch {}

    const load = () => {
      const all = Object.values(getAllStories());
      setStories(all);
      const spotlights = getActiveSpotlights();
      setActiveSpotlights(spotlights);
      // Ensure index is within range
      setCurrentIndex((prev) => (spotlights.length > 0 ? prev % spotlights.length : 0));
    };

    // Reconcile with authoritative PostgreSQL database
    syncStoriesWithServer().then((serverStories) => {
      if (serverStories) {
        setStories(Object.values(serverStories));
      } else {
        load();
      }
    });

    syncSpotlightsWithServer().then((serverSpotlights) => {
      if (serverSpotlights && serverSpotlights.length > 0) {
        const active = serverSpotlights.filter((c) => c.status === "ACTIVE");
        if (active.length > 0) {
          setActiveSpotlights(active);
        }
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

  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Compute items to display in the Creator Spotlight Showcase
  // STRICT RULE: ONLY stories with an ACTIVE verified spotlight campaign are included!
  // Unpromoted stories must NEVER be falsely labeled or displayed as spotlight!
  const carouselItems = useMemo(() => {
    if (!activeSpotlights || activeSpotlights.length === 0) return [];

    const now = Date.now();
    return activeSpotlights
      .filter((c) => c.status === "ACTIVE" && now < c.endTimestamp)
      .map((c) => {
        const s = stories.find((item) => item.slug === c.storySlug);
        return s ? { story: s, campaign: c } : null;
      })
      .filter(Boolean) as { story: StoryData; campaign: SpotlightCampaign }[];
  }, [activeSpotlights, stories]);

  const updateScrollButtons = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const handleScroll = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const cardWidth = container.firstElementChild ? (container.firstElementChild as HTMLElement).offsetWidth + 20 : 320;
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Auto-advance multi-spotlight carousel every 6 seconds when not hovered
  useEffect(() => {
    if (carouselItems.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      if (!carouselRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        handleScroll("right");
      }
    }, 6000);

    return () => clearInterval(timer);
  }, [carouselItems.length, isPaused]);

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-white/10 bg-[#050B16]">
      <div className="max-w-[1240px] mx-auto space-y-12">
        
        {/* ========================================= */}
        {/* CREATOR SPOTLIGHT 3-4 CARD CAROUSEL       */}
        {/* ========================================= */}
        {carouselItems.length > 0 && (
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="space-y-6"
          >
            {/* Carousel Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-md shadow-amber-500/20">
                    <Sparkles className="h-3.5 w-3.5 fill-slate-950" />
                    CREATOR SPOTLIGHT
                  </span>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                    {carouselItems.length} Featured {carouselItems.length === 1 ? "Story" : "Stories"}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Creator Spotlight Showcase
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Featured community works backed by creator spotlight promotions.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                {/* Carousel Slider Controls (< and >) */}
                <div className="flex items-center gap-1.5 bg-slate-800/80 border border-white/10 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => handleScroll("left")}
                    disabled={!canScrollLeft}
                    className={`p-2 rounded-lg transition-colors ${
                      canScrollLeft
                        ? "text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer"
                        : "text-slate-600 cursor-not-allowed"
                    }`}
                    title="Previous Stories"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScroll("right")}
                    disabled={!canScrollRight}
                    className={`p-2 rounded-lg transition-colors ${
                      canScrollRight
                        ? "text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer"
                        : "text-slate-600 cursor-not-allowed"
                    }`}
                    title="Next Stories"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <Link
                  href="/write/promote"
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-black text-amber-300 px-4 py-2.5 transition-all inline-flex items-center gap-1.5 shrink-0"
                >
                  Promote Your Story <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* 3 to 4 Card Carousel Track */}
            <div
              ref={carouselRef}
              onScroll={updateScrollButtons}
              className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-3 pt-1"
            >
              {carouselItems.map(({ story, campaign }) => {
                const isSpotlightActive = !!campaign || isStorySpotlighted(story.slug);
                const storyId = story.id || story.slug;

                return (
                  <div
                    key={storyId}
                    className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] xl:w-[calc(25%-15px)] shrink-0 snap-start"
                  >
                    <div className="h-full rounded-2xl border-2 border-amber-500/30 bg-gradient-to-b from-slate-900 via-[#0A1020] to-slate-950 p-4 shadow-xl hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/15 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                      {/* Ambient Golden Glow Accent */}
                      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

                      <div>
                        {/* Cover Presentation (2:3 Book Ratio) */}
                        <Link href={`/story/${story.slug}`} className="block relative">
                          <div className="relative h-64 w-full rounded-xl overflow-hidden bg-slate-950 shadow-md border border-white/10">
                            <img
                              src={story.coverImageUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"}
                              alt={story.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/60" />

                            {/* Top Badges */}
                            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                                <Sparkles className="h-2.5 w-2.5 fill-slate-950" />
                                Spotlight
                              </span>

                              <span className="rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white uppercase border border-white/10">
                                {story.rating || "TEEN"}
                              </span>
                            </div>

                            {/* Bottom Classification on Cover */}
                            <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
                              {story.classification === "FANFICTION" ? (
                                <span className="inline-block rounded-md bg-emerald-500/90 backdrop-blur-md px-2 py-0.5 text-[9px] font-black uppercase text-slate-950 shadow-md">
                                  Free Fanfiction • {story.fandom || "Fandom"}
                                </span>
                              ) : (
                                <span className="inline-block rounded-md bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-0.5 text-[9px] font-black uppercase text-slate-950 shadow-md">
                                  Original Webnovel
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>

                        {/* Title & Author */}
                        <div className="mt-3">
                          <Link href={`/story/${story.slug}`}>
                            <h3 className="text-base font-black text-white hover:text-amber-300 transition-colors line-clamp-1 leading-snug">
                              {story.title}
                            </h3>
                          </Link>

                          <div className="mt-1.5 flex items-center gap-2">
                            <img
                              src={story.author?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                              alt={story.author?.name || "Author"}
                              className="h-5 w-5 rounded-full object-cover border border-white/10"
                            />
                            <span className="text-xs font-semibold text-slate-300 truncate">
                              {story.author?.name || "Author"}
                            </span>
                            {story.author?.isVerified && (
                              <span className="text-blue-400 text-xs font-bold shrink-0">✓</span>
                            )}
                          </div>

                          <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {story.synopsis}
                          </p>
                        </div>
                      </div>

                      {/* Footer & CTA */}
                      <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                          <span>📖 {story.chapters?.length || 0} Chapters</span>
                          <span>✍️ {(story.stats?.words || 0).toLocaleString()} words</span>
                        </div>

                        <Link
                          href={`/story/${story.slug}`}
                          className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-[#F97316] py-2 text-xs font-black text-slate-950 shadow-md shadow-orange-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          Read Spotlight Story <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>

                    </div>
                  </div>
                );
              })}

              {/* Open Spotlight Slot Invitation Card (if slots open) */}
              {carouselItems.length < 4 && (
                <div className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] xl:w-[calc(25%-15px)] shrink-0 snap-start">
                  <div className="h-full rounded-2xl border-2 border-dashed border-amber-500/30 bg-gradient-to-b from-slate-900/60 to-slate-950/80 p-5 shadow-lg flex flex-col justify-between items-center text-center hover:border-amber-400 hover:bg-slate-900/80 transition-all min-h-[380px]">
                    <div className="my-auto space-y-3">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-md">
                        <Sparkles className="h-7 w-7" />
                      </div>
                      <span className="inline-block text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1">
                        Open Spotlight Slot
                      </span>
                      <h4 className="text-base font-black text-white">Promote Your Story</h4>
                      <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed mx-auto">
                        Feature your serialized story on the homepage for maximum reader discovery.
                      </p>
                    </div>

                    <Link
                      href="/write/promote"
                      className="w-full rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 py-2.5 text-xs font-black text-amber-300 shadow-md shadow-amber-500/10 transition-all flex items-center justify-center gap-1.5"
                    >
                      Claim Spotlight Slot <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
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
