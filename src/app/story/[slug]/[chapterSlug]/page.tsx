"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { getStoryBySlug, deleteChapter } from "@/lib/storyStore";
import { isStoryBookmarked, toggleStoryBookmark } from "@/lib/bookmarkStore";
import { getCurrentUser, UserSession, canManageChapter } from "@/lib/authStore";
import { StoryData, ChapterData } from "@/data/mockStories";
import {
  Settings,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  Heart,
  MessageSquare,
  Lock,
  Zap,
  Sparkles,
  ArrowLeft,
  Check,
  Eye,
  Trash2,
} from "lucide-react";

function ChapterReaderContent() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const chapterSlug = params?.chapterSlug as string;

  const [story, setStory] = useState<StoryData | undefined>(undefined);
  const [chapter, setChapter] = useState<ChapterData | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  useEffect(() => {
    const updateAuth = () => {
      setCurrentUser(getCurrentUser());
    };
    updateAuth();
    window.addEventListener("ficforge_auth_changed", updateAuth);
    window.addEventListener("storage", updateAuth);
    return () => {
      window.removeEventListener("ficforge_auth_changed", updateAuth);
      window.removeEventListener("storage", updateAuth);
    };
  }, []);

  const isAuthor = canManageChapter(
    currentUser,
    story?.author?.username,
    story?.author?.name
  );

  const handleDeleteThisChapter = () => {
    if (!story || !chapter) return;
    if (!isAuthor) {
      alert("Unauthorized: You must be signed in as the author or an administrator to delete this chapter.");
      return;
    }
    if (window.confirm(`Permanently delete Chapter ${chapter.number}: "${chapter.title}"? This cannot be undone.`)) {
      deleteChapter(story.slug, chapter.slug);
      router.push(`/story/${story.slug}`);
    }
  };

  useEffect(() => {
    if (slug) {
      const foundStory = getStoryBySlug(slug);
      setStory(foundStory);
      setIsBookmarked(isStoryBookmarked(slug));
      if (foundStory && chapterSlug) {
        const foundCh = foundStory.chapters.find((ch) => ch.slug === chapterSlug);
        setChapter(foundCh);
      }
    }

    const handleBookmarksChange = () => {
      if (slug) setIsBookmarked(isStoryBookmarked(slug));
    };

    window.addEventListener("ficforge_bookmarks_updated", handleBookmarksChange);
    return () => window.removeEventListener("ficforge_bookmarks_updated", handleBookmarksChange);
  }, [slug, chapterSlug]);

  // Reader Preferences States
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<"serif" | "sans" | "mono">("serif");
  const [lineHeight, setLineHeight] = useState<number>(1.85);
  const [theme, setTheme] = useState<"dark" | "sepia" | "light">("dark");
  const [readerWidth, setReaderWidth] = useState<"narrow" | "normal" | "wide">("normal");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Engagement States
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reactions, setReactions] = useState<{ [key: string]: number }>({
    "🔥": 42,
    "❤️": 28,
    "😭": 12,
    "🤯": 19,
    "👏": 35,
  });
  const [userReaction, setUserReaction] = useState<string | null>(null);

  // Fast Pass Unlock State (for demo/testing)
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userSparks, setUserSparks] = useState(150);

  // Comments State
  const [commentText, setCommentText] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [commentsList, setCommentsList] = useState([
    {
      id: "c1",
      user: "LyraReader",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
      content: "The imagery of the Ember Spire was chilling! Vael's introduction gave me goosebumps.",
      createdAt: "2 hours ago",
      isSpoiler: false,
    },
    {
      id: "c2",
      user: "ShadowScribe",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80",
      content: "Wait, so the Grand Archive was already destroyed? That means the seventh vault is their only hope!",
      createdAt: "5 hours ago",
      isSpoiler: true,
    },
  ]);

  if (!story || !chapter) {
    return (
      <div className="min-h-screen bg-[#050B16] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black mb-3">Chapter Not Found</h1>
        <p className="text-slate-400 mb-6">This chapter does not exist or has not been published yet.</p>
        <Link
          href={`/story/${slug}`}
          className="rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-6 py-3 text-sm font-black text-white"
        >
          Return to Story
        </Link>
      </div>
    );
  }

  const currentIdx = story.chapters.findIndex((c) => c.slug === chapterSlug);
  const prevChapter = currentIdx > 0 ? story.chapters[currentIdx - 1] : null;
  const nextChapter = currentIdx < story.chapters.length - 1 ? story.chapters[currentIdx + 1] : null;

  const handleReactionClick = (emoji: string) => {
    if (userReaction === emoji) {
      setReactions((prev) => ({ ...prev, [emoji]: prev[emoji] - 1 }));
      setUserReaction(null);
    } else {
      setReactions((prev) => ({
        ...prev,
        [emoji]: prev[emoji] + 1,
        ...(userReaction ? { [userReaction]: prev[userReaction] - 1 } : {}),
      }));
      setUserReaction(emoji);
    }
  };

  const handleUnlockFastPass = () => {
    if (userSparks >= (chapter.fastPassPriceSparks ?? 50)) {
      setUserSparks((prev) => prev - (chapter.fastPassPriceSparks ?? 50));
      setIsUnlocked(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentsList((prev) => [
      {
        id: "c-" + Date.now(),
        user: "You",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
        content: commentText.trim(),
        createdAt: "Just now",
        isSpoiler: isSpoiler,
      },
      ...prev,
    ]);
    setCommentText("");
    setIsSpoiler(false);
  };

  // Theme styling constants
  const themeStyles = {
    dark: "bg-[#050B16] text-[#CBD5E1]",
    sepia: "bg-[#FBF0D9] text-[#3D2E1E]",
    light: "bg-[#FFFFFF] text-[#1E293B]",
  };

  const cardStyles = {
    dark: "bg-slate-900/60 border-white/10 text-slate-300",
    sepia: "bg-[#F4E4C1] border-[#E2CE9F] text-[#4F3E29]",
    light: "bg-slate-50 border-slate-200 text-slate-700",
  };

  const widthStyles = {
    narrow: "max-w-2xl",
    normal: "max-w-3xl",
    wide: "max-w-4xl",
  };

  const fontFamilies = {
    serif: "font-serif",
    sans: "font-sans",
    mono: "font-mono",
  };

  const isLocked = chapter.isFastPass && !isUnlocked;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${themeStyles[theme]}`}>
      
      {/* Sticky Reader Navigation Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 py-3 transition-colors ${
        theme === "dark"
          ? "border-white/10 bg-[#050B16]/90 text-white"
          : theme === "sepia"
          ? "border-[#E2CE9F] bg-[#FBF0D9]/90 text-[#3D2E1E]"
          : "border-slate-200 bg-white/90 text-slate-900"
      }`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          
          {/* Back to Story */}
          <Link
            href={`/story/${story.slug}`}
            className="flex items-center gap-1.5 text-xs font-bold hover:text-[#F97316] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline truncate max-w-xs">{story.title}</span>
          </Link>

          {/* Chapter Title in Header */}
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-wider block opacity-75">
              Chapter {chapter.number}
            </span>
            <span className="text-sm font-bold truncate max-w-xs block">
              {chapter.title}
            </span>
          </div>

          {/* Reader Preferences Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (slug) {
                  const next = toggleStoryBookmark(slug);
                  setIsBookmarked(next);
                }
              }}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isBookmarked ? "text-[#F97316]" : "opacity-75 hover:opacity-100"
              }`}
              title={isBookmarked ? "Story Saved in Library" : "Bookmark Story to Library"}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-[#F97316]" : ""}`} />
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all border-current/20 hover:border-current/40"
              title="Reader Settings"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Aa</span>
            </button>

            {/* Author Only: Delete Chapter button */}
            {isAuthor && (
              <button
                type="button"
                onClick={handleDeleteThisChapter}
                className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                title="Delete this chapter (Author Only)"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Reader Preferences Drawer Modal */}
        {settingsOpen && (
          <div className={`mt-3 pt-4 pb-2 border-t text-xs space-y-4 max-w-5xl mx-auto ${
            theme === "dark" ? "border-white/10" : theme === "sepia" ? "border-[#E2CE9F]" : "border-slate-200"
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              
              {/* Theme Selector */}
              <div>
                <span className="font-bold uppercase tracking-wider block mb-1.5 opacity-70">Theme</span>
                <div className="flex rounded-lg border border-current/20 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex-1 py-1.5 rounded text-center font-bold ${
                      theme === "dark" ? "bg-[#6D5DFB] text-white" : "opacity-75"
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("sepia")}
                    className={`flex-1 py-1.5 rounded text-center font-bold ${
                      theme === "sepia" ? "bg-[#433422] text-[#FBF0D9]" : "opacity-75"
                    }`}
                  >
                    Sepia
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex-1 py-1.5 rounded text-center font-bold ${
                      theme === "light" ? "bg-slate-900 text-white" : "opacity-75"
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <span className="font-bold uppercase tracking-wider block mb-1.5 opacity-70">Font</span>
                <div className="flex rounded-lg border border-current/20 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setFontFamily("serif")}
                    className={`flex-1 py-1.5 rounded text-center font-serif font-bold ${
                      fontFamily === "serif" ? "bg-[#6D5DFB] text-white" : "opacity-75"
                    }`}
                  >
                    Serif
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontFamily("sans")}
                    className={`flex-1 py-1.5 rounded text-center font-sans font-bold ${
                      fontFamily === "sans" ? "bg-[#6D5DFB] text-white" : "opacity-75"
                    }`}
                  >
                    Sans
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontFamily("mono")}
                    className={`flex-1 py-1.5 rounded text-center font-mono font-bold ${
                      fontFamily === "mono" ? "bg-[#6D5DFB] text-white" : "opacity-75"
                    }`}
                  >
                    Mono
                  </button>
                </div>
              </div>

              {/* Font Size Slider */}
              <div>
                <span className="font-bold uppercase tracking-wider block mb-1.5 opacity-70">
                  Size: {fontSize}px
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFontSize((prev) => Math.max(14, prev - 1))}
                    className="h-8 w-8 rounded border border-current/20 font-bold"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="14"
                    max="26"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-[#6D5DFB]"
                  />
                  <button
                    type="button"
                    onClick={() => setFontSize((prev) => Math.min(26, prev + 1))}
                    className="h-8 w-8 rounded border border-current/20 font-bold"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Reading Width */}
              <div>
                <span className="font-bold uppercase tracking-wider block mb-1.5 opacity-70">Margin Width</span>
                <div className="flex rounded-lg border border-current/20 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setReaderWidth("narrow")}
                    className={`flex-1 py-1.5 rounded text-center font-bold ${
                      readerWidth === "narrow" ? "bg-[#6D5DFB] text-white" : "opacity-75"
                    }`}
                  >
                    Narrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setReaderWidth("normal")}
                    className={`flex-1 py-1.5 rounded text-center font-bold ${
                      readerWidth === "normal" ? "bg-[#6D5DFB] text-white" : "opacity-75"
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setReaderWidth("wide")}
                    className={`flex-1 py-1.5 rounded text-center font-bold ${
                      readerWidth === "wide" ? "bg-[#6D5DFB] text-white" : "opacity-75"
                    }`}
                  >
                    Wide
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </header>

      {/* Main Chapter Sanctuary Body (Distraction Free, ZERO in-text ads) */}
      <main className={`mx-auto px-4 sm:px-6 py-12 ${widthStyles[readerWidth]}`}>
        
        {/* Chapter Title Heading */}
        <div className="mb-10 text-center">
          <span className="text-xs font-black uppercase tracking-widest text-[#F97316]">
            Chapter {chapter.number}
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">
            {chapter.title}
          </h1>
          <div className="mt-3 flex items-center justify-center gap-3 text-xs opacity-70">
            <span>{chapter.wordCount.toLocaleString()} words</span>
            <span>•</span>
            <span>By {story.author.name}</span>
          </div>
        </div>

        {/* Top Author Note */}
        {chapter.topAuthorNote && (
          <div className={`mb-10 rounded-2xl border p-5 ${cardStyles[theme]}`}>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#F97316]">
              <Sparkles className="h-4 w-4" />
              <span>Author's Note</span>
            </div>
            <p className="text-sm leading-relaxed italic">{chapter.topAuthorNote}</p>
          </div>
        )}

        {/* Fast Pass Paywall Barrier (If chapter is locked) */}
        {isLocked ? (
          <div className={`rounded-2xl border p-8 sm:p-12 text-center my-10 ${cardStyles[theme]}`}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 mb-4">
              <Lock className="h-7 w-7" />
            </div>

            <h2 className="text-2xl font-black mb-2">Fast Pass Early Access</h2>
            <p className="text-sm max-w-md mx-auto mb-4 opacity-80">
              This chapter is an advance release for readers who want to read ahead of the schedule.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-400 mb-6">
              ⏰ {chapter.fastPassUnlockAt}
            </div>

            <div className="max-w-xs mx-auto space-y-3">
              <button
                type="button"
                onClick={handleUnlockFastPass}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 px-6 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                <Zap className="h-4 w-4 fill-slate-950" />
                Unlock for {chapter.fastPassPriceSparks} Sparks
              </button>

              <div className="text-xs opacity-70">
                Your Balance: <strong className="text-amber-400">{userSparks} Sparks</strong>
              </div>
            </div>
          </div>
        ) : (
          /* Chapter Reading Content */
          <article
            className={`${fontFamilies[fontFamily]} space-y-6 transition-all`}
            style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
          >
            {chapter.content.map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </article>
        )}

        {/* Bottom Author Note */}
        {chapter.bottomAuthorNote && !isLocked && (
          <div className={`mt-14 rounded-2xl border p-5 ${cardStyles[theme]}`}>
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#6D5DFB]">
              <Sparkles className="h-4 w-4" />
              <span>End of Chapter Note</span>
            </div>
            <p className="text-sm leading-relaxed italic">{chapter.bottomAuthorNote}</p>
          </div>
        )}

        {/* Chapter Reactions Bar */}
        {!isLocked && (
          <div className="my-12 text-center">
            <span className="text-xs font-bold uppercase tracking-wider opacity-60 block mb-3">
              React to this Chapter
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Object.entries(reactions).map(([emoji, count]) => {
                const isSelected = userReaction === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleReactionClick(emoji)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-bold transition-all ${
                      isSelected
                        ? "border-[#F97316] bg-orange-500/20 text-[#F97316] scale-105"
                        : "border-current/15 bg-current/5 hover:border-current/30"
                    }`}
                  >
                    <span>{emoji}</span>
                    <span className="text-xs">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chapter Bottom Navigation */}
        <div className={`flex items-center justify-between gap-4 py-8 border-t border-b my-12 ${
          theme === "dark" ? "border-white/10" : theme === "sepia" ? "border-[#E2CE9F]" : "border-slate-200"
        }`}>
          {prevChapter ? (
            <Link
              href={`/story/${story.slug}/${prevChapter.slug}`}
              className="flex items-center gap-2 rounded-xl border border-current/20 px-4 py-2.5 text-xs font-bold hover:border-current/40 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Chapter</span>
            </Link>
          ) : (
            <div className="opacity-30 text-xs font-bold px-4 py-2.5 flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" /> First Chapter
            </div>
          )}

          <Link
            href={`/story/${story.slug}`}
            className="text-xs font-black uppercase tracking-wider text-[#F97316] hover:underline"
          >
            All Chapters ({story.chapters.length})
          </Link>

          {nextChapter ? (
            <Link
              href={`/story/${story.slug}/${nextChapter.slug}`}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-4 py-2.5 text-xs font-black text-white shadow-md hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all"
            >
              <span>Next Chapter</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="opacity-30 text-xs font-bold px-4 py-2.5 flex items-center gap-2">
              Latest Chapter <ChevronRight className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Chapter Comments Section */}
        <section className="mt-14">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-5 w-5 text-[#6D5DFB]" />
            <h3 className="text-xl font-black">Chapter Discussion ({commentsList.length})</h3>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className={`rounded-2xl border p-4 mb-8 ${cardStyles[theme]}`}>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Leave a comment on this chapter... (keep it constructive)"
              className="w-full bg-transparent border-none text-sm outline-none resize-none placeholder-current/40"
            />
            <div className="flex items-center justify-between pt-3 border-t border-current/10 mt-2">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSpoiler}
                  onChange={(e) => setIsSpoiler(e.target.checked)}
                  className="rounded accent-[#F97316]"
                />
                <span>Contains spoilers</span>
              </label>

              <button
                type="submit"
                className="rounded-lg bg-[#6D5DFB] hover:bg-[#5B4BE0] px-4 py-2 text-xs font-black text-white shadow-md transition-all"
              >
                Post Comment
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {commentsList.map((c) => (
              <div key={c.id} className={`rounded-xl border p-4 ${cardStyles[theme]}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <img src={c.avatar} alt={c.user} className="h-7 w-7 rounded-full object-cover" />
                    <span className="text-xs font-bold">{c.user}</span>
                    {c.isSpoiler && (
                      <span className="rounded bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        Spoiler
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] opacity-60">{c.createdAt}</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}


export default function ChapterReaderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050B16] flex items-center justify-center text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      }
    >
      <ChapterReaderContent />
    </Suspense>
  );
}
