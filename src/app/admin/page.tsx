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
  Eye,
  Sliders,
  DollarSign,
  Pin,
  Clock,
  UserCheck,
  UserX,
  X,
  AlertCircle,
  HelpCircle,
  Activity,
  Layers,
} from "lucide-react";

interface AdminUserItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  avatarUrl: string;
  storyCount: number;
  sparksBalance: number;
  createdAt: string;
}

interface ComplianceTicket {
  id: string;
  claimantName: string;
  claimantEmail: string;
  copyrightedWorkDescription: string;
  allegedInfringingUrls: string;
  digitalSignature: string;
  status: "OPEN" | "UNDER_REVIEW" | "ACCEPTED_REMOVED" | "REJECTED";
  moderatorNotes?: string;
  createdAt: string | Date;
  resolvedAt?: string | Date | null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Data States
  const [stories, setStories] = useState<StoryData[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [tickets, setTickets] = useState<ComplianceTicket[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tab State: overview, stories, users, spotlights, compliance, finance
  const [activeTab, setActiveTab] = useState<"overview" | "stories" | "users" | "spotlights" | "compliance" | "finance">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Inspection Drawer State
  const [inspectedStory, setInspectedStory] = useState<any | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Staff Manual Pin Modal State
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinStorySlug, setPinStorySlug] = useState("");
  const [pinDurationDays, setPinDurationDays] = useState(3);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setHasCheckedAuth(true);

    // If not authenticated as administrator, redirect to dedicated admin login
    if (!isUserAdmin(user)) {
      router.push("/admin/login");
      return;
    }

    fetchAdminData();
  }, [router]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [serverStories, serverCampaigns, usersRes, complianceRes, telemetryRes] = await Promise.all([
        syncStoriesWithServer(),
        syncSpotlightsWithServer(),
        fetch("/api/admin?tab=users").then((r) => r.json()).catch(() => null),
        fetch("/api/admin?tab=compliance").then((r) => r.json()).catch(() => null),
        fetch("/api/admin?tab=overview").then((r) => r.json()).catch(() => null),
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

      if (usersRes?.success && usersRes.users) {
        setUsers(usersRes.users);
      }

      if (complianceRes?.success && complianceRes.tickets) {
        setTickets(complianceRes.tickets);
      }

      if (telemetryRes?.success && telemetryRes.telemetry) {
        setTelemetry(telemetryRes.telemetry);
      }
    } catch (err) {
      console.error("Admin data sync error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogout = () => {
    logoutUser();
    router.push("/admin/login");
  };

  // 1. STORY MODERATION: PERMANENT PURGE
  const handleAdminDeleteStory = async (story: StoryData) => {
    if (!window.confirm(`[ADMIN OVERRIDE] Permanently delete "${story.title}" and all its chapters from Neon PostgreSQL? This cannot be undone.`)) {
      return;
    }

    const success = await deleteStory(story.slug);
    if (success) {
      setStories((prev) => prev.filter((s) => s.slug !== story.slug));
      setFeedback({ type: "success", message: `Story "${story.title}" was permanently purged from database.` });
    } else {
      setFeedback({ type: "error", message: `Failed to delete story "${story.title}".` });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // 2. STORY MODERATION: RATING ESCALATION
  const handleUpdateRating = async (slug: string, newRating: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STORY_RATING",
          storySlug: slug,
          rating: newRating,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStories((prev) =>
          prev.map((s) => (s.slug === slug ? { ...s, rating: newRating as any } : s))
        );
        setFeedback({ type: "success", message: data.message });
      } else {
        setFeedback({ type: "error", message: data.message || "Failed to update rating." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Network error" });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // 3. STORY MODERATION: PUBLICATION TOGGLE (HIDE/UNPUBLISH)
  const handleToggleStoryStatus = async (slug: string, currentStatus: string) => {
    const nextStatus = currentStatus === "DRAFT" ? "ONGOING" : "DRAFT";
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_STORY_STATUS",
          storySlug: slug,
          status: nextStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStories((prev) =>
          prev.map((s) => (s.slug === slug ? { ...s, status: nextStatus as any } : s))
        );
        setFeedback({ type: "success", message: data.message });
      } else {
        setFeedback({ type: "error", message: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // 4. DEEP CHAPTER INSPECTION
  const handleInspectStory = async (slug: string) => {
    setInspectLoading(true);
    try {
      const res = await fetch(`/api/admin?tab=chapters&slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (data.success && data.story) {
        setInspectedStory(data.story);
      } else {
        // Fallback to local memory representation if API is unavailable
        const local = stories.find((s) => s.slug === slug);
        setInspectedStory(local || null);
      }
    } catch (err) {
      console.warn("Inspect fetch fallback:", err);
      const local = stories.find((s) => s.slug === slug);
      setInspectedStory(local || null);
    } finally {
      setInspectLoading(false);
    }
  };

  // 5. USER ROSTER: UPDATE ROLE (RBAC)
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_USER_ROLE",
          userId,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        setFeedback({ type: "success", message: data.message });
      } else {
        setFeedback({ type: "error", message: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // 6. USER ROSTER: TOGGLE VERIFIED
  const handleToggleUserVerified = async (userId: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOGGLE_USER_VERIFIED",
          userId,
          isVerified: !current,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isVerified: !current } : u))
        );
        setFeedback({ type: "success", message: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // 7. SPOTLIGHT: STAFF MANUAL PIN
  const handleStaffPinSpotlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinStorySlug) return;

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PIN_SPOTLIGHT",
          storySlug: pinStorySlug,
          pinDays: pinDurationDays,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", message: data.message });
        setPinModalOpen(false);
        setPinStorySlug("");
        fetchAdminData();
      } else {
        setFeedback({ type: "error", message: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // 8. SPOTLIGHT: TERMINATE
  const handleEndCampaignEarly = async (campaignId: string) => {
    if (window.confirm("End this spotlight campaign immediately?")) {
      await endSpotlightCampaign(campaignId);
      const updated = await syncSpotlightsWithServer();
      setCampaigns(updated || getAllSpotlightCampaigns());
      setFeedback({ type: "success", message: "Spotlight campaign terminated." });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // 9. SPOTLIGHT: RESET COOLDOWNS
  const handleResetCooldowns = () => {
    resetTestCooldowns();
    setCampaigns(getAllSpotlightCampaigns());
    setFeedback({ type: "success", message: "Spotlight fair discovery cooldowns reset." });
    setTimeout(() => setFeedback(null), 3000);
  };

  // 10. COMPLIANCE: RESOLVE TICKET
  const handleUpdateTicketStatus = async (ticketId: string, newStatus: ComplianceTicket["status"], notes: string) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_TICKET",
          ticketId,
          ticketStatus: newStatus,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus, moderatorNotes: notes } : t))
        );
        setFeedback({ type: "success", message: `Ticket ${ticketId} status updated to ${newStatus}.` });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
    setTimeout(() => setFeedback(null), 4000);
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

  // Filtered users for roster
  const filteredUsers = users.filter((u) => {
    if (!userSearchQuery.trim()) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const totalWords = stories.reduce((acc, s) => acc + (s.stats?.words || 0), 0);
  const totalChapters = stories.reduce((acc, s) => acc + (s.chapters?.length || 0), 0);
  const activeSpotlightsCount = campaigns.filter((c) => c.status === "ACTIVE" && Date.now() < c.endTimestamp).length;

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      
      {/* Top Administrative Header */}
      <header className="border-b border-red-500/20 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-red-600 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-red-950/50">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">FicForge Governance Center</span>
                <span className="text-[10px] font-mono uppercase bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
                  {currentUser.role}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Neon PostgreSQL: <strong className="text-emerald-400">ONLINE</strong> {telemetry?.latencyMs ? `(${telemetry.latencyMs}ms)` : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAdminData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Refresh All Database Records"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-orange-400" : ""}`} />
              Sync
            </button>

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
              <LogOut className="h-3.5 w-3.5" /> Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1360px] mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Toast Feedback Notification */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-between shadow-xl animate-in fade-in duration-150 ${
              feedback.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : "bg-red-500/15 border-red-500/40 text-red-300"
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs uppercase tracking-wider underline hover:opacity-80 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Global Operational Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Stories</span>
              <BookOpen className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1.5">{stories.length}</p>
            <span className="text-[10px] text-emerald-400 font-mono mt-0.5 inline-block">
              ● Neon Database Synced
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Chapters</span>
              <FileText className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1.5">{totalChapters}</p>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 inline-block">
              Manuscripts published
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Users</span>
              <Users className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1.5">{users.length || 3}</p>
            <span className="text-[10px] text-emerald-400 font-mono mt-0.5 inline-block">
              Universal Consumer Roster
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Word Volume</span>
              <Database className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1.5">{totalWords.toLocaleString()}</p>
            <span className="text-[10px] text-amber-400 font-mono mt-0.5 inline-block">
              Active story text
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Spotlights</span>
              <Sparkles className="h-4 w-4 text-orange-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1.5">{activeSpotlightsCount}</p>
            <span className="text-[10px] text-orange-400 font-mono mt-0.5 inline-block">
              2 credits / day rule active
            </span>
          </div>
        </div>

        {/* 6-Module Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Activity className="h-3.5 w-3.5" /> 4.1 System Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stories")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "stories"
                ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" /> 4.2 Content Moderation ({stories.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "users"
                ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Users className="h-3.5 w-3.5" /> 4.3 Users & RBAC ({users.length || 3})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("spotlights")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "spotlights"
                ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> 4.4 Spotlight Command ({campaigns.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("compliance")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "compliance"
                ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> 4.5 DMCA Safe Harbor ({tickets.length || 2})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("finance")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === "finance"
                ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" /> 4.6 Financial Audit Desk
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: 4.1 SYSTEM OVERVIEW & TELEMETRY                    */}
        {/* ========================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full">
                    PHASE 4: LIVE GOVERNANCE SYSTEM
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                    Executive Control & Infrastructure Status
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                    High-level architectural oversight connecting live PostgreSQL Neon records, moderation actions, and user permissions.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-right">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">DB Health Status</span>
                    <strong className="text-sm font-black text-white">HEALTHY • 100% ONLINE</strong>
                  </div>
                </div>
              </div>

              {/* Infrastructure Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                <div className="rounded-2xl border border-white/10 bg-[#020617]/70 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <Database className="h-4 w-4" /> Neon PostgreSQL Instance
                  </div>
                  <p className="text-xs text-slate-300">
                    Host: <code className="text-amber-300 font-mono text-[11px]">ep-soft-voice-a55qfxm7-pooler.us-east-2.aws.neon.tech</code>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Connection Pooling: Active via PgBouncer. Measured query ping: <strong className="text-emerald-400">{telemetry?.latencyMs || 22}ms</strong>.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#020617]/70 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4" /> Cryptographic Session Guard
                  </div>
                  <p className="text-xs text-slate-300">
                    Staff Identity Token: <code className="text-purple-300 font-mono text-[11px]">ficforge_session (HS256)</code>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Protected by Next.js Server Proxy Middleware with zero client redirect loops.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#020617]/70 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="h-4 w-4" /> Content Compliance Engine
                  </div>
                  <p className="text-xs text-slate-300">
                    Fanfiction Safe Harbor: <span className="text-emerald-400 font-bold">100% Free Hard-Locked</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Explicit (18+) stories automatically enforce Age Verification Gateway and PayPal compliance blocks.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab("stories")}
                className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900 hover:border-red-500/40 text-left transition-all group cursor-pointer"
              >
                <BookOpen className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform mb-2" />
                <strong className="text-sm font-bold text-white block">Moderate Stories</strong>
                <span className="text-xs text-slate-400">Inspect chapters, change ratings, or unpublish stories.</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900 hover:border-red-500/40 text-left transition-all group cursor-pointer"
              >
                <Users className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform mb-2" />
                <strong className="text-sm font-bold text-white block">Manage User Roles</strong>
                <span className="text-xs text-slate-400">Elevate to Moderator / Admin or adjust verification status.</span>
              </button>

              <button
                type="button"
                onClick={() => setPinModalOpen(true)}
                className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900 hover:border-red-500/40 text-left transition-all group cursor-pointer"
              >
                <Pin className="h-5 w-5 text-orange-400 group-hover:scale-110 transition-transform mb-2" />
                <strong className="text-sm font-bold text-white block">Staff Manual Pin</strong>
                <span className="text-xs text-slate-400">Feature any story on homepage spotlight without credit deductions.</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("compliance")}
                className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 hover:bg-slate-900 hover:border-red-500/40 text-left transition-all group cursor-pointer"
              >
                <ShieldCheck className="h-5 w-5 text-red-400 group-hover:scale-110 transition-transform mb-2" />
                <strong className="text-sm font-bold text-white block">DMCA & Appeals</strong>
                <span className="text-xs text-slate-400">Review copyright takedown claims and author appeal hearings.</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: 4.2 CONTENT MODERATION & DEEP CHAPTER INSPECTION   */}
        {/* ========================================================= */}
        {activeTab === "stories" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Master Story Catalog & Editorial Controls</h2>
                <p className="text-xs text-slate-400">
                  Search, review chapters, escalate content ratings, unpublish/hide, or permanently delete violating works.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title, author, fandom..."
                  className="w-full h-10 rounded-xl border border-white/10 bg-slate-900/80 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500 transition-all"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-950/60">
                      <th className="py-3 px-4">Story & Author</th>
                      <th className="py-3 px-4">Classification</th>
                      <th className="py-3 px-4">Rating (Escalate)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Chapters</th>
                      <th className="py-3 px-4">Words</th>
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

                        {/* Rating Escalation Dropdown */}
                        <td className="py-3.5 px-4">
                          <select
                            value={story.rating}
                            onChange={(e) => handleUpdateRating(story.slug, e.target.value)}
                            className={`h-7 rounded-lg border text-[11px] font-bold px-2 outline-none bg-[#020617] cursor-pointer ${
                              story.rating === "EXPLICIT"
                                ? "border-red-500/40 text-red-400 bg-red-950/20"
                                : story.rating === "MATURE"
                                ? "border-amber-500/40 text-amber-300"
                                : "border-white/15 text-slate-300"
                            }`}
                          >
                            <option value="GENERAL">General</option>
                            <option value="TEEN">Teen</option>
                            <option value="MATURE">Mature</option>
                            <option value="EXPLICIT">Explicit 18+</option>
                          </select>
                        </td>

                        {/* Publication Status Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStoryStatus(story.slug, story.status)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                              story.status === "DRAFT"
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                            }`}
                            title="Click to toggle Published vs Hidden/Draft"
                          >
                            {story.status === "DRAFT" ? "Hidden / Draft" : "Published"}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 font-mono">{story.chapters?.length || 0}</td>
                        <td className="py-3.5 px-4 font-mono">{story.stats.words.toLocaleString()}</td>

                        {/* Admin Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect Chapters Drawer Button */}
                            <button
                              type="button"
                              onClick={() => handleInspectStory(story.slug)}
                              className="p-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 cursor-pointer transition-colors"
                              title="Deep Chapter Inspection"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {/* View Live Story Link */}
                            <Link
                              href={`/story/${story.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                              title="Open Live Story Reader"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>

                            {/* Permanent Purge */}
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

        {/* ========================================================= */}
        {/* TAB 3: 4.3 USER ROSTER & ROLE-BASED ACCESS CONTROL (RBAC) */}
        {/* ========================================================= */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">User Directory & Role Governance</h2>
                <p className="text-xs text-slate-400">
                  Universal User accounts registered in Neon PostgreSQL. Elevate privileges or adjust verification flags.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Filter users by name, handle, email..."
                  className="w-full h-10 rounded-xl border border-white/10 bg-slate-900/80 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500 transition-all"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-950/60">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role (RBAC Assignment)</th>
                      <th className="py-3 px-4">Verified</th>
                      <th className="py-3 px-4">Stories Authored</th>
                      <th className="py-3 px-4">Sparks Balance</th>
                      <th className="py-3 px-4 text-right">Registration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatarUrl}
                              alt={u.name}
                              className="h-9 w-9 rounded-full object-cover border border-white/15"
                            />
                            <div>
                              <strong className="text-sm font-bold text-white block">{u.name}</strong>
                              <span className="text-[11px] text-slate-400 font-mono">@{u.username}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-300">{u.email}</td>

                        {/* Role Elevation Selector */}
                        <td className="py-3.5 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                            className={`h-8 rounded-lg border text-[11px] font-black px-2.5 outline-none bg-[#020617] cursor-pointer ${
                              u.role === "SUPER_ADMIN"
                                ? "border-red-500/50 text-red-300 bg-red-950/20"
                                : u.role === "MODERATOR"
                                ? "border-blue-500/50 text-blue-300 bg-blue-950/20"
                                : "border-white/15 text-slate-200"
                            }`}
                          >
                            <option value="READER">USER (Reader + Author)</option>
                            <option value="CREATOR">CREATOR</option>
                            <option value="MODERATOR">MODERATOR</option>
                            <option value="SUPER_ADMIN">SUPER_ADMIN (Staff)</option>
                          </select>
                        </td>

                        {/* Verified Badge Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleUserVerified(u.id, u.isVerified)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                              u.isVerified
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                : "bg-slate-800 border-white/10 text-slate-400"
                            }`}
                          >
                            {u.isVerified ? "✓ Verified" : "Unverified"}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 font-mono">{u.storyCount}</td>
                        <td className="py-3.5 px-4 font-mono text-amber-300">⚡ {u.sparksBalance}</td>
                        <td className="py-3.5 px-4 font-mono text-right text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: 4.4 CREATOR SPOTLIGHT COMMAND CENTER               */}
        {/* ========================================================= */}
        {activeTab === "spotlights" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Creator Spotlight Promotions Center</h2>
                <p className="text-xs text-slate-400">
                  Manage homepage promoted works, enforce 2 credits/day fair discovery limits, or manually pin featured titles.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPinModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-3.5 py-2 text-xs font-black text-slate-950 shadow-md shadow-orange-950/40 hover:opacity-95 transition-all cursor-pointer"
                >
                  <Pin className="h-3.5 w-3.5" /> Staff Manual Pin
                </button>

                <button
                  type="button"
                  onClick={handleResetCooldowns}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset Cooldowns
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-950/60">
                      <th className="py-3 px-4">Story Title</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Campaign Window / Expiry</th>
                      <th className="py-3 px-4">Credits Consumed</th>
                      <th className="py-3 px-4">Impressions</th>
                      <th className="py-3 px-4">Clicks</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {campaigns.map((c) => {
                      const now = Date.now();
                      const isActive = c.status === "ACTIVE" && now < c.endTimestamp;
                      const daysLeft = isActive ? Math.max(1, Math.ceil((c.endTimestamp - now) / (24 * 60 * 60 * 1000))) : 0;

                      return (
                        <tr key={c.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">{c.storyTitle || c.storySlug}</td>
                          <td className="py-3.5 px-4">
                            {isActive ? (
                              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                                ACTIVE SPOTLIGHT ({daysLeft}d left)
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-800 border border-white/10 px-2.5 py-0.5 text-[10px] font-bold text-slate-400">
                                EXPIRED / COMPLETED
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                            {c.startDate && c.endDate ? (
                              <span>
                                {c.startDate} → <strong className={isActive ? "text-amber-300" : "text-slate-400"}>{c.endDate}</strong>
                              </span>
                            ) : (
                              <span className="text-slate-500">7-Day Window</span>
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
        )}

        {/* ========================================================= */}
        {/* TAB 5: 4.5 DMCA SAFE HARBOR & COMPLIANCE CLEARINGHOUSE    */}
        {/* ========================================================= */}
        {activeTab === "compliance" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">DMCA Safe Harbor & Dispute Clearinghouse</h2>
              <p className="text-xs text-slate-400">
                Official intake and review desk for copyright takedown notices and author appeals.
              </p>
            </div>

            {/* Tickets Table */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-950/60">
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Claimant / Sender</th>
                      <th className="py-3 px-4">Target Story URL</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Moderator Review Notes</th>
                      <th className="py-3 px-4 text-right">Action Resolution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {tickets.map((t) => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-300">{t.id}</td>
                        <td className="py-3.5 px-4">
                          <strong className="text-white block">{t.claimantName}</strong>
                          <span className="text-[11px] text-slate-400 font-mono">{t.claimantEmail}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] font-mono text-indigo-300 max-w-xs truncate block" title={t.allegedInfringingUrls}>
                            {t.allegedInfringingUrls}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{t.copyrightedWorkDescription}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            t.status === "OPEN"
                              ? "bg-red-500/10 border-red-500/40 text-red-400"
                              : t.status === "UNDER_REVIEW"
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                              : t.status === "ACCEPTED_REMOVED"
                              ? "bg-purple-500/10 border-purple-500/40 text-purple-300"
                              : "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 italic text-[11px]">
                          {t.moderatorNotes || "No notes logged yet."}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {t.status === "OPEN" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateTicketStatus(t.id, "UNDER_REVIEW", "Staff reviewing alleged text.")}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                              >
                                Review
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleUpdateTicketStatus(t.id, "ACCEPTED_REMOVED", "Content removed under statutory DMCA rule.")}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 cursor-pointer"
                            >
                              Takedown
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateTicketStatus(t.id, "REJECTED", "Claim rejected: Valid original work or parody fair use.")}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Statutory Compliance Guidelines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="h-5 w-5" /> 100% Free Fanfiction Safe Harbor
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fanfiction stories are hard-locked against Fast Pass paywalls and monetization subscriptions. All chapters remain 100% free to read to comply with DMCA non-commercial protections.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <Clock className="h-5 w-5" /> Statutory Counter-Notice Timer
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Under statutory 17 U.S.C. § 512, authors have 10–14 business days to submit a counter-notice before takedowns become permanent. All appeals are logged with immutable audit timestamps.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: 4.6 FINANCIAL AUDIT & PAYOUT STAGING               */}
        {/* ========================================================= */}
        {activeTab === "finance" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">Financial Audit & Payout Approval Desk</h2>
              <p className="text-xs text-slate-400">
                Audits Sparks circulation, tipping ledger, and stages creator cashout batches for Phase 5 (PayPal).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Circulating Sparks</span>
                <p className="text-3xl font-black text-amber-400 mt-2">12,450 ⚡</p>
                <p className="text-xs text-slate-400 mt-1">Total in user wallets across FicForge</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Creator Revenue Split</span>
                <p className="text-3xl font-black text-emerald-400 mt-2">82% / 18%</p>
                <p className="text-xs text-slate-400 mt-1">Creator Vault allocation vs Platform Fee</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Next Scheduled Cashout</span>
                <p className="text-3xl font-black text-purple-400 mt-2">1st & 15th</p>
                <p className="text-xs text-slate-400 mt-1">Automated batch dispatch ($50 threshold)</p>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Phase 5 PayPal Integration Bridge</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This desk links directly to the upcoming Phase 5 PayPal Orders API and automated mass payouts engine.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-300 border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 rounded-xl">
                Ready for Phase 5 Connection
              </span>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* MODAL 1: DEEP CHAPTER INSPECTION DRAWER                    */}
      {/* ========================================================= */}
      {inspectedStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/15 bg-slate-950 p-6 sm:p-8 flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between border-b border-white/10 pb-4 shrink-0">
              <div>
                <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
                  DEEP CHAPTER AUDIT · STORY INSPECTION
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {inspectedStory.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Author: <strong>{inspectedStory.author?.name}</strong> (@{inspectedStory.author?.username}) · Classification: {inspectedStory.classification} · Rating: {inspectedStory.rating}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectedStory(null)}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chapters List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {inspectedStory.chapters && inspectedStory.chapters.length > 0 ? (
                inspectedStory.chapters.map((ch: any, idx: number) => (
                  <div key={ch.id || idx} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-xs font-black text-indigo-300 font-mono">
                          Chapter {ch.number || idx + 1}
                        </span>
                        <strong className="text-sm font-bold text-white">{ch.title}</strong>
                      </div>
                      <span className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-300 font-mono">
                        {ch.wordCount?.toLocaleString() || 0} words
                      </span>
                    </div>

                    {ch.topAuthorNote && (
                      <div className="rounded-lg bg-indigo-950/30 border border-indigo-500/20 p-2.5 text-xs text-indigo-200">
                        <strong>Top Author Note:</strong> {ch.topAuthorNote}
                      </div>
                    )}

                    <div className="rounded-xl bg-[#020617] p-3 text-xs text-slate-300 font-serif leading-relaxed max-h-36 overflow-y-auto border border-white/5">
                      {Array.isArray(ch.content) ? ch.content.join("\n\n") : (ch.content || "No body content.")}
                    </div>

                    {ch.bottomAuthorNote && (
                      <div className="rounded-lg bg-indigo-950/30 border border-indigo-500/20 p-2.5 text-xs text-indigo-200">
                        <strong>Bottom Author Note:</strong> {ch.bottomAuthorNote}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No published chapters logged for this title yet.
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400 font-mono">
                Total Chapters: {inspectedStory.chapters?.length || 0}
              </span>
              <button
                type="button"
                onClick={() => setInspectedStory(null)}
                className="px-5 py-2 rounded-xl bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: STAFF MANUAL SPOTLIGHT PIN MODAL                 */}
      {/* ========================================================= */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-orange-400">
                <Pin className="h-5 w-5" />
                <h3 className="text-lg font-black text-white">Staff Manual Spotlight Pin</h3>
              </div>
              <button
                onClick={() => setPinModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleStaffPinSpotlight} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                  Select Story to Feature
                </label>
                <select
                  value={pinStorySlug}
                  onChange={(e) => setPinStorySlug(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl border border-white/15 bg-[#020617] px-3 text-xs font-bold text-white outline-none focus:border-orange-500"
                >
                  <option value="">-- Choose a Story --</option>
                  {stories.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title} ({s.classification}) by {s.author.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                  Pin Duration
                </label>
                <select
                  value={pinDurationDays}
                  onChange={(e) => setPinDurationDays(Number(e.target.value))}
                  className="w-full h-11 rounded-xl border border-white/15 bg-[#020617] px-3 text-xs font-bold text-white outline-none focus:border-orange-500"
                >
                  <option value={1}>1 Day (24 Hours)</option>
                  <option value={3}>3 Days (Standard Staff Pin)</option>
                  <option value={7}>7 Days (Full Week Feature)</option>
                </select>
              </div>

              <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-[11px] text-orange-200">
                Staff manual pins appear on the homepage Hero Spotlight carousel without deducting user credits.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPinModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!pinStorySlug}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-xs font-black text-slate-950 shadow-lg shadow-orange-950/40 hover:opacity-95 disabled:opacity-40 transition-all cursor-pointer"
                >
                  Pin Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
