"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCurrentUser, isUserAdmin, logoutUser, UserSession } from "@/lib/authStore";
import { getAllStories, syncStoriesWithServer, deleteStory } from "@/lib/storyStore";
import { getAllSpotlightCampaigns, syncSpotlightsWithServer, endSpotlightCampaign, resetTestCooldowns } from "@/lib/promotionStore";
import { StoryData } from "@/data/mockStories";
import {
  ShieldCheck,
  Database,
  BookOpen,
  Sparkles,
  Users,
  Trash2,
  ExternalLink,
  RotateCcw,
  LogOut,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Lock,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  const [stories, setStories] = useState<StoryData[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stories" | "spotlights" | "users" | "compliance">("stories");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setHasCheckedAuth(true);

    // If not authenticated as administrator, redirect to dedicated admin login
    if (!isUserAdmin(user)) {
      router.push("/admin/login");
      return;
    }

    const refreshData = async () => {
      setIsLoading(true);
      try {
        const [serverStories, serverCampaigns] = await Promise.all([
          syncStoriesWithServer(),
          syncSpotlightsWithServer(),
        ]);

        if (serverStories) {
          setStories(Object.values(serverStories));
        } else {
          setStories(Object.values(getAllStories()));
        }

        if (serverCampaigns) {
          setCampaigns(serverCampaigns);
        } else {
          setCampaigns(getAllSpotlightCampaigns());
        }
      } catch (err) {
        console.error("Admin data sync failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    refreshData();
  }, [router]);

  const handleAdminLogout = () => {
    logoutUser();
    router.push("/admin/login");
  };

  const handleAdminDeleteStory = async (story: StoryData) => {
    if (!window.confirm(`[ADMIN OVERRIDE] Permanently delete "${story.title}" and all its chapters from Neon PostgreSQL? This cannot be undone.`)) {
      return;
    }

    const success = await deleteStory(story.slug);
    if (success) {
      setStories((prev) => prev.filter((s) => s.slug !== story.slug));
      setFeedback({ type: "success", message: `Story "${story.title}" was purged from PostgreSQL by administrator.` });
    } else {
      setFeedback({ type: "error", message: `Failed to delete story "${story.title}".` });
    }

    setTimeout(() => setFeedback(null), 4000);
  };

  const handleEndCampaignEarly = async (campaignId: string) => {
    if (window.confirm("End this spotlight campaign immediately?")) {
      await endSpotlightCampaign(campaignId);
      const updated = await syncSpotlightsWithServer();
      setCampaigns(updated || getAllSpotlightCampaigns());
      setFeedback({ type: "success", message: "Spotlight campaign terminated." });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleResetCooldowns = () => {
    resetTestCooldowns();
    setCampaigns(getAllSpotlightCampaigns());
    setFeedback({ type: "success", message: "Spotlight fair discovery cooldowns reset." });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Auth gate check
  if (!hasCheckedAuth || !currentUser || !isUserAdmin(currentUser)) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-slate-500">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
          <span className="text-xs font-mono tracking-wider text-slate-400">VERIFYING ADMINISTRATIVE ACCESS...</span>
        </div>
      </div>
    );
  }

  // Filtered stories for moderation
  const filteredStories = stories.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      (s.author?.name || "").toLowerCase().includes(q) ||
      (s.author?.username || "").toLowerCase().includes(q) ||
      (s.fandom || "").toLowerCase().includes(q)
    );
  });

  const totalWords = stories.reduce((acc, s) => acc + (s.stats.words || 0), 0);
  const totalChapters = stories.reduce((acc, s) => acc + (s.chapters?.length || 0), 0);
  const activeSpotlightsCount = campaigns.filter((c) => c.status === "ACTIVE" && Date.now() < c.endTimestamp).length;

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      
      {/* Top Administrative Header */}
      <header className="border-b border-red-500/20 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-md shadow-red-950/40">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">FicForge Admin Console</span>
                <span className="text-[10px] font-mono uppercase bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
                  {currentUser.role}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                PostgreSQL Neon: <strong className="text-emerald-400">ONLINE</strong> • Authoritative Database
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:border-white/20 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Public Site
            </Link>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Exit Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1280px] mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Toast Feedback */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between shadow-lg ${
              feedback.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : "bg-red-500/15 border-red-500/40 text-red-300"
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs uppercase tracking-wider underline hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* System KPIs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stories</span>
              <BookOpen className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-3xl font-black text-white mt-2">{stories.length}</p>
            <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
              ● Neon PostgreSQL Synchronized
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Chapters</span>
              <FileText className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-3xl font-black text-white mt-2">{totalChapters}</p>
            <span className="text-[11px] text-slate-400 font-semibold mt-1 inline-block">
              Manuscripts published
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Published Words</span>
              <Database className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-white mt-2">{totalWords.toLocaleString()}</p>
            <span className="text-[11px] text-amber-400 font-semibold mt-1 inline-block">
              Active story text
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Spotlights</span>
              <Sparkles className="h-4 w-4 text-orange-400" />
            </div>
            <p className="text-3xl font-black text-white mt-2">{activeSpotlightsCount}</p>
            <span className="text-[11px] text-orange-400 font-semibold mt-1 inline-block">
              2 credits / day rule active
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("stories")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "stories"
                ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" /> Story Moderation ({stories.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("spotlights")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "spotlights"
                ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Spotlight Promotions ({campaigns.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("compliance")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "compliance"
                ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> DMCA & Compliance Policy
          </button>
        </div>

        {/* Tab 1: Story Moderation */}
        {activeTab === "stories" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">All Platform Stories</h2>
                <p className="text-xs text-slate-400">
                  Authoritative stories stored in Neon PostgreSQL. Administrators can inspect or delete infringing works.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title, author, fandom..."
                  className="w-full h-9 rounded-xl border border-white/10 bg-slate-900/80 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-950/40">
                      <th className="py-3 px-4">Story & Author</th>
                      <th className="py-3 px-4">Classification</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Chapters</th>
                      <th className="py-3 px-4">Words</th>
                      <th className="py-3 px-4">Views</th>
                      <th className="py-3 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredStories.map((story) => (
                      <tr key={story.id || story.slug} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={story.coverImageUrl}
                              alt={story.title}
                              className="h-12 w-9 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                            <div>
                              <strong className="text-sm font-bold text-white block">{story.title}</strong>
                              <span className="text-[11px] text-slate-400">
                                by {story.author.name} (@{story.author.username})
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {story.classification === "FANFICTION" ? (
                            <span className="inline-block rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                              Free Fanfiction
                            </span>
                          ) : (
                            <span className="inline-block rounded-md bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                              Original Webnovel
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono">{story.rating}</td>
                        <td className="py-3.5 px-4 font-mono">{story.chapters?.length || 0}</td>
                        <td className="py-3.5 px-4 font-mono">{story.stats.words.toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-mono">{story.stats.views.toLocaleString()}</td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/story/${story.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                              title="View Story in Reader"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleAdminDeleteStory(story)}
                              className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
                              title="Admin Delete: Permanently remove story from PostgreSQL"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Spotlight Promotions Oversight */}
        {activeTab === "spotlights" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Spotlight Promotions & Economy</h2>
                <p className="text-xs text-slate-400">
                  Enforces 2 credits per day promotion pricing and fair 7-day discovery cooldowns.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetCooldowns}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Cooldowns
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-950/40">
                      <th className="py-3 px-4">Story</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Credits Spent</th>
                      <th className="py-3 px-4">Impressions</th>
                      <th className="py-3 px-4">Clicks</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {campaigns.map((c) => {
                      const now = Date.now();
                      const isActive = c.status === "ACTIVE" && now < c.endTimestamp;

                      return (
                        <tr key={c.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">{c.storyTitle || c.storySlug}</td>
                          <td className="py-3.5 px-4">
                            {isActive ? (
                              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                                ACTIVE
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-800 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                                COMPLETED
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono">{c.creditsSpent || 2} Credits</td>
                          <td className="py-3.5 px-4 font-mono">{c.impressions || 0}</td>
                          <td className="py-3.5 px-4 font-mono">{c.clicks || 0}</td>
                          <td className="py-3.5 px-4 text-right">
                            {isActive && (
                              <button
                                type="button"
                                onClick={() => handleEndCampaignEarly(c.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/30 transition-colors cursor-pointer"
                              >
                                End Campaign
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
        )}

        {/* Tab 3: DMCA & Compliance */}
        {activeTab === "compliance" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">DMCA Safe Harbor & Monetization Policy</h2>
              <p className="text-xs text-slate-400">
                Core legal safeguards enforced across the FicForge serialization architecture.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="h-5 w-5" /> 100% Free Fanfiction Safe Harbor
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fanfiction stories are hard-locked against Fast Pass paywalls and monetization subscriptions. All chapters remain 100% free to read to comply with DMCA non-commercial protections.
                </p>
                <div className="pt-2">
                  <Link href="/dmca-policy" className="text-xs font-bold text-[#F97316] hover:underline">
                    Read FicForge DMCA Policy →
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Sparkles className="h-5 w-5" /> Original Fiction Monetization
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Original webnovels owned by authors may enable Fast Pass early-access chapters using Sparks. Explicit (18+) webnovels are automatically gated behind age confirmation.
                </p>
                <div className="pt-2">
                  <Link href="/content-policy" className="text-xs font-bold text-[#F97316] hover:underline">
                    Read Content Policy →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
