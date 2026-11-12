"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useMemo } from "react";
import { getAllStories, bulkSaveChapters } from "@/lib/storyStore";
import { StoryData, ChapterData } from "@/data/mockStories";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Layers,
  Clock,
  Eye,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface ImportedChapterItem {
  id: string;
  title: string;
  content: string[];
  wordCount: number;
  topAuthorNote?: string;
  bottomAuthorNote?: string;
  isFastPass?: boolean;
}

function BulkImportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storySlugParam = searchParams.get("storySlug") || searchParams.get("storyId");

  const [stories, setStories] = useState<StoryData[]>([]);
  const [selectedStorySlug, setSelectedStorySlug] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"SPLITTER" | "MULTI_FILE">("SPLITTER");
  const [manuscriptText, setManuscriptText] = useState("");
  const [detectedChapters, setDetectedChapters] = useState<ImportedChapterItem[]>([]);
  const [previewChapter, setPreviewChapter] = useState<ImportedChapterItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enableScheduling, setEnableScheduling] = useState(false);
  const [scheduleIntervalDays, setScheduleIntervalDays] = useState(2); // every 2 days

  useEffect(() => {
    const all = getAllStories();
    const list = Object.values(all);
    setStories(list);

    if (storySlugParam && all[storySlugParam]) {
      setSelectedStorySlug(storySlugParam);
    } else if (list.length > 0) {
      setSelectedStorySlug(list[0].slug);
    }
  }, [storySlugParam]);

  const selectedStory = useMemo(() => {
    return stories.find((s) => s.slug === selectedStorySlug);
  }, [stories, selectedStorySlug]);

  // Demo 25-Chapter Sample Generator for effortless client testing!
  const load25ChapterSample = () => {
    let sample = "";
    for (let i = 1; i <= 25; i++) {
      sample += `Chapter ${i}: The Chronicles of the Forge - Part ${i}\n\n`;
      sample += `The ancient bells of the Citadel rang across the frosty valleys as dawn broke over the horizon. Chapter ${i} marks a pivotal turning point in the journey through uncharted realms.\n\n`;
      sample += `Courage was not the absence of fear, but the mastery of it. With each passing milestone, the party forged stronger bonds, unraveling the hidden secrets left behind by the founders of the realm.\n\n`;
      sample += `***\n\n`;
    }
    setManuscriptText(sample);
    parseManuscript(sample);
  };

  // Smart Chapter Auto-Splitter Regex Engine
  const parseManuscript = (textToParse: string) => {
    if (!textToParse.trim()) {
      setDetectedChapters([]);
      return;
    }

    // Split on Chapter delimiters: e.g. "Chapter 1", "CHAPTER 1", "Ch. 1", "Act I", "Prologue", etc.
    const delimiterRegex = /(?:^|\n)(?=(?:Chapter|CHAPTER|Ch\.|Act|ACT|Prologue|Epilogue)\s*[\dIVXLCDM]*[:\.\s\-]?)/gi;
    const rawBlocks = textToParse.split(delimiterRegex).filter((b) => b.trim().length > 0);

    const parsed: ImportedChapterItem[] = rawBlocks.map((block, idx) => {
      const lines = block
        .trim()
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const firstLine = lines[0] || `Chapter ${idx + 1}`;
      const chapterContent = lines.slice(1);
      const fullText = chapterContent.join(" ");
      const words = fullText.split(/\s+/).filter(Boolean).length;

      return {
        id: `import-${idx + 1}-${Date.now()}`,
        title: firstLine.length > 80 ? firstLine.substring(0, 80) : firstLine,
        content: chapterContent.length > 0 ? chapterContent : [firstLine],
        wordCount: Math.max(words, 15),
      };
    });

    setDetectedChapters(parsed);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setManuscriptText(val);
    parseManuscript(val);
  };

  // Multi-file batch upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const readers: Promise<ImportedChapterItem>[] = Array.from(files).map((file, idx) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = (event.target?.result as string) || "";
          const lines = text
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);
          const words = text.split(/\s+/).filter(Boolean).length;
          const fileNameClean = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

          resolve({
            id: `file-${idx}-${Date.now()}`,
            title: fileNameClean,
            content: lines.length > 0 ? lines : [text],
            wordCount: words,
          });
        };
        reader.readAsText(file);
      });
    });

    Promise.all(readers).then((results) => {
      setDetectedChapters(results);
      setIsProcessing(false);
    });
  };

  // Reordering & Editing Actions
  const updateChapterTitle = (id: string, newTitle: string) => {
    setDetectedChapters((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, title: newTitle } : ch))
    );
  };

  const moveChapter = (index: number, direction: "UP" | "DOWN") => {
    if (
      (direction === "UP" && index === 0) ||
      (direction === "DOWN" && index === detectedChapters.length - 1)
    ) {
      return;
    }

    const newArr = [...detectedChapters];
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setDetectedChapters(newArr);
  };

  const removeChapter = (id: string) => {
    setDetectedChapters((prev) => prev.filter((ch) => ch.id !== id));
  };

  const reindexTitles = () => {
    setDetectedChapters((prev) =>
      prev.map((ch, idx) => ({
        ...ch,
        title: `Chapter ${idx + 1}: ${ch.title.replace(/^Chapter\s*\d+[:\s\-]*/i, "")}`,
      }))
    );
  };

  // Commit and Atomic Publish
  const handlePublishBatch = () => {
    if (!selectedStorySlug || detectedChapters.length === 0) return;

    const chaptersToSave: ChapterData[] = detectedChapters.map((ch, idx) => {
      return {
        number: idx + 1,
        slug: `chapter-${idx + 1}`,
        title: ch.title,
        wordCount: ch.wordCount,
        publishedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        content: ch.content,
      };
    });

    const success = bulkSaveChapters(selectedStorySlug, chaptersToSave);
    if (success) {
      router.push(`/story/${selectedStorySlug}`);
    }
  };

  const totalBatchWords = detectedChapters.reduce((acc, c) => acc + c.wordCount, 0);

  return (
    <div className="min-h-screen bg-[#050B16] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] mx-auto space-y-8">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/my-stories"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Workshop
          </Link>

          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Free Creator Capability
          </span>
        </div>

        {/* Header */}
        <div className="border-b border-white/10 pb-6">
          <span className="text-xs font-black tracking-widest uppercase text-[#F97316]">
            BULK MANUSCRIPT IMPORTER
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
            Batch Import & Auto-Splitter
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
            Upload or paste full manuscripts (up to 25, 50+ chapters). FicForge detects chapter boundaries and commits each chapter atomically without merging.
          </p>
        </div>

        {/* Target Story Selection */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              Select Target Story
            </label>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose the story you want to publish these chapters into.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedStorySlug}
              onChange={(e) => setSelectedStorySlug(e.target.value)}
              className="h-11 rounded-xl border border-white/15 bg-[#020617] px-4 text-sm font-bold text-white outline-none focus:border-[#6D5DFB]"
            >
              {stories.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title} ({s.classification === "FANFICTION" ? "Fanfiction" : "Original"})
                </option>
              ))}
            </select>

            <Link
              href="/write/new"
              className="h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all shrink-0"
            >
              + New Story
            </Link>
          </div>
        </div>

        {/* Input Modes: Splitter vs Multi-File */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("SPLITTER")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === "SPLITTER"
                    ? "bg-[#6D5DFB] text-white shadow-md shadow-indigo-600/30"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Manuscript Auto-Splitter
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("MULTI_FILE")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === "MULTI_FILE"
                    ? "bg-[#6D5DFB] text-white shadow-md shadow-indigo-600/30"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Batch File Upload (.docx / .txt / .md)
              </button>
            </div>

            {/* Quick 25-Chapter Sample Loader for Instant Testing */}
            <button
              type="button"
              onClick={load25ChapterSample}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" /> Load 25-Chapter Test Batch
            </button>
          </div>

          {activeTab === "SPLITTER" ? (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                Paste Entire Manuscript Text
              </label>
              <p className="text-xs text-slate-400 mb-3">
                Paste your manuscript below. The engine will instantly split chapters on headings like <em>Chapter 1</em>, <em>Chapter 2</em>, <em>Act I</em>, etc.
              </p>
              <textarea
                rows={10}
                value={manuscriptText}
                onChange={handleTextChange}
                placeholder="Chapter 1: The Beginning...&#10;&#10;Your story begins here...&#10;&#10;***&#10;&#10;Chapter 2: The Journey Continues...&#10;&#10;The next chapter starts..."
                className="w-full rounded-2xl border border-white/10 bg-[#020617] p-4 text-xs font-mono text-slate-200 placeholder-slate-600 outline-none focus:border-[#6D5DFB] leading-relaxed"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-white/15 rounded-2xl p-10 text-center bg-[#020617]/50">
              <UploadCloud className="mx-auto h-12 w-12 text-[#6D5DFB] mb-3" />
              <h3 className="text-base font-bold text-white">Upload Multiple Chapter Files</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Select 5, 10, 25, or 50+ individual `.txt`, `.md`, or manuscript files from your computer.
              </p>
              <label className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-5 py-2.5 text-xs font-extrabold text-white cursor-pointer shadow-lg shadow-indigo-600/30 hover:opacity-95">
                Browse Files
                <input
                  type="file"
                  multiple
                  accept=".txt,.md,.text"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

        </div>

        {/* Pre-Publish Review Table */}
        {detectedChapters.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl space-y-6">
            
            {/* Table Header Summary & Batch Tools */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  READY TO IMPORT
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {detectedChapters.length} Chapters Detected ({totalBatchWords.toLocaleString()} Words)
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={reindexTitles}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Bulk Renumber (1 to {detectedChapters.length})
                </button>

                <button
                  type="button"
                  onClick={() => setDetectedChapters([])}
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Forge Plus / Elite Staggered Release Scheduler Preview */}
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Automated Release Scheduling (Creator Studio Tool)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Stagger chapter publication across days (e.g. 1 chapter every {scheduleIntervalDays} days) to keep readership engaged.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableScheduling}
                    onChange={(e) => setEnableScheduling(e.target.checked)}
                    className="rounded border-white/20 bg-slate-900 text-[#6D5DFB] h-4 w-4"
                  />
                  <span>Enable Staggered Release</span>
                </label>

                {enableScheduling && (
                  <select
                    value={scheduleIntervalDays}
                    onChange={(e) => setScheduleIntervalDays(Number(e.target.value))}
                    className="h-8 rounded-lg border border-white/10 bg-[#020617] px-2 text-xs text-white outline-none"
                  >
                    <option value={1}>Every 24 Hours</option>
                    <option value={2}>Every 2 Days</option>
                    <option value={3}>Every 3 Days</option>
                    <option value={7}>Weekly</option>
                  </select>
                )}
              </div>
            </div>

            {/* Chapters Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3 w-16">#</th>
                    <th className="py-3 px-3">Chapter Title (Editable)</th>
                    <th className="py-3 px-3 w-28">Word Count</th>
                    <th className="py-3 px-3 w-28">Order</th>
                    <th className="py-3 px-3 w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {detectedChapters.map((ch, idx) => (
                    <tr key={ch.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={ch.title}
                          onChange={(e) => updateChapterTitle(ch.id, e.target.value)}
                          className="w-full h-8 rounded-lg border border-transparent bg-transparent hover:border-white/10 focus:border-[#6D5DFB] focus:bg-[#020617] px-2 text-xs font-bold text-white outline-none transition-all"
                        />
                      </td>

                      <td className="py-3 px-3 text-xs font-mono text-amber-300">
                        {ch.wordCount.toLocaleString()} words
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveChapter(idx, "UP")}
                            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-slate-400 hover:text-white"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === detectedChapters.length - 1}
                            onClick={() => moveChapter(idx, "DOWN")}
                            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 text-slate-400 hover:text-white"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewChapter(ch)}
                            className="text-xs font-bold text-indigo-400 hover:underline"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => removeChapter(ch.id)}
                            className="p-1 text-slate-500 hover:text-red-400"
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

            {/* Confirm & Publish Button */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                <strong className="text-slate-200">Atomic Commitment:</strong> Each chapter will be published as an independent, readable chapter inside <strong>{selectedStory?.title || "your selected story"}</strong>.
              </div>

              <button
                type="button"
                onClick={handlePublishBatch}
                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/20 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Commit & Publish {detectedChapters.length} Chapters
              </button>
            </div>

          </div>
        )}

        {/* Modal: Chapter Content Preview */}
        {previewChapter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-black text-white">{previewChapter.title}</h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {previewChapter.wordCount.toLocaleString()} words
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewChapter(null)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto space-y-3 flex-1 pr-2 text-xs leading-relaxed text-slate-300 font-serif">
                {previewChapter.content.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 text-right">
                <button
                  type="button"
                  onClick={() => setPreviewChapter(null)}
                  className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function BulkImportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050B16] flex items-center justify-center text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      }
    >
      <BulkImportContent />
    </Suspense>
  );
}
