"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { getAllStories } from "@/lib/storyStore";
import { StoryData } from "@/data/mockStories";
import {
  Search,
  Filter,
  Heart,
  Bookmark,
  BookOpen,
  Sparkles,
  Zap,
  Eye,
  Check,
  CheckCircle2,
} from "lucide-react";

export default function BrowsePage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({});
  const [savedStories, setSavedStories] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<string | null>(null);

  const filters = [
    "All",
    "Fanfiction",
    "Original Fiction",
    "Fantasy",
    "Sci-Fi",
    "Action",
    "Adventure",
    "Cyberpunk",
    "Romance",
  ];

  const [storiesList, setStoriesList] = useState<StoryData[]>([]);

  useEffect(() => {
    const load = () => {
      const all = Object.values(getAllStories());
      setStoriesList(all);
    };

    load();
    window.addEventListener("ficforge_stories_updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("ficforge_stories_updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const filteredStories = useMemo(() => {
    return storiesList.filter((story) => {
      if (!story) return false;

      // Classification & Genre filter
      let matchesFilter = true;
      if (activeFilter === "Fanfiction") {
        matchesFilter = story.classification === "FANFICTION";
      } else if (activeFilter === "Original Fiction") {
        matchesFilter = story.classification === "ORIGINAL";
      } else if (activeFilter !== "All") {
        matchesFilter = (story.genres || []).includes(activeFilter);
      }

      // Keyword search
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === "" ||
        (story.title || "").toLowerCase().includes(query) ||
        (story.author?.name || "").toLowerCase().includes(query) ||
        (story.genres || []).some((g) => g.toLowerCase().includes(query)) ||
        (story.fandom && story.fandom.toLowerCase().includes(query)) ||
        (story.tags?.general || []).some((t) => t.toLowerCase().includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [storiesList, activeFilter, searchQuery]);

  const toggleLike = (storyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedStories((prev) => {
      const isLiked = !prev[storyId];
      showToast(isLiked ? "Added to your Liked Stories ❤️" : "Removed like");
      return { ...prev, [storyId]: isLiked };
    });
  };

  const toggleSave = (storyId: string, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedStories((prev) => {
      const isSaved = !prev[storyId];
      showToast(
        isSaved
          ? `Saved "${title}" to your Library 📚`
          : `Removed "${title}" from your Library`
      );
      return { ...prev, [storyId]: isSaved };
    });
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-[#050B16] text-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-[#6D5DFB]/40 bg-[#070E1E]/95 px-5 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      <div className="max-w-[1240px] mx-auto">
        
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center text-xs font-black tracking-widest uppercase text-[#F97316] bg-orange-500/10 border border-orange-500/30 rounded-full px-3.5 py-1.5 mb-4">
            DISCOVER STORIES
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Browse Stories
          </h1>
          <p className="mt-3 text-base text-slate-300 leading-relaxed">
            Discover unforgettable fanfiction, serialized original webnovels, and rising worlds from creators across the platform.
          </p>
        </div>

        {/* Search & Filter Panel */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 mb-10 shadow-xl backdrop-blur-sm">
          
          {/* Search Bar */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 mb-5"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by story title, fandom, author, or tags..."
                className="w-full h-12 rounded-xl border border-white/10 bg-[#020617]/80 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-[#6D5DFB] focus:ring-1 focus:ring-[#6D5DFB] transition-all"
              />
            </div>
            <button
              type="submit"
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] text-sm font-extrabold text-white shadow-md shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all"
            >
              Search
            </button>
          </form>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1 shrink-0">
              <Filter className="h-3.5 w-3.5" /> Filter:
            </span>
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  type="button"
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#6D5DFB] text-white shadow-md shadow-indigo-600/30 border border-[#6D5DFB]"
                      : "bg-white/5 text-slate-300 border border-white/10 hover:text-white hover:border-white/20"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#F97316]">
              STORY LIBRARY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {activeFilter === "All" ? "Featured & Trending Stories" : `${activeFilter} Stories`}
            </h2>
          </div>
          <Link
            href="/write"
            className="text-xs sm:text-sm font-bold text-slate-300 hover:text-[#F97316] transition-colors"
          >
            Become a Writer →
          </Link>
        </div>

        {/* Story Grid */}
        {filteredStories.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-12 text-center">
            <p className="text-slate-400">No stories match your search criteria.</p>
            <button
              onClick={() => {
                setActiveFilter("All");
                setSearchQuery("");
              }}
              className="mt-4 text-xs font-bold text-[#F97316] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => {
              const storyId = story.id || story.slug;
              const isLiked = likedStories[storyId];
              const isSaved = savedStories[storyId];
              const likeCount = (story.stats?.likes || 0) + (isLiked ? 1 : 0);

              return (
                <div
                  key={storyId}
                  className="group relative flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-[#070E1E] overflow-hidden shadow-xl hover:border-[#6D5DFB]/50 hover:shadow-2xl hover:shadow-indigo-950/40 transition-all duration-300"
                >
                  {/* Card Cover & Header */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                    <img
                      src={story.coverImageUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"}
                      alt={story.title || "Story"}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070E1E] via-transparent to-black/60" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      {story.classification === "FANFICTION" ? (
                        <span className="rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                          100% Free Fanfiction
                        </span>
                      ) : (
                        <span className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                          Original Webnovel
                        </span>
                      )}

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                          story.rating === "EXPLICIT"
                            ? "bg-red-500/80 text-white"
                            : story.rating === "MATURE"
                            ? "bg-amber-500/80 text-slate-950"
                            : "bg-white/20 text-white"
                        }`}
                      >
                        {story.rating || "GENERAL"}
                      </span>
                    </div>

                    {/* Fandom / Genres Pill on bottom cover */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 pointer-events-none">
                      <span className="font-extrabold text-[#F97316] drop-shadow-sm truncate max-w-[200px]">
                        {story.fandom ? `⚔️ ${story.fandom}` : story.genres?.[0] ? `✨ ${story.genres[0]}` : "✨ Story"}
                      </span>
                      <span className="text-[11px] text-slate-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md shrink-0">
                        {story.chapters?.length || 0} Chapters
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-col flex-1 p-5">
                    {/* Title */}
                    <Link
                      href={`/story/${story.slug}`}
                      className="group-hover:text-[#F97316] transition-colors"
                    >
                      <h3 className="text-lg font-black text-white leading-snug line-clamp-1">
                        {story.title || "Untitled Story"}
                      </h3>
                    </Link>

                    {/* Author */}
                    <div className="mt-1 flex items-center gap-2">
                      <img
                        src={story.author?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                        alt={story.author?.name || "Author"}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                      <span className="text-xs font-semibold text-slate-300">
                        {story.author?.name || "Author"}
                      </span>
                      {story.author?.isVerified && (
                        <span className="text-blue-400 text-xs" title="Verified Creator">
                          ✓
                        </span>
                      )}
                    </div>

                    {/* Synopsis snippet */}
                    <p className="mt-2.5 text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {story.synopsis}
                    </p>

                    {/* Genre Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(story.genres || []).slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="rounded-md border border-white/5 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-300"
                        >
                          {g}
                        </span>
                      ))}
                    </div>

                    {/* Card Actions Footer: Like & Add to Library */}
                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                      {/* Left: Like heart toggle */}
                      <button
                        type="button"
                        onClick={(e) => toggleLike(storyId, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isLiked
                            ? "border-rose-500/50 bg-rose-500/15 text-rose-400 shadow-sm shadow-rose-500/20"
                            : "border-white/10 bg-slate-800/60 text-slate-400 hover:text-white hover:border-white/20"
                        }`}
                        title={isLiked ? "Unlike" : "Like story"}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${
                            isLiked ? "fill-rose-500 text-rose-500" : ""
                          }`}
                        />
                        <span>{likeCount.toLocaleString()}</span>
                      </button>

                      {/* Middle: Save to Library toggle */}
                      <button
                        type="button"
                        onClick={(e) => toggleSave(storyId, story.title, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSaved
                            ? "border-[#6D5DFB]/50 bg-[#6D5DFB]/20 text-[#A594FD]"
                            : "border-white/10 bg-slate-800/60 text-slate-400 hover:text-white hover:border-white/20"
                        }`}
                        title={isSaved ? "Saved to Library" : "Save to Library"}
                      >
                        <Bookmark
                          className={`h-3.5 w-3.5 ${
                            isSaved ? "fill-[#6D5DFB] text-[#6D5DFB]" : ""
                          }`}
                        />
                        <span>{isSaved ? "Saved" : "Save"}</span>
                      </button>

                      {/* Right: Read Button */}
                      <Link
                        href={`/story/${story.slug}`}
                        className="rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-md shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all"
                      >
                        Read →
                      </Link>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
