"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  getBookmarkedStories,
  removeStoryBookmark,
  syncUserBookmarksWithServer,
} from "@/lib/bookmarkStore";
import {
  getCurrentUser,
  UserSession,
  loginAsDemoUser,
} from "@/lib/authStore";
import { StoryData } from "@/data/mockStories";
import {
  Bookmark,
  BookOpen,
  Search,
  Trash2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  UserPlus,
  RefreshCw,
  Compass,
} from "lucide-react";

export default function SavedLibraryPage() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [savedStories, setSavedStories] = useState<StoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "ORIGINAL" | "FANFICTION">("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadBookmarks = () => {
    const list = getBookmarkedStories();
    setSavedStories(list);
  };

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setHasCheckedAuth(true);

    if (user) {
      loadBookmarks();
      setIsLoading(true);
      // Synchronize authoritatively with Neon PostgreSQL database
      syncUserBookmarksWithServer()
        .then(() => {
          loadBookmarks();
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    const handleAuthChange = () => {
      const updatedUser = getCurrentUser();
      setCurrentUser(updatedUser);
      if (updatedUser) {
        loadBookmarks();
      } else {
        setSavedStories([]);
      }
    };

    window.addEventListener("ficforge_auth_changed", handleAuthChange);
    window.addEventListener("ficforge_bookmarks_updated", loadBookmarks);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("ficforge_auth_changed", handleAuthChange);
      window.removeEventListener("ficforge_bookmarks_updated", loadBookmarks);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleRemove = (slug: string, title: string) => {
    removeStoryBookmark(slug);
    loadBookmarks();
    showToast(`Removed "${title}" from your Library`);
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

  // Loading state while checking local storage on initial mount
  if (!hasCheckedAuth) {
    return (
      <div className="min-h-[70vh] bg-[#050B16] flex items-center justify-center text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // ========================================================
  // UNATHENTICATED STATE: Strict Reader Library Gate
  // Logged-out guests CANNOT view or access a saved library
  // ========================================================
  if (!currentUser) {
    return (
      <div className="min-h-[85vh] bg-[#050B16] text-white py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-[1040px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Platform Pitch */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center text-xs font-black tracking-widest uppercase text-[#F97316] bg-orange-500/10 border border-orange-500/30 rounded-full px-3.5 py-1.5">
              READER ACCOUNT REQUIRED
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Your Personal <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D5DFB] via-[#A855F7] to-[#F97316]">
                Reading Library
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
              Sign in to FicForge to access your saved library, sync reading progress across all devices, receive new chapter alerts, and bookmark your favorite serialized webnovels and fanfiction.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#6D5DFB] to-[#F97316] flex items-center justify-center text-white font-black text-sm shrink-0">
                  ☁️
                </div>
                <div>
                  <strong className="text-sm font-bold text-white block">PostgreSQL Cloud Sync</strong>
                  <span className="text-xs text-slate-400">
                    Your saved manuscripts, reading bookmarks, and history are backed up to our server database.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#6D5DFB] to-[#F97316] flex items-center justify-center text-white font-black text-sm shrink-0">
                  🔔
                </div>
                <div>
                  <strong className="text-sm font-bold text-white block">Instant Chapter Updates</strong>
                  <span className="text-xs text-slate-400">
                    Never lose your place. Get notified immediately when authors publish new chapter releases.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Card */}
          <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-slate-900/95 p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="mb-6 text-center sm:text-left">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4">
                <Bookmark className="h-6 w-6 fill-indigo-400/20" />
              </div>
              <h2 className="text-2xl font-black text-white">Sign In to View Library</h2>
              <p className="text-xs text-slate-400 mt-1">
                Access your bookmarked stories and personal bookshelf.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/login?redirect=/library"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] py-3.5 px-6 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all text-center"
              >
                <span>Sign In to FicForge</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/register?redirect=/library"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 py-3.5 px-6 text-sm font-bold text-slate-200 hover:text-white transition-all text-center"
              >
                <UserPlus className="h-4 w-4 text-[#F97316]" />
                <span>Create Free Reader Account</span>
              </Link>
            </div>

            {/* Instant Testing Helper */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  loginAsDemoUser();
                  window.location.reload();
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⚡ 1-Click Test Sign In (Valerius Frost)</span>
              </button>
            </div>

            <div className="mt-5 text-center">
              <Link href="/browse" className="text-xs text-slate-400 hover:text-white transition-colors">
                ← Return to Public Story Catalog
              </Link>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // ========================================================
  // AUTHENTICATED STATE: Real Saved Library
  // ========================================================
  return (
    <div className="min-h-screen bg-[#050B16] text-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-indigo-500/40 bg-[#070E1E]/95 px-5 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1240px] mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest uppercase text-[#F97316]">
                MY BOOKSHELF
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-semibold">
                @{currentUser.username}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1 flex items-center gap-3">
              <span>Saved Library</span>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] text-white">
                {savedStories.length} {savedStories.length === 1 ? "Story" : "Stories"}
              </span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Your personalized reading collection synchronized with your FicForge account.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all"
            >
              <Compass className="h-4 w-4" /> Browse More Stories
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Saved Stories
            </span>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              {savedStories.length}
            </p>
            <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
              ● In your collection
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Chapters
            </span>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              {totalChapters}
            </p>
            <span className="text-[11px] text-indigo-400 font-semibold mt-1 inline-block">
              Ready to read
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Words in Library
            </span>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              {totalWords.toLocaleString()}
            </p>
            <span className="text-[11px] text-amber-400 font-semibold mt-1 inline-block">
              Total manuscript content
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Database Sync
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
              <span>Online</span>
            </p>
            <span className="text-[11px] text-slate-400 font-semibold mt-1 inline-block">
              PostgreSQL Connected
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Classification Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-white/10">
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
                  ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
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
              placeholder="Search your library..."
              className="w-full h-11 rounded-xl border border-white/10 bg-slate-900/80 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-[#6D5DFB] transition-colors"
            />
          </div>
        </div>

        {/* Stories Grid */}
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
                        Continue Reading <ArrowRight className="h-3 w-3" />
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
              {searchQuery ? "No matching saved stories found" : "Your Library is Empty"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {searchQuery
                ? `No bookmarked stories matched "${searchQuery}". Try a different keyword or reset filters.`
                : "You haven't added any stories to your bookshelf yet. Browse original webnovels and fanfiction across FicForge to start building your personal library."}
            </p>

            <div className="pt-2 flex items-center justify-center">
              <Link
                href="/browse"
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-6 py-3 text-xs font-black text-white shadow-md shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Compass className="h-4 w-4" />
                <span>Explore Stories Catalog</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
