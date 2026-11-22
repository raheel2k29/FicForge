"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import WriterAuthGate from "@/components/WriterAuthGate";
import { getCurrentUser, UserSession } from "@/lib/authStore";
import { getAllStories } from "@/lib/storyStore";
import {
  Sparkles,
  Heart,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Coins,
  Crown,
} from "lucide-react";

interface CreatorItem {
  name: string;
  username: string;
  avatarUrl: string;
  worksCount: number;
}

export default function SupportCreatorPage() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [creators, setCreators] = useState<CreatorItem[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<CreatorItem | null>(null);
  const [tipAmount, setTipAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    // Extract unique authors from stories catalog
    const allStories = Object.values(getAllStories());
    const authorMap = new Map<string, CreatorItem>();

    allStories.forEach((s) => {
      if (s.author && s.author.username) {
        const u = s.author.username.toLowerCase();
        if (!authorMap.has(u)) {
          authorMap.set(u, {
            name: s.author.name,
            username: s.author.username,
            avatarUrl: s.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            worksCount: 1,
          });
        } else {
          authorMap.get(u)!.worksCount += 1;
        }
      }
    });

    const list = Array.from(authorMap.values());
    setCreators(list);
    if (list.length > 0) {
      setSelectedCreator(list[0]);
    }
  }, []);

  const filteredCreators = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return creators;
    return creators.filter(
      (c) => c.name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q)
    );
  }, [creators, searchQuery]);

  const activeSparks = customAmount ? parseInt(customAmount, 10) || 0 : tipAmount;

  const handleSendSparks = () => {
    if (!selectedCreator || activeSparks <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(
        `Successfully sent ${activeSparks} Sparks to ${selectedCreator.name} (@${selectedCreator.username})!`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    }, 600);
  };

  return (
    <WriterAuthGate
      title="Sign In to Support Creators"
      description="Sign in to your FicForge account to show appreciation with Sparks and back your favorite authors."
    >
      <div className="min-h-screen bg-[#050B16] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1180px] mx-auto space-y-10">
          
          {/* Header */}
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest uppercase text-[#F97316] bg-orange-500/10 border border-orange-500/30 rounded-full px-3.5 py-1.5">
              <Sparkles className="h-3.5 w-3.5" /> CREATOR SUPPORT
            </span>

            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Support Creators with Sparks
            </h1>

            <p className="text-base text-slate-300 leading-relaxed">
              Use Sparks to show appreciation for a creator's dedication, passion, and serialized fiction. Creator support flows to the creator's profile identity to support their ongoing writing journey.
            </p>
          </div>

          {/* Success Toast */}
          {successMessage && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/15 p-4 flex items-center gap-3 text-emerald-300 text-sm font-bold shadow-xl animate-in fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Find & Select Creator (7 cols) */}
            <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 space-y-6 shadow-xl">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#F97316] font-bold">
                  STEP 1
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  Who do you want to support?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Search by creator name or select one of FicForge's active published writers below.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search creator name or @handle..."
                  className="w-full rounded-xl border border-white/10 bg-slate-800/80 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#6D5DFB] focus:outline-none focus:ring-1 focus:ring-[#6D5DFB] transition-all"
                />
              </div>

              {/* Creators List */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {filteredCreators.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    No creators found matching "{searchQuery}".
                  </div>
                ) : (
                  filteredCreators.map((creator) => {
                    const isSelected = selectedCreator?.username === creator.username;
                    return (
                      <div
                        key={creator.username}
                        onClick={() => setSelectedCreator(creator)}
                        className={`rounded-2xl border p-4 flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "border-orange-500/60 bg-gradient-to-r from-orange-950/30 to-slate-800/90 shadow-md"
                            : "border-white/5 bg-slate-950/50 hover:border-white/20 hover:bg-slate-950"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={creator.avatarUrl}
                            alt={creator.name}
                            className="h-12 w-12 rounded-xl object-cover border border-white/10"
                          />
                          <div>
                            <strong className="block text-sm font-bold text-white">
                              {creator.name}
                            </strong>
                            <span className="text-xs text-slate-400 font-mono">
                              @{creator.username} · {creator.worksCount} published {creator.worksCount === 1 ? "story" : "stories"}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                            isSelected
                              ? "bg-orange-500 text-white shadow"
                              : "border border-white/10 bg-white/5 text-slate-400"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Tip & Send Sparks (5 cols) */}
            <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#F97316] font-bold">
                  STEP 2
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  Send Sparks
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select a Sparks appreciation amount to transfer.
                </p>
              </div>

              {/* User Sparks Balance Pill */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                    YOUR SPARKS BALANCE
                  </span>
                  <span className="text-2xl font-black text-white">
                    {currentUser?.sparksBalance ?? 0} Sparks
                  </span>
                </div>
                <Link
                  href="/premium"
                  className="rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-black text-amber-300 hover:bg-amber-500/30 transition-all shadow-sm"
                >
                  + Add Sparks
                </Link>
              </div>

              {/* Selected Creator Preview */}
              {selectedCreator && (
                <div className="rounded-xl border border-white/10 bg-slate-800/60 p-3.5 flex items-center gap-3">
                  <img
                    src={selectedCreator.avatarUrl}
                    alt={selectedCreator.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-white truncate">
                      Supporting {selectedCreator.name}
                    </span>
                    <span className="block text-[11px] text-slate-400 font-mono truncate">
                      @{selectedCreator.username}
                    </span>
                  </div>
                </div>
              )}

              {/* Preset Choice Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {[100, 500, 1000].map((amount) => {
                  const isChosen = tipAmount === amount && !customAmount;
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setTipAmount(amount);
                        setCustomAmount("");
                      }}
                      className={`rounded-xl border p-3 text-center transition-all cursor-pointer ${
                        isChosen
                          ? "border-[#6D5DFB] bg-[#6D5DFB]/25 text-white shadow-md shadow-indigo-600/20"
                          : "border-white/10 bg-slate-800/80 text-slate-300 hover:border-white/20"
                      }`}
                    >
                      <strong className="block text-lg font-black">{amount}</strong>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Sparks</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Amount Field */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Custom Spark Amount
                </label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter custom amount (e.g. 250)"
                  className="w-full rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#6D5DFB] focus:outline-none focus:ring-1 focus:ring-[#6D5DFB] transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSendSparks}
                disabled={isSubmitting || !selectedCreator || activeSparks <= 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] py-3.5 px-6 text-sm font-extrabold text-white shadow-lg shadow-orange-600/30 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending Sparks...
                  </span>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    <span>Send {activeSparks} Sparks to {selectedCreator ? selectedCreator.name : "Creator"}</span>
                  </>
                )}
              </button>

              <div className="rounded-xl border border-white/5 bg-slate-950/80 p-3 text-[11px] text-slate-400 leading-relaxed">
                <span className="text-orange-400 font-bold block mb-0.5">Fair Harbor Policy</span>
                Sparks support creator presence and time. Support is not payment for exclusive chapters, fast passes, or promised updates.
              </div>
            </div>

          </div>

          {/* Spark Packs Link Section */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-950 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                NEED MORE SPARKS?
              </span>
              <h3 className="text-2xl font-black text-white">
                FicForge Spark Packs & Premium Tiers
              </h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Upgrade to Forge Plus for monthly Sparks allocations, ad-free reading, and exclusive creator formatting tools.
              </p>
            </div>
            <Link
              href="/premium"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-6 py-3.5 text-xs font-black text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all"
            >
              <Crown className="h-4 w-4 text-amber-300" /> View Memberships & Packs
            </Link>
          </div>

        </div>
      </div>
    </WriterAuthGate>
  );
}
