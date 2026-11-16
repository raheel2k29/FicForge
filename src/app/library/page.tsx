"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  getBookmarkedStories,
  removeStoryBookmark,
  addStoryBookmark,
  getBookmarkCount,
  getBookmarkedSlugs,
} from "@/lib/bookmarkStore";
import { getAllStories, syncStoriesWithServer } from "@/lib/storyStore";
import { StoryData } from "@/data/mockStories";
import {
  Bookmark,
  BookOpen,
  Search,
  Trash2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Compass,
  Layers,
  Star,
  Eye,
} from "lucide-react";

export default function SavedLibraryPage() {
  const [savedStories, setSavedStories] = useState<StoryData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "ORIGINAL" | "FANFICTION">("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadBookmarks = () => {
    const list = getBookmarkedStories();
    setSavedStories(list);
  };

  useEffect(() => {
    loadBookmarks();

    // Reconcile with PostgreSQL server
    syncStoriesWithServer().then(() => {
      loadBookmarks();
    });

    window.addEventListener("ficforge_bookmarks_updated", loadBookmarks);
    window.addEventListener("ficforge_stories_updated", loadBookmarks);
    window.addEventListener("storage", loadBookmarks);
    return () => {
      window.removeEventListener("ficforge_bookmarks_updated", loadBookmarks);
      window.removeEventListener("ficforge_stories_updated", loadBookmarks);
      window.removeEventListener("storage", loadBookmarks);
    };
  }, []);

  const handleRemove = (slug: string, title: string) => {
    removeStoryBookmark(slug);
    loadBookmarks();
    showToast(`Removed "${title}" from your Library`);
  };

  const handleAddSampleStories = () => {
    addStoryBookmark("the-ember-archive");
    addStoryBookmark("star-wars-the-obsidian-blade");
    loadBookmarks();
    showToast("Added curated stories to your Library 📚");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  // Filtered stories based on tab and search query
  const filteredStories = useMemo(() => {
    return savedStories.filter((story) => {
      if (!story) return false;

      // Tab filter
      if (activeTab === "ORIGINAL" && story.classification !== "ORIGINAL") return false;
      if (activeTab === "FANFICTION" && story.classification !== "FANFICTION") return false;

      // Search query
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      return (
        story.title.toLowerCase().includes(q) ||
        (story.author?.name || "").toLowerCase().includes(q) ||
        (story.fandom && story.fandom.toLowerCase().includes(q)) ||
        (story.genres || []).some((g) => g.toLowerCase().includes(q))
      );
    });
  }, [savedStories, activeTab, searchQuery]);

  // Aggregate Stats
  const totalChapters = useMemo(() => {
    return savedStories.reduce((acc, s) => acc + (s.chapters?.length || 0), 0);
  }, [savedStories]);

  const totalWords = useMemo(() => {
    return savedStories.reduce((acc, s) => acc + (s.stats?.words || 0), 0);
  }, [savedStories]);

  return (
    <div className="min-h-screen bg-[#050B16] text-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-indigo-500/40 bg-[#070E1E]/95 px-5 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1240px] mx-auto space-y-10">
        
        {/* ========================================= */}
        {/* HERO HEADER                               */}
        {/* ========================================= */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/30 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#6D5DFB]/15 via-[#F97316]/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#6D5DFB]/20 to-[#F97316]/20 border border-[#6D5DFB]/30 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#A594FD]">
                <Bookmark className="h-3.5 w-3.5 fill-[#6D5DFB]" />
                READER COMPANION
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                My Saved Library
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Your personal reading sanctuary. Access all bookmarked fanfiction, original webnovels, and ongoing chapters whenever you return.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/browse"
                className="rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-5 py-3 text-xs font-black text-white shadow-lg shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all inline-flex items-center gap-2"
              >
                <Compass className="h-4 w-4" />
                Browse Catalog
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Saved Stories
              </span>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {savedStories.length}
              </p>
              <span className="text-[11px] text-[#A594FD] mt-0.5 block">
                Active in Library
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Total Chapters
              </span>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {totalChapters}
              </p>
              <span className="text-[11px] text-emerald-400 mt-0.5 block">
                Across all titles
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Total Words
              </span>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {totalWords.toLocaleString()}
              </p>
              <span className="text-[11px] text-amber-400 mt-0.5 block">
                Bookmarked content
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Sanctuary Status
              </span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                100% Free
              </p>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                No subscription needed
              </span>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* SEARCH & TAB FILTERS                      */}
        {/* ========================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/90 border border-white/10 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "ALL"
                  ? "bg-[#6D5DFB] text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Saved ({savedStories.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ORIGINAL")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "ORIGINAL"
                  ? "bg-[#F97316] text-white shadow-md shadow-orange-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Originals ({savedStories.filter((s) => s.classification === "ORIGINAL").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("FANFICTION")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "FANFICTION"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Fanfiction ({savedStories.filter((s) => s.classification === "FANFICTION").length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved stories..."
              className="w-full h-11 rounded-xl border border-white/10 bg-slate-900/80 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-[#6D5DFB] transition-colors"
            />
          </div>
        </div>

        {/* ========================================= */}
        {/* SAVED STORIES GRID                        */}
        {/* ========================================= */}
        {filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStories.map((story) => {
              const storyId = story.id || story.slug;

              return (
                <div
                  key={storyId}
                  className="rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden shadow-xl hover:border-[#6D5DFB]/40 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover Art */}
                    <div className="relative h-60 w-full overflow-hidden bg-slate-950">
                      <Link href={`/story/${story.slug}`} className="block h-full w-full">
                        <img
                          src={story.coverImageUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"}
                          alt={story.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/60" />
                      </Link>

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        <span className="rounded-full bg-[#6D5DFB]/90 backdrop-blur-md px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-md">
                          In Library
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

                    {/* Card Content */}
                    <div className="p-4 space-y-2">
                      <Link href={`/story/${story.slug}`}>
                        <h3 className="text-base font-black text-white hover:text-[#F97316] transition-colors line-clamp-1 leading-snug">
                          {story.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2">
                        <img
                          src={story.author?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                          alt={story.author?.name || "Author"}
                          className="h-5 w-5 rounded-full object-cover border border-white/10"
                        />
                        <span className="text-xs font-semibold text-slate-300 truncate">
                          {story.author?.name || "Author"}
                        </span>
                        {story.author?.isVerified && (
                          <span className="text-blue-400 text-xs font-bold">✓</span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {story.synopsis}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 pt-0 space-y-3">
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span>📖 {story.chapters?.length || 0} Chapters</span>
                      <span>✍️ {(story.stats?.words || 0).toLocaleString()} words</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/story/${story.slug}`}
                        className="flex-1 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] py-2 text-xs font-black text-white shadow-md shadow-indigo-600/20 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all text-center flex items-center justify-center gap-1.5"
                      >
                        Read Now <ArrowRight className="h-3 w-3" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleRemove(story.slug, story.title)}
                        className="p-2 rounded-xl border border-white/10 bg-slate-800/80 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                        title="Remove from Saved Library"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-3xl">
              📚
            </div>
            <h3 className="text-xl font-black text-white">
              {searchQuery ? "No matching saved stories found" : "Your Saved Library is Empty"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {searchQuery
                ? `No bookmarked stories matched "${searchQuery}". Try a different keyword or reset filters.`
                : "Browse our catalog of fanfiction and original webnovels, and click 'Add to Library' to save stories here."}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/browse"
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-5 py-2.5 text-xs font-black text-white shadow-md shadow-indigo-600/30 hover:opacity-95 transition-all"
              >
                Browse Stories Catalog →
              </Link>
              {!searchQuery && (
                <button
                  type="button"
                  onClick={handleAddSampleStories}
                  className="w-full sm:w-auto rounded-xl border border-white/15 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  + Add Sample Stories
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
