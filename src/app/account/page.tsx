"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getCurrentUser, logoutUser, UserSession, isUserAdmin } from "@/lib/authStore";
import { getBookmarkCount } from "@/lib/bookmarkStore";
import { getAllStories } from "@/lib/storyStore";
import {
  User,
  ShieldCheck,
  Bookmark,
  BookOpen,
  DollarSign,
  Sparkles,
  ArrowRight,
  LogOut,
  Edit3,
  HelpCircle,
  Crown,
  Lock,
  PenTool,
} from "lucide-react";

export default function AccountPage() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [userStoryCount, setUserStoryCount] = useState(0);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setHasCheckedAuth(true);

    if (user) {
      if (isUserAdmin(user)) {
        window.location.href = "/admin";
        return;
      }
      setBookmarkCount(getBookmarkCount());
      const allStories = Object.values(getAllStories());
      const myWorks = allStories.filter(
        (s) => s.author?.username?.toLowerCase() === user.username?.toLowerCase()
      );
      setUserStoryCount(myWorks.length);
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/login";
  };

  // Auth loading state
  if (!hasCheckedAuth) {
    return (
      <div className="min-h-screen bg-[#050B16] flex items-center justify-center text-slate-500">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <span className="text-xs font-mono tracking-wider text-slate-400">LOADING ACCOUNT...</span>
        </div>
      </div>
    );
  }

  // Not authenticated: Auth Gate
  if (!currentUser) {
    return (
      <div className="min-h-[80vh] bg-[#050B16] text-white flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#6D5DFB]/15 to-[#F97316]/10 blur-3xl pointer-events-none" />

          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#6D5DFB]/20 to-[#F97316]/20 border border-white/15 flex items-center justify-center mx-auto mb-5 text-[#F97316] shadow-xl">
            <Lock className="h-8 w-8" />
          </div>

          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#F97316] bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-full">
            AUTHENTICATION REQUIRED
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
            Sign In to Access Account
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Please sign in with your FicForge account credentials to view your profile, Sparks balance, and personal reading library.
          </p>

          <div className="mt-8 space-y-3">
            <Link
              href="/login?redirect=/account"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] py-3.5 px-6 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all text-center"
            >
              <span>Sign In to FicForge</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/register?redirect=/account"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-slate-800/80 hover:bg-slate-700/80 py-3.5 px-6 text-sm font-bold text-slate-200 hover:text-white transition-all text-center"
            >
              <span>Create Free Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin redirect notice
  if (isUserAdmin(currentUser)) {
    return (
      <div className="min-h-[80vh] bg-[#050B16] text-white flex items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md w-full rounded-3xl border border-red-500/30 bg-slate-900/90 p-8 shadow-2xl">
          <ShieldCheck className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-black text-white">Staff Administrator Session</h2>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            You are logged in with administrative privileges. Redirecting to Governance Console...
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-xs font-black text-white shadow-lg shadow-red-950/50"
          >
            Open Admin Console <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Authenticated Normal User Hub
  return (
    <div className="min-h-screen bg-[#050B16] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1180px] mx-auto space-y-8">
        
        {/* Hero Section */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-[#0A1020] to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <img
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                alt={currentUser.name}
                className="h-24 w-24 rounded-2xl object-cover border-2 border-white/20 shadow-xl"
              />
              <span className="absolute -bottom-2 -right-2 rounded-full bg-amber-500 text-slate-950 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow">
                {currentUser.membershipTier || "FREE"}
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="text-xs font-mono text-slate-400 font-bold">
                  @{currentUser.username}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {currentUser.email}
              </p>
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  {currentUser.sparksBalance ?? 0} Sparks Balance
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">
                  <Bookmark className="h-3.5 w-3.5" />
                  {bookmarkCount} Saved Bookmarks
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  <BookOpen className="h-3.5 w-3.5" />
                  {userStoryCount} Published Stories
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-center sm:self-start">
              <Link
                href="/edit-profile"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Log Out
              </button>
            </div>
          </div>
        </div>

        {/* Feature Hub Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Link
            href="/library"
            className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 hover:border-indigo-500/40 hover:bg-slate-900 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
              <Bookmark className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
              Saved Library
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Access your personal bookshelf, reading history, and offline synchronized chapters.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-400">
              View {bookmarkCount} Stories <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/write"
            className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 hover:border-orange-500/40 hover:bg-slate-900 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[#F97316] mb-4 group-hover:scale-105 transition-transform">
              <PenTool className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-white group-hover:text-orange-300 transition-colors">
              Creator Studio
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Write new chapters, manage serialized stories, and import multi-chapter manuscripts.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-orange-400">
              Open Workshop <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/my-stories"
            className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 hover:border-purple-500/40 hover:bg-slate-900 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition-colors">
              My Stories Catalog
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Review published works, chapter word counts, reader engagement, and promotion status.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-purple-400">
              Manage Stories ({userStoryCount}) <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/premium"
            className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 hover:border-amber-500/40 hover:bg-slate-900 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
              <Crown className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
              Membership & Sparks
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Explore Plus & Elite subscriber perks, ad-free reading, and monthly bonus Sparks.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-400">
              Manage Tier ({currentUser.membershipTier || "FREE"}) <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/creator-earnings"
            className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 hover:border-emerald-500/40 hover:bg-slate-900 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
              <DollarSign className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
              Creator Earnings
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Track creator tipping, Sparks conversion, and semi-monthly payout status.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
              View Earnings Ledger <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/help-center"
            className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 hover:border-blue-500/40 hover:bg-slate-900 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-white group-hover:text-blue-300 transition-colors">
              FicForge Help Center
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Find answers regarding community guidelines, DMCA policies, and author tools.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-400">
              Get Support <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

      </div>
    </div>
  );
}
