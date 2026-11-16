"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useMemo } from "react";
import { getAllStories, bulkSaveChapters, syncStoriesWithServer } from "@/lib/storyStore";
import { StoryData, ChapterData } from "@/data/mockStories";
import WriterAuthGate from "@/components/WriterAuthGate";
import CreatorStudioHeader from "@/components/CreatorStudioHeader";
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
  Plus,
  HelpCircle,
  BookOpen,
  Copy,
  Check,
} from "lucide-react";

interface ImportedChapterItem {
  id: string;
  title: string;
  rawText: string;
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
  const [activeTab, setActiveTab] = useState<"SPLITTER" | "MULTI_FILE" | "MANUAL">("SPLITTER");
  const [manuscriptText, setManuscriptText] = useState("");
  const [detectedChapters, setDetectedChapters] = useState<ImportedChapterItem[]>([]);
  const [expandedBoxes, setExpandedBoxes] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [enableScheduling, setEnableScheduling] = useState(false);
  const [scheduleIntervalDays, setScheduleIntervalDays] = useState(2); // every 2 days
  const [showFormatGuide, setShowFormatGuide] = useState(true);

  useEffect(() => {
    if (storySlugParam) {
      setSelectedStorySlug(storySlugParam);
    }

    const init = (all: Record<string, StoryData>) => {
      const list = Object.values(all);
      setStories(list);

      if (storySlugParam && all[storySlugParam]) {
        setSelectedStorySlug(storySlugParam);
      } else if (!storySlugParam && list.length > 0 && !selectedStorySlug) {
        setSelectedStorySlug(list[0].slug);
      }
    };

    init(getAllStories());

    syncStoriesWithServer().then((serverStories) => {
      if (serverStories) {
        init(serverStories);
      }
    });

    const handleStoriesUpdated = () => {
      init(getAllStories());
    };
    window.addEventListener("ficforge_stories_updated", handleStoriesUpdated);
    return () => window.removeEventListener("ficforge_stories_updated", handleStoriesUpdated);
  }, [storySlugParam]);

  const selectedStory = useMemo(() => {
    return stories.find((s) => s.slug === selectedStorySlug);
  }, [stories, selectedStorySlug]);

  // Demo 10-Chapter Sample Generator for effortless client testing!
  const load10ChapterSample = () => {
    let sample = "";
    for (let i = 1; i <= 10; i++) {
      sample += `Chapter ${i}: The Chronicles of the Forge - Part ${i}\n\n`;
      sample += `The ancient bells of the Citadel rang across the frosty valleys as dawn broke over the horizon. Chapter ${i} marks a pivotal turning point in the journey through uncharted realms.\n\n`;
      sample += `Courage was not the absence of fear, but the mastery of it. With each passing milestone, the party forged stronger bonds, unraveling the hidden secrets left behind by the founders of the realm.\n\n`;
      if (i < 10) {
        sample += `***\n\n`;
      }
    }
    setManuscriptText(sample);
    parseManuscript(sample);
  };

  // Smart Chapter Auto-Splitter Regex Engine
  // Supports:
  // 1) Explicit chapter headers: Chapter X, Ch. X, Act X, Part X, Episode X, Prologue, Epilogue, Interlude
  // 2) Markdown headings: # Chapter X, ## Chapter X
  // 3) Horizontal divider lines: ***, ---, ___
  // 4) Two-line chapter titles (Line 1: "Chapter 1", Line 2: "The Beginning")
  const splitTextIntoChapterItems = (
    textToParse: string,
    fallbackTitle?: string,
    prefix: string = "ch"
  ): ImportedChapterItem[] => {
    if (!textToParse.trim()) return [];

    // Normalize Windows CRLF and Mac CR to standard LF
    const normalized = textToParse.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    const delimiterRegex =
      /(?:^|\n)(?=(?:#{1,3}\s*)?(?:Chapter|CHAPTER|Ch\.|Ch\s|Act|ACT|Part|PART|Episode|EPISODE|Prologue|PROLOGUE|Epilogue|EPILOGUE|Interlude|INTERLUDE)\s*[\dIVXLCDM]*[:\.\s\-]?|(?:\*\*\*|---|___)\s*(?:\n|$))/gi;

    const rawBlocks = normalized
      .split(delimiterRegex)
      .map((b) =>
        b
          .trim()
          .replace(/^(\*\*\*|---|___)\s*/, "")
          .replace(/(\*\*\*|---|___)\s*$/, "")
          .trim()
      )
      .filter((b) => b.length > 0);

    // Single chapter / undivided manuscript block
    if (rawBlocks.length <= 1) {
      const fullText = (rawBlocks[0] || normalized).trim();
      const lines = fullText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      let detectedTitle = fallbackTitle || "Chapter 1";
      let bodyLines = lines;

      if (lines.length > 0) {
        const first = lines[0].replace(/^#+\s*/, "").trim();
        const isHeader =
          /^(?:Chapter|CHAPTER|Ch\.|Ch\s|Act|Part|Episode|Prologue|Epilogue|Interlude)/i.test(first) ||
          (first.length <= 70 && !/[.!?]$/.test(first));
        if (isHeader) {
          detectedTitle = first;
          bodyLines = lines.slice(1);
          // Two-line title check
          if (
            /^(?:Chapter|CHAPTER|Ch\.|Act|Part|Episode)\s*[\dIVXLCDM]+$/i.test(first) &&
            lines[1] &&
            lines[1].length <= 80 &&
            !/[.!?]$/.test(lines[1])
          ) {
            detectedTitle = `${first}: ${lines[1]}`;
            bodyLines = lines.slice(2);
          }
        }
      }

      const rawBody = bodyLines.length > 0 ? bodyLines.join("\n\n") : fullText;
      const words = rawBody.split(/\s+/).filter(Boolean).length;

      return [
        {
          id: `${prefix}-1-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: detectedTitle.length > 80 ? detectedTitle.substring(0, 80) : detectedTitle,
          rawText: rawBody,
          content: bodyLines.length > 0 ? bodyLines : [fullText],
          wordCount: words,
        },
      ];
    }

    // Multiple chapters detected
    return rawBlocks.map((block, idx) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      let firstLine = (lines[0] || `Chapter ${idx + 1}`).replace(/^#+\s*/, "").trim();
      let chapterBodyLines = lines.slice(1);

      // Support 2-line title convention: "Chapter 1\nThe Dark Forest"
      if (
        /^(?:Chapter|CHAPTER|Ch\.|Act|Part|Episode)\s*[\dIVXLCDM]+$/i.test(lines[0]) &&
        lines[1] &&
        lines[1].length <= 80 &&
        !/[.!?]$/.test(lines[1])
      ) {
        firstLine = `${lines[0]}: ${lines[1]}`;
        chapterBodyLines = lines.slice(2);
      }

      const rawText = chapterBodyLines.join("\n\n");
      const words = rawText.split(/\s+/).filter(Boolean).length;

      return {
        id: `${prefix}-${idx + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: firstLine.length > 80 ? firstLine.substring(0, 80) : firstLine,
        rawText: rawText || block,
        content: chapterBodyLines.length > 0 ? chapterBodyLines : [firstLine],
        wordCount: words,
      };
    });
  };

  const parseManuscript = (textToParse: string) => {
    if (!textToParse.trim()) {
      setDetectedChapters([]);
      return;
    }

    const parsed = splitTextIntoChapterItems(textToParse, "Chapter 1", "ch");
    setDetectedChapters(parsed);
    // Expand the first 2 boxes by default, collapse remainder for tidy overview
    const initExpanded: Record<string, boolean> = {};
    parsed.forEach((ch, idx) => {
      initExpanded[ch.id] = idx < 2;
    });
    setExpandedBoxes(initExpanded);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setManuscriptText(val);
  };

  const handleTriggerConvert = () => {
    parseManuscript(manuscriptText);
  };

  // Shared file list processor (supports single multi-chapter files and multiple single-chapter files)
  const processFileList = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsProcessing(true);
    const readers: Promise<ImportedChapterItem[]>[] = fileArray.map((file, fileIdx) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = (event.target?.result as string) || "";
          const fileNameClean = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          const chapters = splitTextIntoChapterItems(text, fileNameClean, `file-${fileIdx + 1}`);
          resolve(chapters);
        };
        reader.readAsText(file);
      });
    });

    Promise.all(readers).then((nested) => {
      const flattened = nested.flat();
      setDetectedChapters(flattened);
      const initExp: Record<string, boolean> = {};
      flattened.forEach((ch, idx) => {
        initExp[ch.id] = idx < 2;
      });
      setExpandedBoxes(initExp);
      setIsProcessing(false);

      // If user uploaded a single multi-chapter file, sync the manuscript textarea as well
      if (fileArray.length === 1 && flattened.length > 1) {
        const singleReader = new FileReader();
        singleReader.onload = (ev) => {
          const txt = (ev.target?.result as string) || "";
          setManuscriptText(txt);
        };
        singleReader.readAsText(fileArray[0]);
      }
    });
  };

  // Multi-file batch upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFileList(files);
    e.target.value = "";
  };

  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;
    processFileList(droppedFiles);
  };

  // Individual Chapter Box Handlers
  const updateChapterTitle = (id: string, newTitle: string) => {
    setDetectedChapters((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, title: newTitle } : ch))
    );
  };

  const updateChapterContent = (id: string, newText: string) => {
    setDetectedChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== id) return ch;
        const paragraphs = newText
          .split(/\n\n+/)
          .map((p) => p.trim())
          .filter(Boolean);
        const words = newText.split(/\s+/).filter(Boolean).length;
        return {
          ...ch,
          rawText: newText,
          content: paragraphs.length > 0 ? paragraphs : (newText ? [newText] : []),
          wordCount: words,
        };
      })
    );
  };

  const addEmptyChapter = () => {
    const nextNum = detectedChapters.length + 1;
    const newId = `ch-box-${nextNum}-${Date.now()}`;
    const newChapter: ImportedChapterItem = {
      id: newId,
      title: `Chapter ${nextNum}: New Chapter`,
      rawText: "",
      content: [],
      wordCount: 0,
    };
    setDetectedChapters((prev) => [...prev, newChapter]);
    setExpandedBoxes((prev) => ({ ...prev, [newId]: true }));
  };

  const toggleBox = (id: string) => {
    setExpandedBoxes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllBoxes = (expand: boolean) => {
    const updated: Record<string, boolean> = {};
    detectedChapters.forEach((ch) => {
      updated[ch.id] = expand;
    });
    setExpandedBoxes(updated);
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
        title: `Chapter ${idx + 1}: ${ch.title.replace(/^Chapter\s*\d+[:\s\-]*/i, "").trim() || "Untitled"}`,
      }))
    );
  };

  // Commit and Atomic Publish
  const handlePublishBatch = async () => {
    if (!selectedStorySlug || detectedChapters.length === 0) return;

    setIsProcessing(true);
    const now = new Date();

    const chaptersToSave: ChapterData[] = detectedChapters.map((ch, idx) => {
      const paragraphs = ch.rawText
        ? ch.rawText.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
        : ch.content;

      let publishDateStr = now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      let isScheduled = false;
      let scheduledPublishAt: string | undefined = undefined;

      if (enableScheduling && idx > 0) {
        isScheduled = true;
        const futureDate = new Date(now);
        futureDate.setDate(futureDate.getDate() + idx * scheduleIntervalDays);
        scheduledPublishAt = futureDate.toISOString();
        publishDateStr = `Scheduled for ${futureDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      }

      return {
        number: idx + 1,
        slug: `chapter-${idx + 1}`,
        title: ch.title,
        wordCount: ch.wordCount,
        isPublished: !isScheduled,
        isScheduled,
        scheduledPublishAt,
        publishedAt: publishDateStr,
        topAuthorNote: ch.topAuthorNote,
        bottomAuthorNote: ch.bottomAuthorNote,
        content: paragraphs.length > 0 ? paragraphs : [ch.title],
      };
    });

    const success = await bulkSaveChapters(selectedStorySlug, chaptersToSave);
    setIsProcessing(false);
    if (success) {
      router.push(`/story/${selectedStorySlug}`);
    } else {
      alert("Failed to commit chapters. Please ensure a story is selected.");
    }
  };

  const totalBatchWords = detectedChapters.reduce((acc, c) => acc + c.wordCount, 0);

  return (
    <div className="min-h-screen bg-[#050B16] text-white">
      <CreatorStudioHeader currentTab="import" />
      <div className="max-w-[1240px] mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        
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
            CREATOR STUDIO · BULK MANUSCRIPT SUITE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
            Batch Import & Individual Chapter Boxes
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-3xl leading-relaxed">
            Upload or paste your manuscript (any number of chapters). FicForge divides your story into <strong>individual, editable chapter boxes</strong> so you can review, edit, reorder, and publish them with complete control.
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

        {/* Format Guidance Banner */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/90 to-slate-950 p-6 shadow-xl space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 text-indigo-400">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Bulk Chapters Format Guide (How to structure your chapters)
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  When you paste or import your manuscript, the studio automatically splits it and converts every chapter into its own <strong>individual chapter box</strong>. Follow any of these simple formatting rules:
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFormatGuide(!showFormatGuide)}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
            >
              {showFormatGuide ? "Hide Examples" : "View Examples"}
            </button>
          </div>

          {showFormatGuide && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              {/* Format 1 */}
              <div className="rounded-xl border border-white/10 bg-[#020617]/70 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <strong className="text-xs font-bold text-white">1. Standard Headings (Best)</strong>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Put <code className="text-amber-300 font-mono">Chapter 1: Title</code>, <code className="text-amber-300 font-mono">Chapter 2: Title</code> before each chapter.
                </p>
                <div className="rounded-lg bg-black/40 p-2.5 font-mono text-[10px] text-slate-300 leading-relaxed border border-white/5">
                  Chapter 1: The Dark Woods<br />
                  First paragraph of story...<br /><br />
                  Chapter 2: The Hidden Keep<br />
                  Second chapter starts...
                </div>
              </div>

              {/* Format 2 */}
              <div className="rounded-xl border border-white/10 bg-[#020617]/70 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  <strong className="text-xs font-bold text-white">2. Divider Lines (*** or ---)</strong>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Separate each chapter with 3 asterisks (<code className="text-indigo-300 font-mono">***</code>) or dashes (<code className="text-indigo-300 font-mono">---</code>).
                </p>
                <div className="rounded-lg bg-black/40 p-2.5 font-mono text-[10px] text-slate-300 leading-relaxed border border-white/5">
                  Chapter 1: The Awakening<br />
                  Story content here...<br />
                  ***<br />
                  Chapter 2: Shadows Rise<br />
                  Next chapter begins...
                </div>
              </div>

              {/* Format 3 */}
              <div className="rounded-xl border border-white/10 bg-[#020617]/70 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />
                  <strong className="text-xs font-bold text-white">3. Single or Multi-File Upload</strong>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Upload a single file with all chapters, or multiple individual <code className="text-orange-300 font-mono">.txt</code> or <code className="text-orange-300 font-mono">.md</code> files.
                </p>
                <div className="rounded-lg bg-black/40 p-2.5 font-mono text-[10px] text-slate-300 leading-relaxed border border-white/5">
                  • 1 file with 10 chapters → 10 boxes<br />
                  • 10 separate files → 10 boxes<br />
                  (Automatic chapter box conversion)
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Import Input Workspace */}
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
                Paste Manuscript & Convert
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
                Batch File Upload (.txt / .md)
              </button>
            </div>

            {/* Quick Demo Sample Loader for Instant Testing */}
            <button
              type="button"
              onClick={load10ChapterSample}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" /> Load Demo Sample (Test Run)
            </button>
          </div>

          {activeTab === "SPLITTER" ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                    Paste Entire Manuscript
                  </label>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Paste your manuscript or chapters below. Click <strong>"Convert into Chapter Boxes"</strong> to generate individual boxes for each chapter.
                  </p>
                </div>
                <label className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition-all cursor-pointer shrink-0">
                  <UploadCloud className="h-4 w-4" />
                  <span>Upload .txt / .md File</span>
                  <input
                    type="file"
                    accept=".txt,.md,.text"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                rows={9}
                value={manuscriptText}
                onChange={handleTextChange}
                placeholder="Chapter 1: The Dark Forest&#10;&#10;The path was shrouded in thick mist...&#10;&#10;***&#10;&#10;Chapter 2: The Hidden Keep&#10;&#10;At the end of the valley stood an ancient fortress..."
                className="w-full rounded-2xl border border-white/10 bg-[#020617] p-4 text-xs font-mono text-slate-200 placeholder-slate-600 outline-none focus:border-[#6D5DFB] leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-400 font-mono">
                  {manuscriptText.split(/\s+/).filter(Boolean).length.toLocaleString()} words in manuscript
                </span>

                <button
                  type="button"
                  onClick={handleTriggerConvert}
                  disabled={!manuscriptText.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] text-xs font-black text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  ✨ Convert into Individual Chapter Boxes
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropFiles}
              className="border-2 border-dashed border-white/15 rounded-2xl p-10 text-center bg-[#020617]/50 hover:border-[#6D5DFB]/60 transition-colors"
            >
              <UploadCloud className="mx-auto h-12 w-12 text-[#6D5DFB] mb-3" />
              <h3 className="text-base font-bold text-white">Upload Single or Multiple Manuscript Files</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Upload a single file containing multiple chapters, or multiple individual `.txt` / `.md` files. FicForge will automatically split them into individual chapter boxes.
              </p>
              <label className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-5 py-2.5 text-xs font-extrabold text-white cursor-pointer shadow-lg shadow-indigo-600/30 hover:opacity-95">
                <UploadCloud className="h-4 w-4" />
                Browse Files (.txt / .md)
                <input
                  type="file"
                  multiple
                  accept=".txt,.md,.text"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-3">
                Drag and drop your file(s) here or click Browse
              </p>
            </div>
          )}

        </div>

        {/* INDIVIDUAL CHAPTER BOXES WORKSPACE */}
        {detectedChapters.length > 0 && (
          <div className="space-y-6">
            
            {/* Toolbar Card */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-black text-emerald-400">
                    Ready
                  </span>
                  <h3 className="text-xl font-black text-white">
                    {detectedChapters.length} Individual Chapter Boxes
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Total: {totalBatchWords.toLocaleString()} words · Each box is an independent chapter editor.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => toggleAllBoxes(true)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllBoxes(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Collapse All
                </button>
                <button
                  type="button"
                  onClick={reindexTitles}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Bulk Renumber (1 to {detectedChapters.length})
                </button>
                <button
                  type="button"
                  onClick={addEmptyChapter}
                  className="rounded-xl bg-[#6D5DFB] hover:bg-[#5B4BE0] px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Chapter Box
                </button>
                <button
                  type="button"
                  onClick={() => setDetectedChapters([])}
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Individual Chapter Boxes List */}
            <div className="space-y-4">
              {detectedChapters.map((ch, idx) => {
                const isExpanded = !!expandedBoxes[ch.id];
                return (
                  <div
                    key={ch.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/90 shadow-xl overflow-hidden transition-all hover:border-white/20"
                  >
                    {/* Box Header Bar */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 border-b border-white/5">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="shrink-0 rounded-lg bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-1 text-xs font-black text-indigo-300 font-mono">
                          Chapter {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={ch.title}
                          onChange={(e) => updateChapterTitle(ch.id, e.target.value)}
                          placeholder="Chapter Title..."
                          className="w-full max-w-md h-9 rounded-lg border border-white/10 bg-[#020617] px-3 text-xs sm:text-sm font-bold text-white outline-none focus:border-[#6D5DFB] transition-all"
                        />
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-bold text-amber-300 font-mono">
                          {ch.wordCount.toLocaleString()} words
                        </span>

                        {/* Move Up / Down */}
                        <div className="flex items-center gap-1 border border-white/10 rounded-lg p-0.5 bg-white/5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveChapter(idx, "UP")}
                            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === detectedChapters.length - 1}
                            onClick={() => moveChapter(idx, "DOWN")}
                            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Expand / Collapse Button */}
                        <button
                          type="button"
                          onClick={() => toggleBox(ch.id)}
                          className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {isExpanded ? "Collapse" : "Edit Content"}
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </button>

                        {/* Delete Chapter Box */}
                        <button
                          type="button"
                          onClick={() => removeChapter(ch.id)}
                          className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
                          title="Delete Box"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Box Content Editor (Body) */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 bg-[#020617]/50 space-y-4 animate-in fade-in duration-150">
                        <div>
                          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
                            Chapter Content (Edit Paragraphs Directly)
                          </label>
                          <textarea
                            rows={8}
                            value={ch.rawText}
                            onChange={(e) => updateChapterContent(ch.id, e.target.value)}
                            placeholder="Write or edit this chapter's text here..."
                            className="w-full rounded-xl border border-white/10 bg-[#020617] p-4 text-xs sm:text-sm font-serif text-slate-200 placeholder-slate-600 outline-none focus:border-[#6D5DFB] leading-relaxed"
                          />
                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                            <span>Paragraphs: {ch.content.length}</span>
                            <span>Characters: {ch.rawText?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Chapter Box Button at Bottom */}
            <button
              type="button"
              onClick={addEmptyChapter}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-white/15 bg-slate-900/40 text-xs font-bold text-slate-300 hover:text-white hover:border-[#6D5DFB] hover:bg-slate-900/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-[#6D5DFB]" />
              + Add Another Chapter Box
            </button>

            {/* Release Staggering & Commit Toolbar */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl space-y-6">
              
              {/* Staggered Release Scheduling */}
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

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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

              {enableScheduling && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Release Schedule:</strong> <strong>Chapter 1</strong> publishes <strong>immediately today</strong> so readers can start reading your story right away! Chapters 2–{detectedChapters.length} will be scheduled to unlock every {scheduleIntervalDays} days.
                  </span>
                </div>
              )}

              {/* Confirm & Publish */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  <strong className="text-slate-200">Atomic Commitment:</strong> Each box will be published as an independent, readable chapter inside <strong>{selectedStory?.title || "your selected story"}</strong>.
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
      <WriterAuthGate
        title="Manuscript Importer Access"
        description="Sign in to your FicForge account to batch import multiple chapters, split manuscripts, and manage release schedules."
      >
        <BulkImportContent />
      </WriterAuthGate>
    </Suspense>
  );
}
