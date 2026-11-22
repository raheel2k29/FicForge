"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useMemo } from "react";
import WriterAuthGate from "@/components/WriterAuthGate";
import CreatorStudioHeader from "@/components/CreatorStudioHeader";
import { getAllStories, syncStoriesWithServer, filterStoriesForAuthor } from "@/lib/storyStore";
import { getCurrentUser, UserSession } from "@/lib/authStore";
import {
  getPromoCredits,
  setPromoCredits,
  getAllSpotlightCampaigns,
  getActiveSpotlights,
  endSpotlightCampaign,
  activateSpotlight,
  getStorySpotlightEligibility,
  resetTestCooldowns,
  syncSpotlightsWithServer,
  SpotlightCampaign,
  StorySpotlightStatus,
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
  AlertTriangle,
  Clock,
  RotateCcw,
  Plus,
} from "lucide-react";

function PromotionDashboardContent() {
  const searchParams = useSearchParams();
  const storySlugParam = searchParams.get("storySlug");

  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [stories, setStories] = useState<StoryData[]>([]);
  const [credits, setCredits] = useState<number>(10);
  const [selectedDays, setSelectedDays] = useState<number>(1);
  const [campaigns, setCampaigns] = useState<SpotlightCampaign[]>([]);
  const [selectedStorySlug, setSelectedStorySlug] = useState<string>("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const creditsCost = useMemo(() => Math.max(2, selectedDays * 2), [selectedDays]);

  useEffect(() => {
    try {
      localStorage.removeItem("ficforge_custom_stories_v1");
    } catch {}

    const load = () => {
      const u = getCurrentUser();
      setCurrentUser(u);
      const all = getAllStories();
      const myStories = filterStoriesForAuthor(all, u);
      setStories(myStories);
      setCredits(getPromoCredits());
      setCampaigns(getAllSpotlightCampaigns());

      if (storySlugParam) {
        setSelectedStorySlug(storySlugParam);
      } else if (myStories.length > 0 && (!selectedStorySlug || !myStories.some((s) => s.slug === selectedStorySlug))) {
        setSelectedStorySlug(myStories[0].slug);
      }
    };

    load();

    // Reconcile with PostgreSQL database
    syncSpotlightsWithServer().then((serverCampaigns) => {
      if (serverCampaigns && serverCampaigns.length > 0) {
        setCampaigns(serverCampaigns);
      }
    });

    syncStoriesWithServer().then((serverStories) => {
      if (serverStories) {
        const u = getCurrentUser();
        const storiesList = filterStoriesForAuthor(serverStories, u);
        setStories(storiesList);
        if (storySlugParam) {
          setSelectedStorySlug(storySlugParam);
        } else if (storiesList.length > 0 && (!selectedStorySlug || !storiesList.some((s) => s.slug === selectedStorySlug))) {
          setSelectedStorySlug(storiesList[0].slug);
        }
      }
    });

    window.addEventListener("ficforge_spotlight_updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("ficforge_spotlight_updated", load);
      window.removeEventListener("storage", load);
    };
  }, [storySlugParam]);

  const selectedStory = useMemo(() => {
    return stories.find((s) => s.slug === selectedStorySlug) || (stories.length > 0 ? stories[0] : null);
  }, [stories, selectedStorySlug]);

  // Filter campaigns strictly for this author's works (or Super Admin)
  const myCampaigns = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "SUPER_ADMIN") return campaigns;
    return campaigns.filter((c) => {
      const matchesStory = stories.some((s) => s.slug === c.storySlug);
      const matchesAuthor = currentUser.name && c.authorName?.toLowerCase() === currentUser.name.toLowerCase();
      return matchesStory || matchesAuthor;
    });
  }, [campaigns, stories, currentUser]);

  // Real-time eligibility evaluation for selected story
  const eligibility: StorySpotlightStatus = useMemo(() => {
    if (!selectedStorySlug) {
      return { isEligible: false, status: "ELIGIBLE", message: "Select a story" };
    }
    return getStorySpotlightEligibility(selectedStorySlug);
  }, [selectedStorySlug, campaigns]);

  const activeSpotlights = useMemo(() => {
    const now = Date.now();
    return myCampaigns.filter((c) => c.status === "ACTIVE" && now < c.endTimestamp);
  }, [myCampaigns]);

  const totalImpressions = useMemo(() => {
    return myCampaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
  }, [myCampaigns]);

  const handleLaunchPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStorySlug) return;

    const result = await activateSpotlight(selectedStorySlug, selectedDays);
    if (result.success) {
      setFeedback({ type: "success", message: result.message });
    } else {
      setFeedback({ type: "error", message: result.message });
    }

    setTimeout(() => setFeedback(null), 5000);
  };

  const handleEndCampaign = async (campaignId: string) => {
    if (confirm("End this spotlight campaign early? Its 7-day fair discovery cooldown will begin now.")) {
      await endSpotlightCampaign(campaignId);
    }
  };

  const handleResetCooldowns = () => {
    resetTestCooldowns();
    setFeedback({ type: "success", message: "All test cooldowns have been reset! All stories are now eligible." });
    setTimeout(() => setFeedback(null), 3500);
  };

  const addTestCredits = (amount: number = 2) => {
    setPromoCredits(credits + amount);
  };

  return (
    <div className="min-h-screen bg-[#050B16] text-white">
      <CreatorStudioHeader currentTab="spotlight" />
      <div className="max-w-[1240px] mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        
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
            Redeem monthly membership promotion credits to feature your story on the FicForge Homepage & Discovery Showcase at <strong className="text-amber-300">2 credits per day</strong>. Flexible durations and anti-monopoly cooldowns ensure equal, fair visibility for all community writers.
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`rounded-2xl border p-4 text-sm flex items-center gap-3 animate-in fade-in duration-200 ${
              feedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                : "border-red-500/40 bg-red-950/40 text-red-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
            )}
            <div className="flex-1 font-medium">{feedback.message}</div>
            {feedback.type === "success" && (
              <Link href="/" className="text-xs font-black text-amber-300 hover:underline shrink-0">
                View on Homepage →
              </Link>
            )}
          </div>
        )}

        {/* Stats & Credit Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Spotlight Credits
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => addTestCredits(2)}
                  className="text-[10px] font-bold text-amber-400/90 hover:text-amber-300 underline"
                  title="Add 2 credits (1 day) for test"
                >
                  +2 (1 Day)
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => addTestCredits(10)}
                  className="text-[10px] font-bold text-amber-400/90 hover:text-amber-300 underline"
                  title="Add 10 credits for test"
                >
                  +10
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={handleResetCooldowns}
                  className="text-[10px] font-bold text-slate-400 hover:text-white underline flex items-center gap-0.5"
                  title="Reset 7-day cooldowns for instant testing"
                >
                  <RotateCcw className="h-2.5 w-2.5" /> Clear Cooldowns
                </button>
              </div>
            </div>
            <p className="text-3xl font-black text-white mt-1">
              {credits} {credits === 1 ? "Credit" : "Credits"}
            </p>
            <span className="text-[11px] text-slate-400 mt-1 inline-block">
              Rate: <strong className="text-amber-300">2 Credits per Day</strong> of spotlight
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

        {/* Anti-Monopoly & Fair Discovery Standard Box */}
        <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-0.5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="text-xs space-y-1">
              <h4 className="font-extrabold text-white text-sm">
                Anti-Monopoly & Fair Discovery Protection
              </h4>
              <p className="text-slate-300 leading-relaxed">
                To guarantee equal exposure for every author on FicForge and avoid pay-to-win saturation:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-0.5 pt-1">
                <li><strong>2 Credits / Day Standard:</strong> Calibrated pricing discourages runaway monopolization and ensures creators strategically feature their key release windows.</li>
                <li><strong>No Double-Spotlighting:</strong> A story cannot have overlapping campaigns while actively featured.</li>
                <li><strong>7-Day Fair Rotation Cooldown:</strong> When a campaign ends, that title enters a 7-day cooldown before it can be featured again, rotating fresh creators onto the homepage.</li>
                <li><strong>Multi-Story Eligibility:</strong> Authors with multiple stories can spotlight a different title anytime without waiting for another story&apos;s cooldown.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Promotion Launcher Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">
                Launch a Spotlight Campaign
              </h2>
              <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                Rate: 2 Credits / Day
              </span>
            </div>

            <form onSubmit={handleLaunchPromotion} className="space-y-6">
              
              {/* Story Selector with Real-Time Status Tags */}
              {stories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-800/40 p-6 text-center space-y-3">
                  <p className="text-xs text-slate-300">
                    You don't have any published stories yet to promote.
                  </p>
                  <Link
                    href="/write/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30"
                  >
                    <Plus className="h-3.5 w-3.5" /> Forge Your First Story
                  </Link>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Select Story to Feature
                  </label>
                  <select
                    value={selectedStorySlug}
                    onChange={(e) => setSelectedStorySlug(e.target.value)}
                    className="w-full h-12 rounded-xl border border-white/10 bg-slate-800 px-4 text-sm font-semibold text-white outline-none focus:border-amber-400 transition-colors"
                  >
                    {stories.map((story) => {
                      const status = getStorySpotlightEligibility(story.slug);
                      const tag =
                        status.status === "CURRENTLY_ACTIVE"
                          ? " • [✦ ACTIVE IN SPOTLIGHT]"
                          : status.status === "PENDING_APPROVAL"
                          ? " • [⏳ AWAITING APPROVAL]"
                          : status.status === "IN_COOLDOWN"
                          ? ` • [⏳ IN COOLDOWN (${status.daysRemaining}d)]`
                          : " • [✓ ELIGIBLE]";

                      return (
                        <option key={story.slug} value={story.slug}>
                          {story.title} ({story.classification === "FANFICTION" ? "Fanfiction" : "Original"}){story.rating === "EXPLICIT" ? " • [18+ EXPLICIT]" : ""}{tag}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Select any story from your catalog to check real-time eligibility.
                  </p>
                </div>
              )}

              {/* Step 2: Duration Selector (2 Credits Per Day) */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Campaign Duration
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {creditsCost} Credits ({selectedDays} {selectedDays === 1 ? "day" : "days"})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { days: 1, label: "1 Day", tag: "Flash" },
                    { days: 2, label: "2 Days", tag: "Sprint" },
                    { days: 3, label: "3 Days", tag: "Weekend" },
                    { days: 7, label: "7 Days", tag: "Full Week" },
                  ].map((opt) => {
                    const cost = opt.days * 2;
                    const isSelected = selectedDays === opt.days;
                    return (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => setSelectedDays(opt.days)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-amber-400 bg-amber-500/20 shadow-md shadow-amber-500/10"
                            : "border-white/10 bg-slate-800/60 hover:border-white/20 hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={`font-black ${isSelected ? "text-white" : "text-slate-300"}`}>
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-amber-400 font-bold uppercase">
                            {opt.tag}
                          </span>
                        </div>
                        <p className={`text-xs font-extrabold ${isSelected ? "text-amber-300" : "text-slate-400"}`}>
                          {cost} Credits
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-950/60 border border-white/5 p-3 text-xs">
                  <span className="text-slate-400">
                    Or custom duration (1 to 14 days):
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="14"
                      value={selectedDays}
                      onChange={(e) => setSelectedDays(parseInt(e.target.value, 10))}
                      className="w-32 accent-amber-500 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-amber-300 w-14 text-right">
                      {selectedDays} {selectedDays === 1 ? "day" : "days"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Eligibility & Cooldown Status Banner */}
              {eligibility.status === "PENDING_APPROVAL" && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <Clock className="h-4 w-4" /> Awaiting Staff Moderator Approval
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    This story is rated <strong className="text-rose-400">EXPLICIT (18+)</strong>. Per platform compliance guidelines, it is currently in the Admin Review Queue. It will be promoted to the homepage immediately once approved by a staff administrator.
                  </p>
                  <div className="pt-1 text-[11px] text-amber-300 font-mono">
                    ⏳ Status: Pending Governance Verification
                  </div>
                </div>
              )}

              {eligibility.status === "CURRENTLY_ACTIVE" && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                    <Sparkles className="h-4 w-4" /> Story is Currently Live in Spotlight
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    This story is currently active on the Homepage & Browse showcase until{" "}
                    <strong className="text-white">{eligibility.activeCampaign?.endDate}</strong>. Overlapping campaigns for the same story are strictly disallowed to maintain community fairness.
                  </p>
                  <div className="pt-1 text-[11px] text-amber-300 font-mono">
                    ⏳ {eligibility.daysRemaining} {eligibility.daysRemaining === 1 ? "day" : "days"} remaining in active run
                  </div>
                </div>
              )}

              {eligibility.status === "IN_COOLDOWN" && (
                <div className="rounded-xl border border-blue-500/40 bg-blue-950/20 p-4 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-400 font-extrabold text-sm">
                    <Clock className="h-4 w-4" /> Fair Discovery Cooldown Active
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    This story recently finished its spotlight run. To prevent homepage monopolization and allow other creators their turn, this title has a 7-day cooldown.
                  </p>
                  <div className="pt-1 text-[11px] text-blue-300 font-mono">
                    Eligible again on <strong className="text-white">{eligibility.eligibleDate}</strong> ({eligibility.daysRemaining} {eligibility.daysRemaining === 1 ? "day" : "days"} remaining)
                  </div>
                </div>
              )}

              {eligibility.status === "ELIGIBLE" && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Ready to Spotlight:</strong> This title meets all discovery standards and is eligible for a {selectedDays}-day feature ({creditsCost} credits).
                  </span>
                </div>
              )}

              {/* Explicit Story Notice Banner */}
              {selectedStory?.rating === "EXPLICIT" && eligibility.status !== "PENDING_APPROVAL" && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/25 p-4 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-rose-300 font-extrabold text-sm">
                    <AlertTriangle className="h-4 w-4 text-rose-400" /> Explicit Content (18+) Moderation Requirement
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Because this story is marked as <strong className="text-rose-400">EXPLICIT</strong>, safety standards require administrative approval before homepage activation. Upon submitting, your credits will be held in escrow and the campaign will go live immediately once approved by platform staff.
                  </p>
                </div>
              )}

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
                    Campaign Duration & Cost
                  </span>
                  <strong className="text-sm text-amber-400 block">{selectedDays} Consecutive {selectedDays === 1 ? "Day" : "Days"}</strong>
                  <span className="block text-[11px] text-slate-400 mt-0.5">Cost: {creditsCost} Spotlight Credits (2 / day)</span>
                </div>
              </div>

              {/* Submit Button Governed by Strict Eligibility */}
              {stories.length === 0 ? (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled
                    className="w-full h-12 rounded-xl border border-white/10 bg-slate-800/40 text-sm font-bold text-slate-500 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Forge a story first to launch spotlight promotions
                  </button>
                </div>
              ) : eligibility.status === "PENDING_APPROVAL" ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled
                    className="w-full h-12 rounded-xl border border-amber-500/40 bg-amber-500/10 text-sm font-bold text-amber-300 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Awaiting Moderator Approval (Explicit 18+)
                  </button>
                  <p className="text-center text-[11px] text-slate-400">
                    This explicit story is currently queued in the Admin Moderation console.
                  </p>
                </div>
              ) : eligibility.status === "CURRENTLY_ACTIVE" ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled
                    className="w-full h-12 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm font-bold text-amber-400/80 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Currently Active in Spotlight ({eligibility.daysRemaining}d Left)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEndCampaign(selectedStorySlug)}
                    className="w-full text-center text-xs font-bold text-slate-400 hover:text-amber-300 underline py-1"
                  >
                    End active campaign early & test restarting
                  </button>
                </div>
              ) : eligibility.status === "IN_COOLDOWN" ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled
                    className="w-full h-12 rounded-xl border border-blue-500/30 bg-blue-500/10 text-sm font-bold text-blue-400/80 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    In Community Cooldown ({eligibility.daysRemaining}d Remaining)
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCooldowns}
                    className="w-full text-center text-xs font-bold text-slate-400 hover:text-blue-300 underline py-1 flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> Clear cooldown & test this story now
                  </button>
                </div>
              ) : credits >= creditsCost ? (
                <button
                  type="submit"
                  className={`w-full h-12 rounded-xl text-sm font-black text-slate-950 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedStory?.rating === "EXPLICIT"
                      ? "bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 shadow-orange-500/20 hover:opacity-95"
                      : "bg-gradient-to-r from-amber-500 via-orange-500 to-[#F97316] shadow-orange-500/20 hover:opacity-95"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  {selectedStory?.rating === "EXPLICIT"
                    ? `Submit for Admin Approval (${creditsCost} Credits · ${selectedDays}d)`
                    : `Redeem ${creditsCost} Credits & Activate Spotlight (${selectedDays} ${selectedDays === 1 ? "Day" : "Days"})`}
                </button>
              ) : (
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-center space-y-2">
                  <p className="text-xs text-amber-200">
                    <strong>Insufficient Credits:</strong> This {selectedDays}-day campaign requires {creditsCost} credits (at 2 credits/day), but you have {credits} {credits === 1 ? "credit" : "credits"}.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => addTestCredits(creditsCost - credits)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      + Add {creditsCost - credits} Test Credits
                    </button>
                    <span className="text-slate-600">•</span>
                    <Link
                      href="/premium"
                      className="text-xs font-black text-[#F97316] hover:underline"
                    >
                      Upgrade Membership →
                    </Link>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Live Preview Card (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <span className="block text-xs font-black uppercase tracking-wider text-slate-400">
              Live Showcase Preview
            </span>

            {selectedStory ? (
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
                  <span className="text-amber-400 font-bold">
                    Featured {selectedDays} {selectedDays === 1 ? "Day" : "Days"} ({creditsCost} Credits)
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center text-xs text-slate-500">
                Create or publish a story to preview how it will appear in the Homepage Spotlight.
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
                {myCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                      No spotlight campaigns launched yet. Feature your story above to start tracking reach and impressions.
                    </td>
                  </tr>
                ) : (
                  myCampaigns.map((c) => {
                  const now = Date.now();
                  const isActive = c.status === "ACTIVE" && now < c.endTimestamp;
                  const isInCooldown = !isActive && c.cooldownTimestamp && now < c.cooldownTimestamp;

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
                            c.status === "PENDING_APPROVAL"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : c.status === "REJECTED"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : isActive
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : isInCooldown
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : "bg-white/5 text-slate-400"
                          }`}
                        >
                          {c.status === "PENDING_APPROVAL"
                            ? "PENDING ADMIN APPROVAL"
                            : c.status === "REJECTED"
                            ? "REJECTED"
                            : isActive
                            ? "ACTIVE"
                            : isInCooldown
                            ? "IN COOLDOWN"
                            : "EXPIRED"}
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
                })
                )}
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
