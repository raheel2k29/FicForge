"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveStory } from "@/lib/storyStore";
import { getCurrentUser } from "@/lib/authStore";
import { StoryData } from "@/data/mockStories";
import WriterAuthGate from "@/components/WriterAuthGate";
import {
  Sparkles,
  ArrowLeft,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Tag,
  Shield,
  Layers,
} from "lucide-react";

export default function NewStoryWizardPage() {
  const router = useRouter();

  // Wizard Form State
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [classification, setClassification] = useState<"ORIGINAL" | "FANFICTION">("FANFICTION");
  const [fandom, setFandom] = useState("");
  const [primaryGenre, setPrimaryGenre] = useState("Fantasy");
  const [rating, setRating] = useState<"GENERAL" | "TEEN" | "MATURE" | "EXPLICIT">("TEEN");
  const [coverImageUrl, setCoverImageUrl] = useState(
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"
  );
  const [status, setStatus] = useState<"ONGOING" | "COMPLETED" | "HIATUS">("ONGOING");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["Adventure", "Magic"]);
  const [warningInput, setWarningInput] = useState("");
  const [warnings, setWarnings] = useState<string[]>(["Fantasy Violence"]);

  // Preset cover selections
  const coverPresets = [
    {
      name: "Ember Flame",
      url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Cosmic Nebula",
      url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Cyber Neon",
      url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Ancient Library",
      url: "https://images.unsplash.com/photo-1507842229452-772d1c9ab218?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const popularFandoms = [
    "Harry Potter",
    "Star Wars",
    "Marvel Cinematic Universe",
    "DC Universe",
    "Percy Jackson",
    "Genshin Impact",
    "Anime / Manga",
    "Lord of the Rings",
  ];

  const genresList = [
    "Fantasy",
    "Sci-Fi",
    "Action",
    "Adventure",
    "Romance",
    "Mystery",
    "Horror",
    "Thriller",
    "Cyberpunk",
    "Supernatural",
    "Slice of Life",
  ];

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const addWarning = () => {
    if (warningInput.trim() && !warnings.includes(warningInput.trim())) {
      setWarnings([...warnings, warningInput.trim()]);
      setWarningInput("");
    }
  };

  const removeWarning = (w: string) => {
    setWarnings(warnings.filter((item) => item !== w));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newStory: StoryData = {
      id: `story-${Date.now()}`,
      title: title.trim(),
      slug: slug || `story-${Date.now()}`,
      synopsis: synopsis.trim() || "A newly forged story on FicForge.",
      coverImageUrl: coverImageUrl || coverPresets[0].url,
      classification,
      fandom: classification === "FANFICTION" ? fandom.trim() || "Original Fanwork" : undefined,
      genres: [primaryGenre],
      rating,
      status,
      author: {
        name: getCurrentUser()?.name || "Valerius Frost",
        username: getCurrentUser()?.username || "valerius_f",
        avatarUrl: getCurrentUser()?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        isVerified: true,
        bio: "Writing and building worlds on FicForge.",
      },
      stats: {
        words: 0,
        views: 0,
        likes: 0,
        bookmarks: 0,
        chapterCount: 0,
      },
      tags: {
        warnings,
        pairings: [],
        characters: [],
        general: tags,
      },
      updatedAt: "Just now",
      chapters: [],
    };

    saveStory(newStory);
    router.push(`/write/bulk-import?storySlug=${newStory.slug}`);
  };

  return (
    <WriterAuthGate
      title="Create a New Story"
      description="Sign in to your writer account to access the Story Creation Wizard, upload original covers, and define your story classification."
    >
      <div className="min-h-screen bg-[#050B16] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1040px] mx-auto">
        
        {/* Back Link */}
        <Link
          href="/my-stories"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Stories
        </Link>

        {/* Header */}
        <div className="border-b border-white/10 pb-6 mb-8">
          <span className="text-xs font-black tracking-widest uppercase text-[#F97316]">
            STORY CREATION WIZARD
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
            Forge a New Story
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Define your story's universe, classification, audience rating, and cover presentation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Story Classification */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-3">
                1. Story Classification <span className="text-[#F97316]">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Fanfiction Option */}
                <div
                  onClick={() => setClassification("FANFICTION")}
                  className={`cursor-pointer rounded-xl border p-4.5 transition-all ${
                    classification === "FANFICTION"
                      ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                      : "border-white/10 bg-slate-800/50 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-white">Fanfiction</span>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5">
                      100% Free
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Transformative stories inspired by existing fandoms. Strictly free to read with zero chapter paywalls.
                  </p>
                </div>

                {/* Original Fiction Option */}
                <div
                  onClick={() => setClassification("ORIGINAL")}
                  className={`cursor-pointer rounded-xl border p-4.5 transition-all ${
                    classification === "ORIGINAL"
                      ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10"
                      : "border-white/10 bg-slate-800/50 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-white">Original Webnovel</span>
                    <span className="rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase px-2 py-0.5">
                      Monetization Eligible
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Creator-owned original fiction. Eligible for Fast Pass early-access chapters and reader tipping.
                  </p>
                </div>
              </div>

              {/* Fandom Selector (if Fanfiction) */}
              {classification === "FANFICTION" && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Fandom Name <span className="text-[#F97316]">*</span>
                  </label>
                  <input
                    type="text"
                    value={fandom}
                    onChange={(e) => setFandom(e.target.value)}
                    placeholder="e.g. Star Wars, Harry Potter, Percy Jackson..."
                    className="w-full h-11 rounded-xl border border-white/10 bg-[#020617] px-4 text-sm text-white placeholder-slate-500 outline-none focus:border-[#6D5DFB]"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {popularFandoms.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFandom(f)}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                      >
                        + {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Story Identity */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                  Story Title <span className="text-[#F97316]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Obsidian Blade, Chronicles of the Frost..."
                  className="w-full h-12 rounded-xl border border-white/10 bg-[#020617] px-4 text-base font-bold text-white placeholder-slate-500 outline-none focus:border-[#6D5DFB]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                  Synopsis / Blurb <span className="text-[#F97316]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Give readers an exciting hook into your story, world, and characters..."
                  className="w-full rounded-xl border border-white/10 bg-[#020617] p-4 text-sm text-white placeholder-slate-500 outline-none focus:border-[#6D5DFB] leading-relaxed"
                />
              </div>
            </div>

            {/* Step 3: Audience Rating & Genre */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                    Audience Rating
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value as any)}
                    className="w-full h-11 rounded-xl border border-white/10 bg-[#020617] px-3 text-sm text-white outline-none focus:border-[#6D5DFB]"
                  >
                    <option value="GENERAL">General (All Ages)</option>
                    <option value="TEEN">Teen (13+)</option>
                    <option value="MATURE">Mature (16+)</option>
                    <option value="EXPLICIT">Explicit (18+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                    Primary Genre
                  </label>
                  <select
                    value={primaryGenre}
                    onChange={(e) => setPrimaryGenre(e.target.value)}
                    className="w-full h-11 rounded-xl border border-white/10 bg-[#020617] px-3 text-sm text-white outline-none focus:border-[#6D5DFB]"
                  >
                    {genresList.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Story Tags & Tropes
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Type tag (e.g. Magic System, Slow Burn, Time Travel) and press Add"
                    className="flex-1 h-10 rounded-xl border border-white/10 bg-[#020617] px-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#6D5DFB]"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-700"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#6D5DFB] via-[#7C3AED] to-[#F97316] text-base font-black text-white shadow-xl shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Create Story & Proceed to Chapter Importer →
              </button>
            </div>

          </div>

          {/* Sidebar: Live Cover Preview & Presets (1 col) */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-xl text-center">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-3 text-left">
                Story Cover Preview
              </label>

              {/* 3D Cover Display */}
              <div className="mx-auto h-64 w-44 rounded-xl overflow-hidden shadow-2xl border border-white/15 bg-slate-950 relative group">
                <img
                  src={coverImageUrl}
                  alt="Story Cover Preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 text-left">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#F97316]">
                    {classification === "FANFICTION" ? "100% Free" : "Original"}
                  </span>
                  <h4 className="text-xs font-black text-white line-clamp-2">
                    {title || "Untitled Story"}
                  </h4>
                </div>
              </div>

              {/* Cover URL Input */}
              <div className="mt-4 text-left">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full h-9 rounded-lg border border-white/10 bg-[#020617] px-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#6D5DFB]"
                />
              </div>

              {/* Preset Selector */}
              <div className="mt-4 text-left">
                <span className="block text-[11px] font-bold text-slate-400 mb-2">
                  Or select a preset:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {coverPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setCoverImageUrl(preset.url)}
                      className={`text-left text-xs p-2 rounded-lg border transition-all truncate ${
                        coverImageUrl === preset.url
                          ? "border-[#6D5DFB] bg-[#6D5DFB]/20 text-white font-bold"
                          : "border-white/10 bg-slate-800/60 text-slate-400 hover:text-white"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Publishing Guarantee Note */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Author Rights Protected</span>
              </div>
              <p className="leading-relaxed">
                You retain all rights to your original works. Content can be edited, revised, or exported at any time from your Creator Workshop.
              </p>
            </div>
          </div>

        </form>

      </div>
    </div>
    </WriterAuthGate>
  );
}
