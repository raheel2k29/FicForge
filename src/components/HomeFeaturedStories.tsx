"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getAllStories } from "@/lib/storyStore";
import { StoryData } from "@/data/mockStories";
import { BookOpen, Sparkles, ArrowRight, Heart, Star, FileText } from "lucide-react";

export default function HomeFeaturedStories() {
  const [stories, setStories] = useState<StoryData[]>([]);

  useEffect(() => {
    const load = () => {
      const all = Object.values(getAllStories());
      setStories(all);
    };

    load();
    window.addEventListener("ficforge_stories_updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("ficforge_stories_updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-white/10 bg-[#050B16]">
      <div className="max-w-[1180px] mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-flex items-center text-xs font-black tracking-widest uppercase text-[#F97316] bg-orange-500/10 border border-orange-500/30 rounded-full px-3.5 py-1 mb-3">
              ✦ FEATURED STORIES & RELEASES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Trending in the Library
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Explore standout fanfiction, original serialized webnovels, and newly forged chapters published by creators across FicForge.
            </p>
          </div>

          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all self-start sm:self-auto shrink-0"
          >
            Explore Library ({stories.length} Stories) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => {
            const storyId = story.id || story.slug;

            return (
              <div
                key={storyId}
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden shadow-xl hover:border-[#6D5DFB]/50 hover:bg-slate-900/95 transition-all duration-300"
              >
                {/* Cover & Badges */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                  <img
                    src={story.coverImageUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"}
                    alt={story.title || "Story"}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/60" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    {story.classification === "FANFICTION" ? (
                      <span className="rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                        100% Free Fanfiction
                      </span>
                    ) : (
                      <span className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                        Original Webnovel
                      </span>
                    )}

                    <span className="rounded-full bg-white/20 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                      {story.rating || "GENERAL"}
                    </span>
                  </div>

                  {/* Bottom Cover Info */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300 pointer-events-none">
                    <span className="font-extrabold text-[#F97316] drop-shadow-sm truncate max-w-[200px]">
                      {story.fandom ? `⚔️ ${story.fandom}` : story.genres?.[0] ? `✨ ${story.genres[0]}` : "✨ Story"}
                    </span>
                    <span className="text-[11px] text-slate-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md">
                      {story.chapters?.length || 0} Chapters
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-col flex-1 p-5">
                  <Link
                    href={`/story/${story.slug}`}
                    className="group-hover:text-[#F97316] transition-colors"
                  >
                    <h3 className="text-lg font-black text-white leading-snug line-clamp-1">
                      {story.title || "Untitled Story"}
                    </h3>
                  </Link>

                  <div className="mt-1 flex items-center gap-2">
                    <img
                      src={story.author?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                      alt={story.author?.name || "Author"}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      {story.author?.name || "Author"}
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {story.synopsis}
                  </p>

                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      {(story.stats?.words || 0).toLocaleString()} words
                    </span>

                    <Link
                      href={`/story/${story.slug}`}
                      className="rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-4 py-1.5 text-xs font-extrabold text-white shadow-md shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all"
                    >
                      Read Now →
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
