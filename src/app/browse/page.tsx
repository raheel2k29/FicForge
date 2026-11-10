"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Compass, BookOpen, Sparkles, Filter } from "lucide-react";

export default function BrowsePage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filters = [
    "All",
    "Fanfiction",
    "Original Fiction",
    "Fantasy",
    "Sci-Fi",
    "Romance",
    "Action",
    "Adventure",
    "Horror",
    "Mystery",
  ];

  return (
    <div className="min-h-screen bg-[#050B16] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1180px] mx-auto">
        
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center text-xs font-black tracking-widest uppercase text-[#F97316] bg-orange-500/10 border border-orange-500/30 rounded-full px-3.5 py-1.5 mb-4">
            EXPLORE THE FORGE
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Browse Stories
          </h1>
          <p className="mt-3 text-base text-slate-300 leading-relaxed">
            Discover unforgettable fanfiction, serialized original webnovels, and rising worlds from creators across the platform.
          </p>
        </div>

        {/* Search & Filter Panel */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 mb-10 shadow-xl backdrop-blur-sm">
          
          {/* Search Bar */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 mb-5"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by story title, fandom, author, or tags..."
                className="w-full h-12 rounded-xl border border-white/10 bg-[#020617]/80 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-[#6D5DFB] focus:ring-1 focus:ring-[#6D5DFB] transition-all"
              />
            </div>
            <button
              type="submit"
              className="h-12 px-6 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] text-sm font-extrabold text-white shadow-md shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all"
            >
              Search
            </button>
          </form>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1 shrink-0">
              <Filter className="h-3.5 w-3.5" /> Genres:
            </span>
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  type="button"
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#6D5DFB] text-white shadow-md shadow-indigo-600/30 border border-[#6D5DFB]"
                      : "bg-white/5 text-slate-300 border border-white/10 hover:text-white hover:border-white/20"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#F97316]">
              STORY LIBRARY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {activeFilter === "All" ? "Featured & Trending Stories" : `${activeFilter} Stories`}
            </h2>
          </div>
          <Link
            href="/write"
            className="text-xs sm:text-sm font-bold text-slate-300 hover:text-[#F97316] transition-colors"
          >
            Become a Writer →
          </Link>
        </div>

        {/* Main Content Area (Ready for dynamic Story Cards) */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-[#070E1E] p-10 sm:p-14 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6D5DFB]/20 to-[#F97316]/20 border border-white/10 text-3xl mb-5 shadow-lg">
            📖
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white">
            The FicForge Story Library is Opening Soon
          </h3>

          <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
            We are preparing the first wave of fanfiction and original webnovels. Authors can start publishing chapters now, and standout stories will appear right here with interactive library and reader tools.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/write"
              className="rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all"
            >
              Start Writing a Story
            </Link>
            <Link
              href="/library"
              className="rounded-xl border border-white/20 bg-slate-900/80 px-6 py-3 text-sm font-extrabold text-white hover:border-[#F97316] hover:text-[#F97316] transition-all"
            >
              My Saved Library
            </Link>
            <Link
              href="/community"
              className="rounded-xl border border-white/20 bg-slate-900/80 px-6 py-3 text-sm font-extrabold text-white hover:border-[#F97316] hover:text-[#F97316] transition-all"
            >
              Join Community
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
