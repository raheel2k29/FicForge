"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useMemo } from "react";
import { getAllStories, saveChapter, deleteChapter, syncStoriesWithServer } from "@/lib/storyStore";
import { StoryData, ChapterData } from "@/data/mockStories";
import WriterAuthGate from "@/components/WriterAuthGate";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  Eye,
  FileText,
  Save,
  Send,
  HelpCircle,
  Trash2,
} from "lucide-react";

function ChapterEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storySlugParam = searchParams.get("storySlug") || searchParams.get("storyId");

  const [stories, setStories] = useState<StoryData[]>([]);
  const [selectedStorySlug, setSelectedStorySlug] = useState<string>("");

  // Chapter Form States
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterBody, setChapterBody] = useState("");
  const [topNote, setTopNote] = useState("");
  const [bottomNote, setBottomNote] = useState("");
  const [isFastPass, setIsFastPass] = useState(false);
  const [fastPassPrice, setFastPassPrice] = useState(50);
  const [lastSaved, setLastSaved] = useState<string>("Unsaved draft");
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const all = getAllStories();
    const list = Object.values(all);
    setStories(list);

    if (storySlugParam && all[storySlugParam]) {
      setSelectedStorySlug(storySlugParam);
    } else if (list.length > 0) {
      setSelectedStorySlug(list[0].slug);
    }

    syncStoriesWithServer().then((serverStories) => {
      if (serverStories) {
        const updatedList = Object.values(serverStories);
        setStories(updatedList);
        if (!selectedStorySlug && updatedList.length > 0) {
          setSelectedStorySlug(updatedList[0].slug);
        }
      }
    });
  }, [storySlugParam, selectedStorySlug]);

  const handleDeleteExistingChapter = (chapterSlug: string, chapterTitle: string) => {
    if (!selectedStory) return;
    if (window.confirm(`Delete chapter "${chapterTitle}"? This cannot be undone.`)) {
      deleteChapter(selectedStory.slug, chapterSlug);
      const all = getAllStories();
      setStories(Object.values(all));
    }
  };

  const selectedStory = useMemo(() => {
    return stories.find((s) => s.slug === selectedStorySlug);
  }, [stories, selectedStorySlug]);

  const nextChapterNumber = useMemo(() => {
    if (!selectedStory) return 1;
    return selectedStory.chapters.length + 1;
  }, [selectedStory]);

  // Live Word Counter
  const wordCount = useMemo(() => {
    return chapterBody.split(/\s+/).filter(Boolean).length;
  }, [chapterBody]);

  // Estimated Reading Time (~250 words per minute)
  const readingTimeMin = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 250));
  }, [wordCount]);

  // Simulated Autosave every 5 seconds
  useEffect(() => {
    if (!chapterBody.trim() && !chapterTitle.trim()) return;

    const timer = setTimeout(() => {
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setLastSaved(`Autosaved at ${now}`);
    }, 2000);

    return () => clearTimeout(timer);
  }, [chapterTitle, chapterBody, topNote, bottomNote]);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim() || !chapterBody.trim() || !selectedStorySlug) return;

    setIsPublishing(true);

    const paragraphs = chapterBody
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean);

    const newChapter: ChapterData = {
      number: nextChapterNumber,
      slug: `chapter-${nextChapterNumber}`,
      title: chapterTitle.trim(),
      wordCount,
      publishedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      topAuthorNote: topNote.trim() || undefined,
      bottomAuthorNote: bottomNote.trim() || undefined,
      isFastPass: selectedStory?.classification === "ORIGINAL" && isFastPass,
      fastPassPriceSparks: isFastPass ? fastPassPrice : undefined,
      fastPassUnlockAt: isFastPass ? "Auto-unlocks in 7 days" : undefined,
      content: paragraphs.length > 0 ? paragraphs : [chapterBody],
    };

    saveChapter(selectedStorySlug, newChapter);
    router.push(`/story/${selectedStorySlug}/${newChapter.slug}`);
  };

  return (
    <div className="min-h-screen bg-[#050B16] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1040px] mx-auto space-y-6">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            href="/my-stories"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Exit Editor
          </Link>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-mono">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              {lastSaved}
            </span>
            <span className="text-amber-400 font-mono font-bold">
              {wordCount.toLocaleString()} words ({readingTimeMin} min read)
            </span>
          </div>
        </div>

        {/* Editor Form */}
        <form onSubmit={handlePublish} className="space-y-6">
          
          {/* Target Story & Chapter Header */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Publishing To:
              </label>
              <select
                value={selectedStorySlug}
                onChange={(e) => setSelectedStorySlug(e.target.value)}
                className="mt-1 h-10 rounded-xl border border-white/15 bg-[#020617] px-3 text-sm font-bold text-white outline-none focus:border-[#6D5DFB]"
              >
                {stories.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.title} ({s.classification === "FANFICTION" ? "Fanfiction" : "Original"})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Chapter Index
              </span>
              <span className="text-lg font-black text-[#F97316]">
                Chapter #{nextChapterNumber}
              </span>
            </div>
          </div>

          {/* Chapter Title Input */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
              Chapter Title <span className="text-[#F97316]">*</span>
            </label>
            <input
              type="text"
              required
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="e.g. The Whispering Forest, Shadow of the Spire..."
              className="w-full h-12 rounded-xl border border-white/10 bg-[#020617] px-4 text-base font-bold text-white placeholder-slate-500 outline-none focus:border-[#6D5DFB]"
            />
          </div>

          {/* Top Author Note (Optional) */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
              Top Author Note (Shown to readers before chapter text)
            </label>
            <p className="text-xs text-slate-400 mb-2">
              Share updates, schedules, or content context with your readers.
            </p>
            <textarea
              rows={2}
              value={topNote}
              onChange={(e) => setTopNote(e.target.value)}
              placeholder="e.g. Welcome back everyone! Hope you enjoy this week's chapter..."
              className="w-full rounded-xl border border-white/10 bg-[#020617] p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#6D5DFB]"
            />
          </div>

          {/* Main Chapter Content Editor */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Chapter Text <span className="text-[#F97316]">*</span>
              </label>
              <span className="text-xs text-slate-400">
                Tip: Use double enter (blank line) between paragraphs.
              </span>
            </div>
            <textarea
              rows={16}
              required
              value={chapterBody}
              onChange={(e) => setChapterBody(e.target.value)}
              placeholder="Begin writing your chapter here...&#10;&#10;As the torches flickered against the ancient stone wall, silence fell over the chamber..."
              className="w-full rounded-xl border border-white/10 bg-[#020617] p-5 text-sm font-serif leading-relaxed text-slate-200 placeholder-slate-600 outline-none focus:border-[#6D5DFB]"
            />
          </div>

          {/* Bottom Author Note (Optional) */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1">
              Bottom Author Note (Shown after chapter text)
            </label>
            <p className="text-xs text-slate-400 mb-2">
              Ask readers questions, invite comments, or thank supporters.
            </p>
            <textarea
              rows={2}
              value={bottomNote}
              onChange={(e) => setBottomNote(e.target.value)}
              placeholder="e.g. What did you think of the cliffhanger? Leave a comment below!"
              className="w-full rounded-xl border border-white/10 bg-[#020617] p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#6D5DFB]"
            />
          </div>

          {/* Monetization / Fast Pass Rules (Original Fiction Only) */}
          {selectedStory?.classification === "ORIGINAL" && selectedStory.rating !== "EXPLICIT" ? (
            <div className="rounded-2xl border border-orange-500/30 bg-orange-950/20 p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/20 text-[#F97316] shrink-0">
                    ⚡
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      Fast Pass Early Access (Original Webnovel)
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Allow readers to unlock this upcoming chapter early using Sparks before it automatically unlocks for free.
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
                  <input
                    type="checkbox"
                    checked={isFastPass}
                    onChange={(e) => setIsFastPass(e.target.checked)}
                    className="rounded border-white/20 bg-slate-900 text-[#F97316] h-4 w-4"
                  />
                  <span>Lock with Fast Pass</span>
                </label>
              </div>

              {isFastPass && (
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs">
                  <div>
                    <span className="block text-slate-400 font-bold mb-1">Sparks Price</span>
                    <select
                      value={fastPassPrice}
                      onChange={(e) => setFastPassPrice(Number(e.target.value))}
                      className="h-9 rounded-lg border border-white/15 bg-[#020617] px-3 text-white font-bold outline-none"
                    >
                      <option value={25}>25 Sparks</option>
                      <option value={50}>50 Sparks (Recommended)</option>
                      <option value={100}>100 Sparks</option>
                    </select>
                  </div>

                  <div>
                    <span className="block text-slate-400 font-bold mb-1">Free Auto-Unlock Timer</span>
                    <span className="inline-block py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-mono">
                      7 Days (168 Hours)
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/15 p-4 text-xs text-slate-300 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>
                <strong>100% Free Fanfiction Guarantee:</strong> All fanfiction chapters are strictly free to read with zero paywalls.
              </span>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <Link
              href="/my-stories"
              className="text-xs font-bold text-slate-400 hover:text-white"
            >
              Cancel and Discard
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-none h-12 px-8 rounded-xl bg-gradient-to-r from-[#6D5DFB] via-[#7C3AED] to-[#F97316] text-sm font-black text-white shadow-xl shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                Publish Chapter {nextChapterNumber} Now
              </button>
            </div>
          </div>

        </form>

        {/* Existing Chapters Management */}
        {selectedStory && selectedStory.chapters && selectedStory.chapters.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-black text-white">
                  Published Chapters in &ldquo;{selectedStory.title}&rdquo; ({selectedStory.chapters.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review or permanently delete existing chapters from this story.
                </p>
              </div>
              <Link
                href={`/story/${selectedStory.slug}`}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View Story Page →
              </Link>
            </div>

            <div className="divide-y divide-white/5">
              {selectedStory.chapters.map((ch) => (
                <div
                  key={ch.slug}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-white/10 text-xs font-black text-slate-300">
                      {ch.number}
                    </span>
                    <div className="truncate">
                      <span className="text-sm font-bold text-white truncate block">{ch.title}</span>
                      <span className="text-xs text-slate-400">
                        {ch.wordCount.toLocaleString()} words · Published {ch.publishedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/story/${selectedStory.slug}/${ch.slug}`}
                      className="text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Read
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingChapter(ch.slug, ch.title)}
                      className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      title={`Delete chapter "${ch.title}"`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ChapterEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050B16] flex items-center justify-center text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      }
    >
      <WriterAuthGate
        title="Chapter Editor Access"
        description="Sign in to your creator account to write new chapters, edit autosaved drafts, or set Fast Pass early access."
      >
        <ChapterEditorContent />
      </WriterAuthGate>
    </Suspense>
  );
}
