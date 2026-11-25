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
  EyeOff,
  Pencil,
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
  Menu,
  ChevronRight,
} from "lucide-react";
import AdminOverviewCharts from "@/components/AdminOverviewCharts";

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

  // Tab State: overview, stories, users, spotlights, compliance, finance, moderators
  const [activeTab, setActiveTab] = useState<"overview" | "stories" | "users" | "spotlights" | "compliance" | "finance" | "moderators">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Moderator Appointment State
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

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

    // If not authenticated as administrator in localStorage, verify with server session before redirecting
    if (!isUserAdmin(user)) {
      fetch("/api/auth/session")
        .then((r) => r.json())
        .then((data) => {
          if (data.authenticated && data.user && isUserAdmin(data.user)) {
            localStorage.setItem("ficforge_auth_session", JSON.stringify(data.user));
            localStorage.setItem("ficforge_user_session", JSON.stringify(data.user));
            setCurrentUser(data.user);
            fetchAdminData();
          } else {
            window.location.href = "/admin/login";
          }
        })
        .catch(() => {
          window.location.href = "/admin/login";
        });
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
    window.location.href = "/admin/login";
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

  // 5.1 APPOINT MODERATOR
  const handleAppointModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateId) return;

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_USER_ROLE",
          userId: selectedCandidateId,
          role: "MODERATOR",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedCandidateId ? { ...u, role: "MODERATOR" } : u))
        );
        setSelectedCandidateId("");
        setFeedback({ type: "success", message: data.message || "User successfully appointed as Platform Moderator." });
      } else {
        setFeedback({ type: "error", message: data.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // 5.2 REVOKE MODERATOR
  const handleRevokeModerator = async (userId: string, userName: string) => {
    if (window.confirm(`Revoke moderator privileges from "${userName}" and return them to standard User?`)) {
      try {
        const res = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "UPDATE_USER_ROLE",
            userId,
            role: "USER",
          }),
        });
        const data = await res.json();
        if (data.success) {
          setUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, role: "USER" } : u))
          );
          setFeedback({ type: "success", message: `Moderator privileges revoked for ${userName}.` });
        } else {
          setFeedback({ type: "error", message: data.message });
        }
      } catch (err: any) {
        setFeedback({ type: "error", message: err.message });
      }
      setTimeout(() => setFeedback(null), 4000);
    }
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

  // 8.1 SPOTLIGHT: APPROVE EXPLICIT CAMPAIGN
  const handleApproveCampaign = async (campaignId: string) => {
    try {
      const res = await fetch("/api/spotlight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", campaignId }),
      });
      const data = await res.json();
      const updated = await syncSpotlightsWithServer();
      setCampaigns(updated || getAllSpotlightCampaigns());
      setFeedback({ type: "success", message: data.message || "Explicit spotlight approved and now live on homepage!" });
      setTimeout(() => setFeedback(null), 3500);
    } catch {
      setFeedback({ type: "error", message: "Failed to approve campaign." });
    }
  };

  // 8.2 SPOTLIGHT: REJECT EXPLICIT CAMPAIGN
  const handleRejectCampaign = async (campaignId: string) => {
    if (window.confirm("Reject this spotlight request and refund author promo credits?")) {
      try {
        const res = await fetch("/api/spotlight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reject", campaignId }),
        });
        const data = await res.json();
        const updated = await syncSpotlightsWithServer();
        setCampaigns(updated || getAllSpotlightCampaigns());
        setFeedback({ type: "success", message: data.message || "Spotlight request rejected. Promo credits refunded." });
        setTimeout(() => setFeedback(null), 3500);
      } catch {
        setFeedback({ type: "error", message: "Failed to reject campaign." });
      }
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
  const pendingApprovalsCount = campaigns.filter((c) => c.status === "PENDING_APPROVAL").length;

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col lg:flex-row relative">
      
      {/* 1. Mobile Top Header (Screens < lg) */}
      <div className="lg:hidden border-b border-white/10 bg-slate-950/95 px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-red-600 to-orange-600 flex items-center justify-center text-white shadow-md shadow-red-950/50">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="text-sm font-black text-white flex items-center gap-1.5">
              FicForge Admin
              <span className="text-[9px] font-mono bg-red-500/20 text-red-300 border border-red-500/40 px-1.5 py-0.2 rounded font-bold">
                {currentUser.role}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Neon DB Online
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* 2. Left Sidebar Navigation Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#060B15] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0 h-screen lg:sticky lg:top-0 overflow-y-auto no-scrollbar ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col">
          {/* Sidebar Brand Header */}
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-red-600 via-orange-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-red-950/60 ring-1 ring-white/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight text-white leading-tight">
                    FicForge Admin
                  </h1>
                  <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase tracking-wider">
                    Governance Suite v4.6
                  </span>
                </div>
              </div>

              {/* Close Button on Mobile */}
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Neon PostgreSQL Live Indicator */}
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-mono text-[11px] font-bold text-emerald-300">Neon PostgreSQL</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 font-bold">
                {telemetry?.latencyMs ? `${telemetry.latencyMs}ms` : "100% ONLINE"}
              </span>
            </div>
          </div>

          {/* Navigation Links Grouped by Category */}
          <nav className="p-3.5 space-y-6">
            
            {/* GROUP 1: CORE GOVERNANCE */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-1.5">
                Core Governance
              </span>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => { setActiveTab("overview"); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "overview"
                      ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="h-4 w-4 shrink-0" />
                    <span>4.1 System Overview</span>
                  </div>
                  <ChevronRight className={`h-3 w-3 ${activeTab === "overview" ? "text-white" : "text-slate-600"}`} />
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("stories"); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "stories"
                      ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span>4.2 Story Moderation</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    activeTab === "stories" ? "bg-white/20 text-white" : "bg-white/10 text-slate-300"
                  }`}>
                    {stories.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("users"); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "users"
                      ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>4.3 User Directory</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    activeTab === "users" ? "bg-white/20 text-white" : "bg-white/10 text-slate-300"
                  }`}>
                    {users.length || 3}
                  </span>
                </button>
              </div>
            </div>

            {/* GROUP 2: COMMUNITY & OPERATIONS */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-1.5">
                Community & Operations
              </span>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => { setActiveTab("spotlights"); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "spotlights"
                      ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span>4.4 Spotlight Command</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    activeTab === "spotlights"
                      ? "bg-white/20 text-white"
                      : pendingApprovalsCount > 0
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-amber-500/20 text-amber-300"
                  }`}>
                    {pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Queued` : `${activeSpotlightsCount} Live`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("compliance"); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "compliance"
                      ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>4.5 DMCA Safe Harbor</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    activeTab === "compliance" ? "bg-white/20 text-white" : "bg-purple-500/20 text-purple-300"
                  }`}>
                    {tickets.length || 2}
                  </span>
                </button>

                {/* 4.6 Financial Audit Desk (SUPER_ADMIN Only) */}
                {currentUser?.role === "SUPER_ADMIN" && (
                  <button
                    type="button"
                    onClick={() => { setActiveTab("finance"); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "finance"
                        ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <DollarSign className="h-4 w-4 shrink-0" />
                      <span>4.6 Financial Audit Desk</span>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      activeTab === "finance" ? "bg-red-700/60 text-white" : "text-emerald-400 font-bold"
                    }`}>
                      50% Cut
                    </span>
                  </button>
                )}

                {/* 4.7 Staff & Moderators (SUPER_ADMIN Only) */}
                {currentUser?.role === "SUPER_ADMIN" && (
                  <button
                    type="button"
                    onClick={() => { setActiveTab("moderators"); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "moderators"
                        ? "bg-red-600 text-white shadow-lg shadow-red-950/50"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="h-4 w-4 shrink-0" />
                      <span>4.7 Staff & Moderators</span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      activeTab === "moderators" ? "bg-white/20 text-white" : "bg-indigo-500/20 text-indigo-300"
                    }`}>
                      {users.filter((u) => u.role === "MODERATOR" || u.role === "SUPER_ADMIN").length} Staff
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* GROUP 3: SHORTCUTS & ACTIONS */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 block mb-1.5">
                Staff Quick Actions
              </span>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => { setPinModalOpen(true); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-orange-300 hover:bg-orange-500/10 border border-orange-500/20 transition-all cursor-pointer"
                >
                  <Pin className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                  <span>Staff Manual Pin</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetCooldowns}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 transition-all cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Reset Cooldowns</span>
                </button>
              </div>
            </div>

          </nav>
        </div>

        {/* Sidebar Footer: Admin Profile & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-[#040810]">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-red-500 to-amber-500 flex items-center justify-center font-black text-sm text-white shrink-0 overflow-hidden">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full object-cover" />
              ) : (
                <span>A</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white truncate block">
                  {currentUser.name || "Valerius Frost"}
                </span>
                <span className="text-[9px] font-mono font-bold bg-red-500/30 text-red-300 px-1.5 py-0.2 rounded shrink-0">
                  ADMIN
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate block font-mono">
                {currentUser.email || "admin@ficforge.org"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all text-center"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Public Site
            </Link>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Exit
            </button>
          </div>
        </div>
      </aside>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Workspace Sticky Topbar (Desktop) */}
        <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 hidden lg:flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>FicForge Governance</span>
              <ChevronRight className="h-3 w-3 text-slate-600" />
              <span className="text-white font-bold uppercase tracking-wider">
                {activeTab === "overview" && "4.1 System Overview & Telemetry"}
                {activeTab === "stories" && "4.2 Content Moderation"}
                {activeTab === "users" && "4.3 User Directory"}
                {activeTab === "spotlights" && "4.4 Spotlight Command Center"}
                {activeTab === "compliance" && "4.5 DMCA Safe Harbor"}
                {activeTab === "finance" && "4.6 Financial Audit Desk"}
                {activeTab === "moderators" && "4.7 Staff & Moderation Governance"}
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
              {activeTab === "overview" && "Executive Telemetry & Infrastructure Control"}
              {activeTab === "stories" && "Published Manuscripts & Moderation Audit"}
              {activeTab === "users" && "Universal User Roster & Directory"}
              {activeTab === "spotlights" && "Creator Spotlight Promotions Command"}
              {activeTab === "compliance" && "DMCA Safe Harbor & Dispute Clearinghouse"}
              {activeTab === "finance" && "Financial Audit Desk & Platform Splits"}
              {activeTab === "moderators" && "Staff Team & Appointed Platform Moderators"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAdminData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Refresh All Database Records"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-orange-400" : ""}`} />
              Sync DB
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:border-white/20 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Public Site
            </Link>

            <button
              type="button"
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Exit
            </button>
          </div>
        </header>

        {/* Scrollable Main Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-8 flex-1">
          
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

        {/* ========================================================= */}
        {/* TAB 1: 4.1 SYSTEM OVERVIEW & TELEMETRY                    */}
        {/* ========================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {pendingApprovalsCount > 0 && (
              <div className="rounded-2xl border border-rose-500/50 bg-gradient-to-r from-rose-950/70 via-slate-900 to-rose-950/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 animate-pulse">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      Explicit (18+) Spotlight Moderation Required
                      <span className="text-[10px] font-mono font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                        {pendingApprovalsCount} {pendingApprovalsCount === 1 ? "Story" : "Stories"} Waiting
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Explicit stories are blocked from the homepage discovery rotation until verified and approved by staff.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("spotlights")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white shadow-lg shadow-rose-950/50 transition-all cursor-pointer shrink-0"
                >
                  <span>Open Moderation Queue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}



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

            {/* Visual Analytics & Governance Trajectory Charts */}
            <AdminOverviewCharts
              stories={stories}
              users={users as any}
              campaigns={campaigns}
              telemetry={telemetry}
            />
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
                            style={{ colorScheme: "dark" }}
                            className={`h-7 rounded-lg border text-[11px] font-bold px-2 outline-none cursor-pointer transition-all ${
                              story.rating === "EXPLICIT"
                                ? "border-red-500/40 text-red-400 bg-red-950/30"
                                : story.rating === "MATURE"
                                ? "border-amber-500/40 text-amber-300 bg-amber-950/30"
                                : "border-white/15 text-slate-300 bg-slate-900/90 hover:border-white/30"
                            }`}
                          >
                            <option value="GENERAL" className="bg-[#0A1020] text-slate-200">General</option>
                            <option value="TEEN" className="bg-[#0A1020] text-slate-200">Teen</option>
                            <option value="MATURE" className="bg-[#0A1020] text-amber-300">Mature</option>
                            <option value="EXPLICIT" className="bg-[#0A1020] text-red-300">Explicit 18+</option>
                          </select>
                        </td>

                        {/* Publication Status Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStoryStatus(story.slug, story.status)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all inline-flex items-center gap-1.5 ${
                              story.status === "DRAFT"
                                ? "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
                                : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                            }`}
                            title={story.status === "DRAFT" ? "Click to Publish / Restore to Public" : "Click to Temporarily Hide / Unpublish Story"}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${story.status === "DRAFT" ? "bg-amber-400" : "bg-emerald-400"}`} />
                            <span>{story.status === "DRAFT" ? "Hidden / Draft" : "Live Published"}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 font-mono">{story.chapters?.length || 0}</td>
                        <td className="py-3.5 px-4 font-mono">{story.stats.words.toLocaleString()}</td>

                        {/* Admin Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Explicit Unpublish / Publish Action Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleStoryStatus(story.slug, story.status)}
                              className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                                story.status === "DRAFT"
                                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                                  : "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                              }`}
                              title={story.status === "DRAFT" ? "Publish Story (Restore to Public)" : "Temporarily Hide / Unpublish Story from Public View"}
                            >
                              {story.status === "DRAFT" ? (
                                <>
                                  <Eye className="h-3 w-3" />
                                  <span>Publish</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-3 w-3" />
                                  <span>Unpublish</span>
                                </>
                              )}
                            </button>

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

                            {/* Permanent Purge (SUPER_ADMIN ONLY) */}
                            {currentUser?.role === "SUPER_ADMIN" && (
                              <button
                                type="button"
                                onClick={() => handleAdminDeleteStory(story)}
                                className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
                                title="Super Admin Only: Permanently delete story from PostgreSQL"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
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
        {/* TAB 3: 4.3 USER DIRECTORY & ROSTER                        */}
        {/* ========================================================= */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Universal User Directory</h2>
                <p className="text-xs text-slate-400">
                  Universal User accounts registered in Neon PostgreSQL. Every account can both read and write stories.
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

            {/* Staff Governance Quick Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 text-xs">
              <div className="flex items-center gap-2.5 text-indigo-200">
                <UserCheck className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>
                  Staff & Moderator permissions are strictly isolated for security. To appoint or manage moderators, visit the dedicated{" "}
                  <strong className="text-white">Staff & Moderators</strong> console.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("moderators")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-bold text-indigo-200 transition-all cursor-pointer self-start sm:self-auto shrink-0"
              >
                <span>Staff & Moderators</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-950/60">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role / Account Type</th>
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

                        {/* Read-Only Account Role Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                              u.role === "SUPER_ADMIN"
                                ? "border-red-500/40 text-red-300 bg-red-950/40"
                                : u.role === "MODERATOR"
                                ? "border-indigo-500/40 text-indigo-300 bg-indigo-950/40"
                                : "border-white/10 text-slate-300 bg-slate-800/80"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                u.role === "SUPER_ADMIN"
                                  ? "bg-red-400"
                                  : u.role === "MODERATOR"
                                  ? "bg-indigo-400"
                                  : "bg-emerald-400"
                              }`}
                            />
                            {u.role === "SUPER_ADMIN"
                              ? "Super Admin"
                              : u.role === "MODERATOR"
                              ? "Moderator"
                              : "User (Universal)"}
                          </span>
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
          <div className="space-y-6">
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

            {/* Explicit Story Approval Moderation Queue */}
            <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-950 p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      Explicit (18+) Spotlight Moderation Queue
                      <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full">
                        {campaigns.filter((c) => c.status === "PENDING_APPROVAL").length} Pending
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Stories rated Explicit (18+) are held in escrow and require staff verification before entering public homepage rotation.
                    </p>
                  </div>
                </div>
              </div>

              {campaigns.filter((c) => c.status === "PENDING_APPROVAL").length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>No pending explicit spotlight requests. All promotions are verified.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {campaigns
                    .filter((c) => c.status === "PENDING_APPROVAL")
                    .map((c) => (
                      <div
                        key={c.id}
                        className="rounded-xl border border-rose-500/30 bg-slate-950/80 p-4 space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={c.coverImageUrl}
                            alt={c.storyTitle}
                            className="h-16 w-12 rounded-lg object-cover border border-white/10 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="text-sm font-bold text-white truncate block">
                                {c.storyTitle}
                              </strong>
                              <span className="text-[9px] font-mono font-black text-rose-400 bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.5 rounded uppercase">
                                EXPLICIT 18+
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono block mt-0.5">
                              Author: {c.authorName} · {c.creditsSpent || 2} Credits Held
                            </span>
                            <Link
                              href={`/story/${c.storySlug}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 mt-1"
                            >
                              Inspect Story <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => handleApproveCampaign(c.id)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Launch
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectCampaign(c.id)}
                            className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-black text-rose-300 transition-all cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" /> Reject & Refund
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
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
                      const isPending = c.status === "PENDING_APPROVAL";
                      const isRejected = c.status === "REJECTED";

                      return (
                        <tr key={c.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                            <span>{c.storyTitle || c.storySlug}</span>
                            {c.isExplicit && (
                              <span className="text-[9px] font-mono font-black text-rose-400 bg-rose-500/15 border border-rose-500/30 px-1 py-0.2 rounded">
                                18+
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {isPending ? (
                              <span className="rounded-full bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                                AWAITING MODERATION
                              </span>
                            ) : isRejected ? (
                              <span className="rounded-full bg-rose-500/15 border border-rose-500/40 px-2.5 py-0.5 text-[10px] font-bold text-rose-300">
                                REJECTED
                              </span>
                            ) : isActive ? (
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
                            {isPending ? (
                              <span className="text-amber-400/90 font-mono">Pending Staff Review</span>
                            ) : c.startDate && c.endDate ? (
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
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleApproveCampaign(c.id)}
                                  className="px-2 py-1 rounded-lg text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 transition-colors cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectCampaign(c.id)}
                                  className="px-2 py-1 rounded-lg text-xs font-bold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : isActive ? (
                              <button
                                type="button"
                                onClick={() => handleEndCampaignEarly(c.id)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/30 transition-colors cursor-pointer"
                              >
                                End Early
                              </button>
                            ) : null}
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
                        <td className="py-3.5 px-4 max-w-sm">
                          <a
                            href={t.allegedInfringingUrls}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono text-indigo-300 hover:text-indigo-200 hover:underline inline-flex items-center gap-1 truncate max-w-xs"
                            title={t.allegedInfringingUrls}
                          >
                            <span className="truncate">{t.allegedInfringingUrls}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
                          </a>
                          <span className="text-[10px] text-slate-400 block mt-1 whitespace-pre-line line-clamp-3">
                            {t.copyrightedWorkDescription}
                          </span>
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
                        <td className="py-3.5 px-4 text-[11px] text-slate-300">
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="italic">{t.moderatorNotes || "No notes logged yet."}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newNote = window.prompt("Update internal moderator notes (visible to staff only):", t.moderatorNotes || "");
                                if (newNote !== null) {
                                  handleUpdateTicketStatus(t.id, t.status, newNote);
                                }
                              }}
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer shrink-0"
                              title="Edit internal staff note"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {t.status === "OPEN" && (
                              <button
                                type="button"
                                onClick={() => {
                                  const note = window.prompt("Enter review note (or press OK to keep default):", "Staff reviewing alleged text.");
                                  if (note !== null) handleUpdateTicketStatus(t.id, "UNDER_REVIEW", note);
                                }}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                              >
                                Review
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const note = window.prompt("Enter takedown reason note:", "Content removed under statutory DMCA rule.");
                                if (note !== null) handleUpdateTicketStatus(t.id, "ACCEPTED_REMOVED", note);
                              }}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 cursor-pointer"
                            >
                              Takedown
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const note = window.prompt("Enter rejection reason note:", "Claim rejected: Valid original work or parody fair use.");
                                if (note !== null) handleUpdateTicketStatus(t.id, "REJECTED", note);
                              }}
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

        {/* ========================================================= */}
        {/* TAB 7: 4.7 STAFF & MODERATION GOVERNANCE                  */}
        {/* ========================================================= */}
        {activeTab === "moderators" && (
          currentUser?.role !== "SUPER_ADMIN" ? (
            <div className="rounded-3xl border border-red-500/20 bg-slate-900/80 p-12 text-center space-y-3 shadow-2xl">
              <Lock className="h-10 w-10 text-red-400 mx-auto" />
              <h3 className="text-xl font-black text-white">Super Administrator Privileges Required</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Staff appointment and moderator governance are strictly restricted to Super Administrators. Platform moderators cannot elevate user accounts or assign staff privileges.
              </p>
            </div>
          ) : (
          <div className="space-y-6">
            {/* Header & Role Overview */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full">
                    SECURITY & ACCESS GOVERNANCE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                    Staff & Moderation Team Roster
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                    Appoint verified community moderators to review explicit stories, inspect flagged manuscripts, and handle copyright disputes. Staff permissions are strictly audited.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/30 px-4 py-3 text-center">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Active Moderators</span>
                    <strong className="text-xl font-black text-white">
                      {users.filter((u) => u.role === "MODERATOR").length}
                    </strong>
                  </div>
                  <div className="rounded-2xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-center">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Super Admins</span>
                    <strong className="text-xl font-black text-white">
                      {users.filter((u) => u.role === "SUPER_ADMIN").length}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Form: Appoint New Moderator */}
              <div className="pt-6">
                <h3 className="text-base font-black text-white mb-2 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-indigo-400" />
                  Appoint a Community Moderator
                </h3>
                <p className="text-xs text-slate-400 mb-4 max-w-2xl leading-relaxed">
                  Select an eligible registered user to elevate to Moderator. Moderators gain access to the Explicit Spotlight Queue, chapter moderation drawer, and DMCA disputes. They cannot alter platform revenue splits or elevate users to Super Admin.
                </p>

                <form onSubmit={handleAppointModerator} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-9">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 mb-1.5">
                      Select Registered User
                    </label>
                    <select
                      value={selectedCandidateId}
                      onChange={(e) => setSelectedCandidateId(e.target.value)}
                      required
                      style={{ colorScheme: "dark" }}
                      className="w-full h-11 rounded-xl border border-white/15 bg-slate-950 px-3 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="" className="bg-[#0A1020] text-slate-400">
                        -- Choose a Registered User ({users.filter((u) => u.role !== "MODERATOR" && u.role !== "SUPER_ADMIN").length} Available) --
                      </option>
                      {users
                        .filter((u) => u.role !== "MODERATOR" && u.role !== "SUPER_ADMIN")
                        .map((u) => (
                          <option key={u.id} value={u.id} className="bg-[#0A1020] text-slate-200">
                            {u.name} (@{u.username}) • {u.email}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="md:col-span-3 flex items-end">
                    <button
                      type="submit"
                      disabled={!selectedCandidateId}
                      className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-black text-white shadow-lg shadow-indigo-950/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="h-4 w-4" />
                      Appoint Moderator
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Active Staff & Moderation Team Table */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">Active Staff & Moderation Team</h3>
                  <p className="text-xs text-slate-400">
                    Personnel with elevated administrative or moderation privileges on FicForge.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
                  {users.filter((u) => u.role === "MODERATOR" || u.role === "SUPER_ADMIN").length} Staff Members
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-950/60">
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role / Scope</th>
                      <th className="py-3 px-4">Access Level</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {users
                      .filter((u) => u.role === "MODERATOR" || u.role === "SUPER_ADMIN")
                      .map((u) => (
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

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                                u.role === "SUPER_ADMIN"
                                  ? "border-red-500/40 text-red-300 bg-red-950/40"
                                  : "border-indigo-500/40 text-indigo-300 bg-indigo-950/40"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  u.role === "SUPER_ADMIN" ? "bg-red-400" : "bg-indigo-400"
                                }`}
                              />
                              {u.role === "SUPER_ADMIN" ? "SUPER_ADMIN (Staff)" : "MODERATOR"}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-[11px] text-slate-400">
                            {u.role === "SUPER_ADMIN"
                              ? "Full Platform Operations, RBAC & Financial Control"
                              : "Content Moderation, Spotlight Queue & DMCA Desk"}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {u.role === "MODERATOR" ? (
                              <button
                                type="button"
                                onClick={() => handleRevokeModerator(u.id, u.name)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-300 transition-all cursor-pointer"
                              >
                                <UserX className="h-3.5 w-3.5" />
                                <span>Revoke Moderator</span>
                              </button>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-500 border border-white/5 bg-white/5 px-2.5 py-1 rounded-lg">
                                Protected Staff
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )
        )}

        </main>
      </div>

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
                  style={{ colorScheme: "dark" }}
                  className="w-full h-11 rounded-xl border border-white/15 bg-slate-900 px-3 text-xs font-bold text-white outline-none focus:border-orange-500"
                >
                  <option value="" className="bg-[#0A1020] text-slate-400">-- Choose a Story --</option>
                  {stories.map((s) => (
                    <option key={s.slug} value={s.slug} className="bg-[#0A1020] text-slate-200">
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
                  style={{ colorScheme: "dark" }}
                  className="w-full h-11 rounded-xl border border-white/15 bg-slate-900 px-3 text-xs font-bold text-white outline-none focus:border-orange-500"
                >
                  <option value={1} className="bg-[#0A1020] text-slate-200">1 Day (24 Hours)</option>
                  <option value={3} className="bg-[#0A1020] text-slate-200">3 Days (Standard Staff Pin)</option>
                  <option value={7} className="bg-[#0A1020] text-slate-200">7 Days (Full Week Feature)</option>
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
