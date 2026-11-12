"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { mockStories } from "@/data/mockStories";
import {
  BookOpen,
  Heart,
  Bookmark,
  Share2,
  Zap,
  Clock,
  Eye,
  CheckCircle2,
  Lock,
  ArrowUpDown,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

function StoryDetailsContent() {
  const params = useParams();
  const slug = params?.slug as string;
  const story = mockStories[slug];

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(story?.stats.likes ?? 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [sortAscending, setSortAscending] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState(50);
  const [tipSuccess, setTipSuccess] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(true);

  useEffect(() => {
    if (story?.rating === "EXPLICIT") {
      const verified = localStorage.getItem("ficforge_age_verified") === "true";
      setIsAgeVerified(verified);
    }
  }, [story]);

  const handleAgeConfirm = () => {
    localStorage.setItem("ficforge_age_verified", "true");
    setIsAgeVerified(true);
  };

  if (story && story.rating === "EXPLICIT" && !isAgeVerified) {
    return (
      <div className="min-h-screen bg-[#050B16] text-white flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-lg w-full rounded-2xl border border-red-500/30 bg-slate-900/95 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-3xl mb-5 text-red-500">
            ⚠️
          </div>
          <span className="inline-flex items-center text-xs font-black tracking-widest uppercase text-red-400 bg-red-500/10 border border-red-500/30 rounded-full px-3 py-1 mb-3">
            AGE-RESTRICTED CONTENT (18+)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Explicit Content Gateway
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            This work is rated <strong className="text-red-400">EXPLICIT (18+)</strong> and may contain adult themes, graphic violence, or explicit material intended only for adults.
          </p>
          <div className="mt-4 rounded-xl border border-white/10 bg-[#020617]/80 p-3.5 text-xs text-slate-400 text-left">
            🛡️ <strong className="text-slate-200">Safe Harbor Notice:</strong> In accordance with payment processor policies and platform terms, explicit content cannot be monetized. Fast Pass unlocks and Sparks tipping are completely disabled on this title.
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAgeConfirm}
              className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 py-3 text-sm font-extrabold text-white shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-orange-500 transition-all cursor-pointer"
            >
              I am 18 or Older — Enter
            </button>
            <Link
              href="/browse"
              className="flex-1 rounded-xl border border-white/20 bg-slate-800/80 py-3 text-sm font-bold text-slate-300 hover:text-white transition-all text-center flex items-center justify-center"
            >
              Back to Safety
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-[#050B16] text-white flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="text-5xl mb-4">📖</div>
        <h1 className="text-3xl font-black">Story Not Found</h1>
        <p className="mt-2 text-slate-400 max-w-md">
          The story you are looking for might have been unpublished, moved, or is still in draft mode.
        </p>
        <Link
          href="/browse"
          className="mt-6 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/30"
        >
          Return to Browse
        </Link>
      </div>
    );
  }

  const handleLikeToggle = () => {
    if (hasLiked) {
      setLikesCount((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const handleCopyShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSendTip = () => {
    setTipSuccess(true);
    setTimeout(() => {
      setTipSuccess(false);
      setTipModalOpen(false);
    }, 2000);
  };

  const sortedChapters = [...story.chapters].sort((a, b) =>
    sortAscending ? a.number - b.number : b.number - a.number
  );

  return (
    <div className="min-h-screen bg-[#050B16] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1180px] mx-auto">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/browse" className="hover:text-white transition-colors">Browse</Link>
          <span>/</span>
          {story.fandom && (
            <>
              <span className="text-[#F97316]">{story.fandom}</span>
              <span>/</span>
            </>
          )}
          <span className="text-slate-200 truncate max-w-xs">{story.title}</span>
        </nav>

        {/* Hero Story Banner & Metadata Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-14">
          
          {/* Left Column: 3D Book Cover & Fast Action Buttons */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
            <div className="relative group w-64 sm:w-72 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-indigo-950/50 border border-white/15 transition-all duration-300 group-hover:scale-[1.02] group-hover:border-white/30">
              <img
                src={story.coverImageUrl}
                alt={story.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050B16] via-transparent to-transparent opacity-60" />
              
              {/* Floating Rating Pill */}
              <div className="absolute top-3 left-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md backdrop-blur-md ${
                  story.rating === "EXPLICIT"
                    ? "bg-red-500/80 text-white border border-red-400"
                    : story.rating === "MATURE"
                    ? "bg-amber-500/80 text-white border border-amber-400"
                    : "bg-emerald-500/80 text-white border border-emerald-400"
                }`}>
                  {story.rating}
                </span>
              </div>

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900/80 text-slate-200 border border-white/20 backdrop-blur-md">
                  {story.status}
                </span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="w-full max-w-xs mt-6 space-y-3">
              <Link
                href={`/story/${story.slug}/chapter-1`}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] py-3.5 px-6 text-base font-extrabold text-white shadow-xl shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all active:scale-[0.98]"
              >
                <BookOpen className="h-5 w-5" /> Start Reading (Ch. 1)
              </Link>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 text-xs font-bold transition-all ${
                    isBookmarked
                      ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300"
                      : "border-white/10 bg-slate-900/80 text-slate-300 hover:text-white hover:border-white/20"
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-emerald-400 text-emerald-400" : ""}`} />
                  {isBookmarked ? "In Library" : "Add to Library"}
                </button>

                <button
                  type="button"
                  onClick={handleLikeToggle}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-3 text-xs font-bold transition-all ${
                    hasLiked
                      ? "border-rose-500/60 bg-rose-500/20 text-rose-300"
                      : "border-white/10 bg-slate-900/80 text-slate-300 hover:text-white hover:border-white/20"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${hasLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                  {likesCount.toLocaleString()} Likes
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTipModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 py-2.5 px-3 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all"
                >
                  <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                  Tip Sparks
                </button>

                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 py-2.5 px-3 text-xs font-bold text-slate-300 hover:text-white hover:border-white/20 transition-all"
                >
                  <Share2 className="h-4 w-4" />
                  {copiedLink ? "Link Copied!" : "Share Story"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Author, Stats, Synopsis & Tags */}
          <div className="lg:col-span-8 flex flex-col justify-start">
            
            {/* Classification & Fandom Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              {story.classification === "FANFICTION" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-orange-500/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#F97316]">
                  <ShieldCheck className="h-3.5 w-3.5" /> 100% Free Fanfiction
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#A78BFA]">
                  <Sparkles className="h-3.5 w-3.5" /> Original Serialized Fiction
                </span>
              )}

              {story.fandom && (
                <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-sky-300">
                  {story.fandom}
                </span>
              )}

              {story.genres.map((genre) => (
                <span
                  key={genre}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              {story.title}
            </h1>

            {/* Author Byline */}
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-slate-900/60 border border-white/10 w-fit">
              <img
                src={story.author.avatarUrl}
                alt={story.author.name}
                className="h-10 w-10 rounded-full object-cover border border-purple-500/40"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-white">{story.author.name}</span>
                  {story.author.isVerified && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#F97316] fill-orange-500/20" />
                  )}
                </div>
                <span className="text-xs text-slate-400">@{story.author.username}</span>
              </div>
            </div>

            {/* Story Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur-sm mb-6 text-center">
              <div>
                <div className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Chapters</div>
                <div className="text-base font-black text-white mt-0.5">{story.stats.chapterCount}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Words</div>
                <div className="text-base font-black text-white mt-0.5">{story.stats.words.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Reads</div>
                <div className="text-base font-black text-white mt-0.5">{story.stats.views.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Bookmarks</div>
                <div className="text-base font-black text-white mt-0.5">{story.stats.bookmarks.toLocaleString()}</div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-xs uppercase tracking-wider font-extrabold text-slate-500">Updated</div>
                <div className="text-base font-black text-[#F97316] mt-0.5">{story.updatedAt}</div>
              </div>
            </div>

            {/* Synopsis */}
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Synopsis</h3>
              <p className="text-sm sm:text-base leading-relaxed text-slate-200 bg-slate-900/20 p-4 rounded-xl border border-white/5">
                {story.synopsis}
              </p>
            </div>

            {/* Story Tags Pill Breakdown */}
            <div className="space-y-3">
              {story.tags.pairings.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Pairings:</span>
                  {story.tags.pairings.map((p) => (
                    <span key={p} className="rounded-md border border-pink-500/30 bg-pink-500/10 px-2 py-0.5 text-xs font-bold text-pink-300">
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {story.tags.characters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Characters:</span>
                  {story.tags.characters.map((c) => (
                    <span key={c} className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-200">
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {story.tags.general.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-400 mr-1">Tags:</span>
                  {story.tags.general.map((g) => (
                    <span key={g} className="rounded-md border border-white/10 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-300">
                      #{g}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Table of Contents / Chapter Index Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#F97316]">Table of Contents</span>
              <h2 className="text-2xl font-black text-white mt-1">All Chapters ({story.chapters.length})</h2>
            </div>

            <button
              type="button"
              onClick={() => setSortAscending(!sortAscending)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white border border-white/10 bg-slate-900/60 px-3 py-1.5 rounded-lg transition-all"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {sortAscending ? "First to Last (1 → N)" : "Latest First (N → 1)"}
            </button>
          </div>

          <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-slate-900/50 overflow-hidden shadow-xl">
            {sortedChapters.map((ch) => (
              <div
                key={ch.number}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-white/10 text-xs font-black text-slate-300">
                    {ch.number}
                  </span>
                  <div>
                    <Link
                      href={`/story/${story.slug}/${ch.slug}`}
                      className="text-sm sm:text-base font-bold text-white hover:text-[#F97316] transition-colors"
                    >
                      {ch.title}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span>{ch.wordCount.toLocaleString()} words</span>
                      <span>•</span>
                      <span>Published {ch.publishedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {ch.isFastPass ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-black text-amber-300">
                        <Lock className="h-3 w-3" /> Fast Pass · {ch.fastPassPriceSparks} Sparks
                      </span>
                      <span className="hidden md:inline text-[11px] text-slate-400">
                        {ch.fastPassUnlockAt}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2.5 py-0.5">
                      Free Chapter
                    </span>
                  )}

                  <Link
                    href={`/story/${story.slug}/${ch.slug}`}
                    className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-[#6D5DFB] hover:border-[#6D5DFB] hover:text-white transition-all"
                  >
                    Read
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Sparks Tipping Modal */}
      {tipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <Zap className="h-5 w-5 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Tip Sparks to Author</h3>
                  <p className="text-xs text-slate-400">Support @{story.author.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTipModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {tipSuccess ? (
              <div className="py-8 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h4 className="text-lg font-black text-white">Sparks Sent!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  You tipped {tipAmount} Sparks to {story.author.name}. Thank you for supporting this creator!
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <p className="text-xs text-slate-300">
                  Select a Sparks tip amount. Tips go directly to the creator to support their writing.
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 100, 250].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTipAmount(amt)}
                      className={`rounded-xl border py-2.5 text-center text-xs font-black transition-all ${
                        tipAmount === amt
                          ? "border-amber-400 bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/10"
                          : "border-white/10 bg-slate-800/80 text-slate-300 hover:text-white"
                      }`}
                    >
                      ⚡ {amt}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSendTip}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition-all"
                  >
                    Confirm Tip ({tipAmount} Sparks)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}


export default function StoryDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050B16] flex items-center justify-center text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      }
    >
      <StoryDetailsContent />
    </Suspense>
  );
}
