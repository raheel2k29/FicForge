"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MessageSquare,
  Users,
  PenTool,
  BookOpen,
  Sparkles,
  Globe,
  Compass,
  Megaphone,
  ShieldCheck,
  ArrowRight,
  Heart,
  X,
  CheckCircle2,
  Share2,
} from "lucide-react";

interface DiscussionRoom {
  id: string;
  tag: string;
  title: string;
  description: string;
  activeTopic: string;
  pinnedTip: string;
  badgeColor: string;
}

const ROOMS: DiscussionRoom[] = [
  {
    id: "general-chat",
    tag: "Open Chat",
    title: "General Lounge",
    description: "Open discussion for FicForge readers and authors. Talk about trending serialized novels, reading goals, and stories.",
    activeTopic: "What got you started reading or writing fanfiction and original webnovels?",
    pinnedTip: "Be respectful and celebrate varied tropes, fandoms, and storytelling styles.",
    badgeColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
  },
  {
    id: "writer-lounge",
    tag: "Writers",
    title: "Creator Workshop Lounge",
    description: "A space for writers to discuss pacing, cliffhangers, publishing routines, writer's block, and reader engagement.",
    activeTopic: "How many words per chapter do you find gives optimal pacing for weekly serialized fiction?",
    pinnedTip: "Check out the FicForge Bulk Importer in Creator Studio to format chapters seamlessly.",
    badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  },
  {
    id: "reader-lounge",
    tag: "Readers",
    title: "Reader Circle",
    description: "Connect with fellow readers to exchange bookmarks, discuss plot twists, and review recently updated serials.",
    activeTopic: "What are your favorite tropes: Enemies-to-Lovers, Found Family, or Progression Fantasy?",
    pinnedTip: "Bookmark stories to your Saved Library to receive update alerts when new chapters drop.",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  {
    id: "fandom-discussion",
    tag: "Fandoms",
    title: "Fandom Lore & Canon",
    description: "Deep dives into Harry Potter, Marvel, Percy Jackson, Star Wars, Anime, and webnovel universes.",
    activeTopic: "Canon divergence vs. Alternate Universe: which one allows greater character growth?",
    pinnedTip: "FicForge fanfiction is 100% free and ad-free forever under creator fair harbor principles.",
    badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  },
  {
    id: "fanfiction-talk",
    tag: "Fanfiction",
    title: "Fanfiction Craft",
    description: "Explore POV exploration, crossover mechanics, time travel fixes, and redemption arcs.",
    activeTopic: "Writing believable crossover interactions between vastly different magic or technology systems.",
    pinnedTip: "Proper tagging and spoiler warnings keep stories accessible to all readers.",
    badgeColor: "text-pink-400 bg-pink-500/10 border-pink-500/30",
  },
  {
    id: "original-fiction",
    tag: "Originals",
    title: "Original Serials & Webnovels",
    description: "Creator-owned fiction, LitRPG, progression fantasy, romantic fantasy, and unique intellectual property.",
    activeTopic: "Balancing stat progression with organic emotional arcs in serialized webnovels.",
    pinnedTip: "Original authors retain 100% copyright and ownership of their characters and worlds.",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "writing-help",
    tag: "Help",
    title: "Beta & Feedback Exchange",
    description: "Ask for feedback on story hooks, chapter pacing, dialogue realism, blurb synopses, and titles.",
    activeTopic: "Hooking readers within the first 500 words of Chapter 1 without info-dumping.",
    pinnedTip: "Constructive critique builds great writers; always highlight what's working well too.",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: "worldbuilding-lore",
    tag: "Lore",
    title: "Worldbuilding Forge",
    description: "Design hard vs. soft magic systems, geopolitical factions, ancient history, and mythic languages.",
    activeTopic: "Creating economic and ecological consequences for widely accessible elemental magic.",
    pinnedTip: "Rich worldbuilding shines best when revealed through character choices and conflicts.",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  {
    id: "story-recommendations",
    tag: "Discover",
    title: "Community Recs",
    description: "Recommend hidden gems, rising stars, and completed series across all genres.",
    activeTopic: "Drop one underrated story from FicForge that deserves 1,000 more readers!",
    pinnedTip: "Show love to rising writers by leaving tips and comments on their latest chapters.",
    badgeColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  },
  {
    id: "announcements",
    tag: "Official",
    title: "Platform Announcements",
    description: "Official releases, Spotlight campaign updates, engine upgrades, and feature roadmaps.",
    activeTopic: "Phase 4 Admin Governance Console & Creator Studio Bulk Importer now live across the platform.",
    pinnedTip: "Subscribe to announcements via community feeds or check the Governance logs.",
    badgeColor: "text-red-400 bg-red-500/10 border-red-500/30",
  },
  {
    id: "rules-moderation",
    tag: "Safety",
    title: "Standards & Fair Harbor",
    description: "Platform standards, anti-harassment safeguards, DMCA protection, and content guidelines.",
    activeTopic: "Community moderation values: Keeping FicForge creative, safe, and focused on storytelling.",
    pinnedTip: "Review our Content Policy and Moderation Appeals anytime in the footer.",
    badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  },
];

export default function CommunityPage() {
  const [activeModalRoom, setActiveModalRoom] = useState<DiscussionRoom | null>(null);

  return (
    <div className="min-h-screen bg-[#050B16] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1180px] mx-auto space-y-12">
        
        {/* Hero Section */}
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest uppercase text-[#F97316] bg-orange-500/10 border border-orange-500/30 rounded-full px-3.5 py-1.5">
            <Users className="h-3.5 w-3.5" /> FICFORGE COMMUNITY
          </span>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Connect Around Stories, Worlds & Craft
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Talk with passionate readers, serialized authors, fandom enthusiasts, and original creators across FicForge. Explore discussion lounges, share recommendations, exchange feedback, and connect with fellow writers.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all"
            >
              <BookOpen className="h-4 w-4" /> Browse Stories
            </Link>

            <Link
              href="/write"
              className="inline-flex items-center gap-2 rounded-xl border border-[#F97316]/50 bg-orange-500/15 hover:bg-orange-500/25 px-5 py-3 text-xs font-black text-orange-300 transition-all shadow-md shadow-orange-950/30"
            >
              <PenTool className="h-4 w-4 text-[#F97316]" /> Open Creator Studio
            </Link>

            <Link
              href="/content-policy"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 hover:bg-slate-800 px-5 py-3 text-xs font-bold text-slate-300 hover:text-white transition-all"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Community Standards
            </Link>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/70 to-slate-950 p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Interactive Community Spaces</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Join our 11 curated discussion hubs to share ideas, request writing feedback, and discuss serialized fiction.
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-3 py-1.5 rounded-full">
            Active Community Hub
          </span>
        </div>

        {/* Rooms Grid */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Community Discussion Lounges
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a lounge below to preview active discussion topics, writing tips, and storytelling resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ROOMS.map((room) => (
              <div
                key={room.id}
                className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 hover:border-white/20 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <span
                    className={`inline-flex text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border mb-3 ${room.badgeColor}`}
                  >
                    {room.tag}
                  </span>

                  <h3 className="text-lg font-black text-white group-hover:text-orange-300 transition-colors">
                    {room.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {room.description}
                  </p>

                  <div className="mt-4 rounded-xl border border-white/5 bg-slate-950/60 p-3 text-xs text-slate-300">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-[#F97316] font-bold mb-1">
                      Current Prompt
                    </span>
                    <p className="italic text-slate-300 text-xs">
                      "{room.activeTopic}"
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveModalRoom(room)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <span>View Lounge Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  <Link
                    href="/write"
                    className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    Write Story →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Interactive Lounge Detail */}
        {activeModalRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="max-w-lg w-full rounded-3xl border border-white/15 bg-slate-900 p-6 sm:p-8 shadow-2xl relative text-left space-y-5">
              <button
                type="button"
                onClick={() => setActiveModalRoom(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>

              <div>
                <span
                  className={`inline-flex text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border mb-2 ${activeModalRoom.badgeColor}`}
                >
                  {activeModalRoom.tag}
                </span>
                <h3 className="text-2xl font-black text-white">
                  {activeModalRoom.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {activeModalRoom.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
                  <strong className="block text-xs font-bold text-orange-300 uppercase tracking-wider mb-1">
                    Discussion Prompt
                  </strong>
                  <p className="text-sm text-slate-200 italic">
                    "{activeModalRoom.activeTopic}"
                  </p>
                </div>

                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
                  <strong className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                    Creator Tip
                  </strong>
                  <p className="text-xs text-slate-300">
                    {activeModalRoom.pinnedTip}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/write"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] py-3 px-4 text-xs font-extrabold text-white text-center shadow"
                >
                  <PenTool className="h-4 w-4" /> Start Story With This Theme
                </Link>

                <Link
                  href="/browse"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 py-3 px-4 text-xs font-bold text-slate-200 text-center"
                >
                  <BookOpen className="h-4 w-4" /> Browse Stories
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Footer Policy Links Box */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 space-y-4">
          <h3 className="text-lg font-bold text-white">Community Standards & Governance</h3>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Constructive critique, friendly debate, recommendations, and worldbuilding lore are always celebrated on FicForge. Harassment, threats, spam, doxxing, plagiarism, and attempting to sell fanfiction chapters are strictly prohibited.
          </p>
          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <Link
              href="/content-policy"
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800 text-slate-300 hover:text-white hover:border-white/30 transition-all font-bold"
            >
              Content Policy
            </Link>
            <Link
              href="/moderation-appeals"
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800 text-slate-300 hover:text-white hover:border-white/30 transition-all font-bold"
            >
              Moderation & Appeals
            </Link>
            <Link
              href="/dmca-policy"
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800 text-slate-300 hover:text-white hover:border-white/30 transition-all font-bold"
            >
              DMCA & Safe Harbor
            </Link>
            <Link
              href="/support"
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800 text-slate-300 hover:text-white hover:border-white/30 transition-all font-bold"
            >
              Contact Support
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
