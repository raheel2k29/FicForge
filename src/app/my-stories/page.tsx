"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAllStories, syncStoriesWithServer, deleteStory, deleteChapter, cleanupLegacyStorage } from "@/lib/storyStore";
import { getStorySpotlightEligibility } from "@/lib/promotionStore";
import { getCurrentUser, UserSession } from "@/lib/authStore";
import { StoryData } from "@/data/mockStories";
import WriterAuthGate from "@/components/WriterAuthGate";
import CreatorStudioHeader from "@/components/CreatorStudioHeader";
import {
  BookOpen,
  Plus,
  UploadCloud,
  Eye,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";

export default function MyStoriesPage() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [stories, setStories] = useState<StoryData[]>([]);
  const [filter, setFilter] = useState<"ALL" | "FANFICTION" | "ORIGINAL">("ALL");

  useEffect(() => {
    // Universal purge of legacy browser keys
    cleanupLegacyStorage();

    const user = getCurrentUser();
    setCurrentUser(user);

    const filterForUser = (allStoriesMap: Record<string, StoryData>, u: UserSession | null) => {
      const allList = Object.values(allStoriesMap);
      if (!u || u.role === "SUPER_ADMIN") {
        return allList;
      }
      const myWorks = allList.filter(
        (s) => s.author?.username?.toLowerCase() === u.username?.toLowerCase()
      );
      return myWorks.length > 0 ? myWorks : allList;
    };

    const loadStories = () => {
      const all = getAllStories();
      setStories(filterForUser(all, getCurrentUser()));
    };

    // Reconcile with live PostgreSQL database immediately
    syncStoriesWithServer().then((serverStories) => {
      if (serverStories) {
        setStories(filterForUser(serverStories, getCurrentUser()));
      } else {
        loadStories();
      }
    });

    const handleAuthChange = () => {
      const updatedUser = getCurrentUser();
      setCurrentUser(updatedUser);
      loadStories();
    };

    // Listen to updates from other pages and auth changes
    window.addEventListener("ficforge_stories_updated", loadStories);
    window.addEventListener("ficforge_auth_changed", handleAuthChange);
    return () => {
      window.removeEventListener("ficforge_stories_updated", loadStories);
      window.removeEventListener("ficforge_auth_changed", handleAuthChange);
    };
  }, []);

  const totalWords = stories.reduce((acc, s) => acc + (s.stats.words || 0), 0);
  const totalChapters = stories.reduce((acc, s) => acc + (s.chapters?.length || 0), 0);
  const totalViews = stories.reduce((acc, s) => acc + (s.stats.views || 0), 0);

  const filteredStories = stories.filter((s) => {
    if (filter === "ALL") return true;
    return s.classification === filter;
  });

  const [expandedStoryChapters, setExpandedStoryChapters] = useState<Record<string, boolean>>({});

  const toggleChapters = (slug: string) => {
    setExpandedStoryChapters((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const handleDeleteStory = (story: StoryData) => {
    if (window.confirm(`Permanently delete "${story.title}" and all its chapters? This cannot be undone.`)) {
      deleteStory(story.slug);
      setStories((prev) => prev.filter((s) => s.slug !== story.slug));
    }
  };

  const handleDeleteChapter = (storySlug: string, chapterSlug: string, chapterTitle: string) => {
    if (window.confirm(`Permanently delete chapter "${chapterTitle}"? This cannot be undone.`)) {
      deleteChapter(storySlug, chapterSlug);
      setStories((prev) =>
        prev.map((s) => {
          if (s.slug !== storySlug) return s;
          const remaining = s.chapters.filter((c) => c.slug !== chapterSlug);
          return {
            ...s,
            chapters: remaining.map((c, i) => ({ ...c, number: i + 1 })),
            stats: {
              ...s.stats,
              chapterCount: remaining.length,
              words: remaining.reduce((a, b) => a + (b.wordCount || 0), 0),
            },
          };
        })
      );
    }
  };

  return (
    <WriterAuthGate
      title="Writer Workshop Access"
      description="Sign in to your FicForge creator account to view your stories, review draft manuscripts, and publish new chapters."
    >
      <div className="min-h-screen bg-[#050B16] text-white">
        <CreatorStudioHeader currentTab="stories" />
        <div className="max-w-[1240px] mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-black tracking-widest uppercase text-[#F97316]">
              CREATOR WORKSHOP
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
              My Stories & Manuscripts
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Manage your published works, write chapters, and batch import manuscripts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/write/promote"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs font-black text-amber-300 hover:bg-amber-500/20 transition-all"
            >
              <Sparkles className="h-4 w-4 text-amber-400" /> Spotlight
            </Link>
            <Link
              href="/write/bulk-import"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-slate-900/80 px-4 py-2.5 text-xs font-extrabold text-white hover:border-[#6D5DFB] hover:text-[#A78BFA] transition-all"
            >
              <UploadCloud className="h-4 w-4" /> Bulk Import
            </Link>
            <Link
              href="/write/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all"
            >
              <Plus className="h-4 w-4" /> Create New Story
            </Link>
          </div>
        </div>

        {/* Creator Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Stories
            </span>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              {stories.length}
            </p>
            <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
              ● Active in Workshop
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
              Across all works
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Words
            </span>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              {totalWords.toLocaleString()}
            </p>
            <span className="text-[11px] text-amber-400 font-semibold mt-1 inline-block">
              Published manuscript
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Reads
            </span>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              {totalViews.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-400 font-semibold mt-1 inline-block">
              Lifetime reader views
            </span>
          </div>
        </div>

        {/* Story Classification Filter Tabs */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            {(["ALL", "FANFICTION", "ORIGINAL"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  filter === tab
                    ? "bg-[#6D5DFB] text-white shadow-md shadow-indigo-600/30"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab === "ALL"
                  ? "All Stories"
                  : tab === "FANFICTION"
                  ? "Fanfiction (100% Free)"
                  : "Original Fiction"}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">
            Showing {filteredStories.length} {filteredStories.length === 1 ? "story" : "stories"}
          </span>
        </div>

        {/* Stories Listing */}
        {filteredStories.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center max-w-lg mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6D5DFB]/15 border border-[#6D5DFB]/30 text-2xl mb-4">
              ✍️
            </div>
            <h3 className="text-xl font-bold text-white">No Stories in this Category</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Start building your next story or import an existing manuscript to begin publishing chapters.
            </p>
            <Link
              href="/write/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30"
            >
              <Plus className="h-4 w-4" /> Start New Story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredStories.map((story) => (
              <div
                key={story.slug}
                className="group rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl hover:border-[#6D5DFB]/40 hover:bg-slate-900/95 transition-all flex flex-col gap-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Thumbnail & Story Identity */}
                  <div className="flex items-start gap-4 min-w-0">
                    <img
                      src={story.coverImageUrl}
                      alt={story.title}
                      className="h-24 w-16 rounded-xl object-cover shadow-md shrink-0 border border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        {story.classification === "FANFICTION" ? (
                          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-400">
                            Fanfiction • {story.fandom || "Fandom"}
                          </span>
                        ) : (
                          <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-orange-400">
                            Original Webnovel
                          </span>
                        )}

                        <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-400 uppercase">
                          {story.rating}
                        </span>

                        <span className="text-[11px] text-slate-400">
                          Updated {story.updatedAt}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-white truncate group-hover:text-[#F97316] transition-colors">
                        {story.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-1 mt-1 max-w-xl">
                        {story.synopsis}
                      </p>

                      <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <button
                          type="button"
                          onClick={() => toggleChapters(story.slug)}
                          className="flex items-center gap-1.5 font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>{story.chapters.length} Chapters</span>
                          {expandedStoryChapters[story.slug] ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-slate-300">
                          <FileText className="h-3.5 w-3.5 text-amber-400" />
                          {story.stats.words.toLocaleString()} Words
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-slate-300">
                          <Eye className="h-3.5 w-3.5 text-emerald-400" />
                          {story.stats.views.toLocaleString()} Views
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5 flex-wrap">
                    {(() => {
                      const eligibility = getStorySpotlightEligibility(story.slug);
                      if (eligibility.status === "CURRENTLY_ACTIVE") {
                        return (
                          <Link
                            href="/write/promote"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all shadow-sm"
                            title="Currently active in Homepage Spotlight"
                          >
                            <Sparkles className="h-3.5 w-3.5 fill-emerald-400 text-emerald-400" /> In Spotlight
                          </Link>
                        );
                      }
                      if (eligibility.status === "PENDING_APPROVAL") {
                        return (
                          <Link
                            href={`/write/promote?storySlug=${story.slug}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all shadow-sm"
                            title="Awaiting Admin Approval for Homepage Spotlight"
                          >
                            <Clock className="h-3.5 w-3.5 text-amber-400" /> Pending Approval
                          </Link>
                        );
                      }
                      if (eligibility.status === "IN_COOLDOWN") {
                        return (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-300 cursor-default"
                            title={`In 7-day fair discovery cooldown (${eligibility.daysRemaining} days remaining)`}
                          >
                            <Clock className="h-3.5 w-3.5 text-blue-400" /> Cooldown ({eligibility.daysRemaining}d)
                          </span>
                        );
                      }
                      return (
                        <Link
                          href={`/write/promote?storySlug=${story.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all shadow-sm shadow-amber-500/10"
                          title="Promote this story to Homepage Spotlight"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Spotlight
                        </Link>
                      );
                    })()}

                    <Link
                      href={`/write/chapter?storySlug=${story.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-slate-200 hover:border-white/30 hover:text-white transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" /> Chapter
                    </Link>

                    <Link
                      href={`/write/bulk-import?storySlug=${story.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all"
                    >
                      <UploadCloud className="h-3.5 w-3.5" /> Bulk Import
                    </Link>

                    <Link
                      href={`/story/${story.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all"
                    >
                      View <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteStory(story)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 transition-all cursor-pointer"
                      title={`Delete story "${story.title}"`}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>

                {/* Expandable Chapter Management Drawer */}
                {expandedStoryChapters[story.slug] && (
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <span>Chapters Index</span>
                        <span className="text-slate-500">({story.chapters.length})</span>
                      </span>
                      <Link
                        href={`/write/chapter?storySlug=${story.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg"
                      >
                        <Plus className="h-3 w-3" /> Add Chapter
                      </Link>
                    </div>

                    {story.chapters.length === 0 ? (
                      <div className="text-center py-6 bg-slate-950/40 rounded-xl border border-white/5 text-xs text-slate-400">
                        No chapters published yet. Click &quot;Add Chapter&quot; to begin your story!
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5 bg-slate-950/60 rounded-xl border border-white/5 overflow-hidden">
                        {story.chapters.map((ch) => (
                          <div
                            key={ch.slug}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 px-4 hover:bg-slate-900/60 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="h-6 w-6 rounded bg-slate-800 border border-white/10 text-[11px] font-black text-slate-300 flex items-center justify-center shrink-0">
                                {ch.number}
                              </span>
                              <div>
                                <Link
                                  href={`/story/${story.slug}/${ch.slug}`}
                                  className="text-xs sm:text-sm font-bold text-white hover:text-[#F97316] transition-colors"
                                >
                                  {ch.title}
                                </Link>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {ch.wordCount.toLocaleString()} words · Published {ch.publishedAt}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              <Link
                                href={`/story/${story.slug}/${ch.slug}`}
                                className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                              >
                                Read
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteChapter(story.slug, ch.slug, ch.title)}
                                className="text-xs text-red-400 hover:text-red-300 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 flex items-center gap-1 transition-all cursor-pointer"
                                title={`Delete chapter "${ch.title}"`}
                              >
                                <Trash2 className="h-3 w-3" /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
    </WriterAuthGate>
  );
}
