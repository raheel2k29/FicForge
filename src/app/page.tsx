import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Flame, BookOpen, PenTool } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background radial glow effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#6D5DFB]/15 via-[#F97316]/10 to-transparent blur-3xl" />

      {/* ============================================================== */}
      {/* SECTION 1 & 2: HERO COPY & INTERACTIVE CARD (WIDGET 1 & 2)     */}
      {/* ============================================================== */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-black tracking-widest text-[#F97316] uppercase mb-6">
              <span>✦</span> FOR READERS & WRITERS
            </div>

            <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.02]">
              Where Stories <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#F97316]">
                Are Forged.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl leading-relaxed text-slate-300 max-w-2xl font-normal">
              Discover unforgettable fanfiction and original fiction, or publish your own stories in a community built for readers, writers, and the worlds they love.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/browse"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] hover:shadow-indigo-600/50 transition-all active:scale-95"
              >
                Start Reading
              </Link>
              <Link
                href="/write"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-bold text-white hover:border-[#F97316] hover:text-[#F97316] hover:bg-orange-500/5 transition-all"
              >
                Start Writing
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#34D399]" /> 100% Free Fanfiction
              </span>
              <span className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-[#F97316]" /> Chapter Sanctuary
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#A78BFA]" /> 82/18 Creator Split
              </span>
            </div>
          </div>

          {/* Right Hero Column: Featured World Mockup Card */}
          <div className="relative lg:col-span-5 flex justify-center">
            {/* Ambient Card Glow */}
            <div className="absolute inset-0 -z-10 h-80 w-80 m-auto rounded-full bg-gradient-to-tr from-[#6D5DFB]/30 via-[#F97316]/20 to-transparent blur-2xl" />

            {/* Main Visual Book Card */}
            <div className="relative w-full max-w-[390px] rounded-3xl border border-white/15 bg-gradient-to-b from-[#111827] to-[#0B1220] p-1 shadow-2xl shadow-black/60 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-3.5 text-xs font-bold text-slate-200">
                <span className="flex items-center gap-1.5 text-orange-400">
                  🔥 Featured World
                </span>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-300">
                  4.9 ★
                </span>
              </div>

              {/* Cover Artwork Area */}
              <div className="relative flex h-60 items-center justify-center bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#111827] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(249,115,22,0.35),transparent_45%)]" />
                <span className="text-8xl drop-shadow-2xl select-none">📖</span>
                <span className="absolute top-8 right-16 text-4xl select-none animate-pulse">🔥</span>
              </div>

              {/* Book Details */}
              <div className="p-6">
                <h3 className="text-2xl font-black text-white tracking-tight">The Ember Archive</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  A rising collection of original fiction, fanfiction, and worlds waiting to be discovered.
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-indigo-300">
                    96K Reads
                  </span>
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-1 text-indigo-300">
                    24 Chapters
                  </span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-emerald-300">
                    Ongoing
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Tag Card 1 */}
            <div className="hidden sm:block absolute -left-8 top-16 rounded-2xl border border-white/15 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md max-w-[190px]">
              <strong className="block text-sm font-black text-white">Fantasy</strong>
              <span className="text-xs text-slate-400">Kingdoms, magic, legends</span>
            </div>

            {/* Floating Tag Card 2 */}
            <div className="hidden sm:block absolute -right-6 bottom-14 rounded-2xl border border-white/15 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md max-w-[200px]">
              <strong className="block text-sm font-black text-white">Fanfiction</strong>
              <span className="text-xs text-slate-400">Stories built from worlds you love</span>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 3: EMPTY STORIES / CALLOUT BANNER (WIDGET 3)           */}
      {/* ============================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-[#0F172A]/90 via-[#0B1220]/90 to-[#0F172A]/90 p-8 text-center sm:p-14 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />
          
          <span className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-black tracking-wider text-[#F97316] uppercase mb-4">
            FEATURED STORIES
          </span>

          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Featured stories are coming soon.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 leading-relaxed">
            FicForge is preparing its first wave of stories. As writers begin publishing, this space will highlight standout fanfiction, original webnovels, rising creators, and reader favorites from across the platform.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/write"
              className="rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/25 hover:from-[#5B4BE0] hover:to-[#6D5DFB]"
            >
              Become one of the first writers
            </Link>
            <Link
              href="/browse"
              className="rounded-xl border border-white/15 bg-slate-900/60 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/5"
            >
              Visit the story library
            </Link>
          </div>

          <div className="mt-6 text-xs font-semibold text-slate-500">
            No placeholder stories. No fake rankings. Real stories will appear here as writers forge their universes.
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 4: BROWSE BY FANDOM (WIDGET 4)                         */}
      {/* ============================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#F97316]">
            EXPLORE WORLDS
          </span>
          <h2 className="mt-1 text-3xl font-black text-white sm:text-4xl">Browse by Fandom</h2>
          <p className="mt-2 text-base text-slate-400">
            Find stories inspired by the worlds, characters, and universes readers already love.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Star Wars",
              icon: "🚀",
              desc: "Galactic wars, Jedi, Sith, clones, empires, and alternate timelines.",
            },
            {
              title: "Game of Thrones",
              icon: "🐉",
              desc: "Houses, crowns, dragons, war, intrigue, and kingdom-building.",
            },
            {
              title: "Naruto",
              icon: "🍥",
              desc: "Shinobi worlds, clans, bloodlines, villages, and rewritten destinies.",
            },
            {
              title: "One Piece",
              icon: "🏴‍☠️",
              desc: "Pirates, Marines, Devil Fruits, grand voyages, and rising legends.",
            },
            {
              title: "Harry Potter",
              icon: "🪄",
              desc: "Magic schools, ancient houses, hidden families, and darker paths.",
            },
            {
              title: "Marvel & DC",
              icon: "🦸",
              desc: "Heroes, villains, secret identities, multiverses, and cosmic threats.",
            },
          ].map((fandom) => (
            <Link
              key={fandom.title}
              href="/browse"
              className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition-all hover:-translate-y-1 hover:border-orange-500/50 hover:bg-slate-900/90"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/15 text-2xl group-hover:scale-110 transition-transform">
                {fandom.icon}
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-orange-400 transition-colors">
                  {fandom.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{fandom.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 5: BROWSE BY GENRE (WIDGET 5)                          */}
      {/* ============================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-purple-500/40 bg-purple-500/15 text-xs">
              🧬
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-white">
              BROWSE BY GENRE
            </span>
          </div>

          <Link href="/browse" className="text-xs font-bold text-slate-300 hover:text-orange-400 flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:grid-cols-8">
          {[
            { name: "Fantasy", icon: "🐉", color: "from-purple-500/20" },
            { name: "Science Fiction", icon: "🛸", color: "from-sky-500/20" },
            { name: "Romance", icon: "💖", color: "from-pink-500/20" },
            { name: "Action", icon: "⚔️", color: "from-orange-500/20" },
            { name: "Adventure", icon: "📜", color: "from-amber-500/20" },
            { name: "Horror", icon: "🩸", color: "from-red-500/20" },
            { name: "Mystery", icon: "🔎", color: "from-purple-500/20" },
            { name: "Historical", icon: "🏛️", color: "from-blue-500/20" },
          ].map((genre) => (
            <Link
              key={genre.name}
              href="/browse"
              className="group relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center transition-all hover:-translate-y-1 hover:border-white/25 hover:bg-slate-900/90 overflow-hidden"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl mb-2 group-hover:scale-110 transition-transform">
                {genre.icon}
              </div>
              <h3 className="text-xs font-extrabold text-white">{genre.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 6: WHY FICFORGE? (WIDGET 6)                            */}
      {/* ============================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-purple-500/40 bg-purple-500/15 text-xs">
            💜
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-white">
            WHY FICFORGE?
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="flex items-start gap-5 pt-6 md:pt-0 md:pr-8">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-purple-500/40 bg-purple-500/15 text-2xl shadow-lg shadow-purple-500/10">
              👤
            </div>
            <div>
              <h3 className="text-lg font-black text-purple-300">Creator First</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                We believe creators deserve more. FicForge is built to help writers publish, grow, and keep more control over their stories.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-5 pt-6 md:pt-0 md:px-8">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-500/40 bg-orange-500/15 text-2xl shadow-lg shadow-orange-500/10">
              🎧
            </div>
            <div>
              <h3 className="text-lg font-black text-orange-300">Built for Readers</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Powerful search, smart tags, clean browsing, and a focused reading experience make it easier to find your next obsession.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-5 pt-6 md:pt-0 md:pl-8">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/15 text-2xl shadow-lg shadow-emerald-500/10">
              💬
            </div>
            <div>
              <h3 className="text-lg font-black text-emerald-300">Community Driven</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Join a passionate community of readers and writers. Share, discuss, support creators, and grow together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 7: POWERFUL FEATURES (WIDGET 7)                        */}
      {/* ============================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-sky-500/40 bg-sky-500/15 text-xs">
            ⚙️
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-white">
            POWERFUL FEATURES
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Advanced Tagging", desc: "Find exactly what you want to read with deep relationship and genre filters.", icon: "🏷️" },
            { title: "Sparks System", desc: "Support creators, unlock content, and earn reading streak rewards.", icon: "⭐" },
            { title: "Fast Pass", desc: "Read ahead of the crowd with optional Fast Pass access on original webnovels.", icon: "⚡" },
            { title: "Achievements", desc: "Earn reading milestone badges and show off your journey in the community.", icon: "🏆" },
            { title: "Custom Profiles", desc: "Personalize your profile with author badges, bio links, and custom frames.", icon: "🪪" },
            { title: "Active Community", desc: "Chapter-end reviews, author updates, and real-time theory discussions.", icon: "💬" },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">{feature.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 8: MEMBERSHIPS PREVIEW (WIDGET 8)                      */}
      {/* ============================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-black tracking-wider text-[#F97316] uppercase mb-3">
            PREMIUM MEMBERSHIPS
          </span>
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Support FicForge and get more from the platform.
          </h2>
          <p className="mt-2 max-w-2xl text-base text-slate-300">
            Premium members receive monthly Sparks, bonus Sparks, an ad-free experience, profile status, priority support, and early access to new platform features.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Tier 1 */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <div>
              <span className="rounded-full border border-indigo-500/40 bg-indigo-500/20 px-3 py-1 text-[11px] font-black uppercase text-indigo-300">
                Reader
              </span>
              <h3 className="mt-4 text-2xl font-black text-white">Reader</h3>
              <div className="mt-2 text-3xl font-black text-white">
                $4.99 <span className="text-xs text-slate-400 font-bold">/ month</span>
              </div>
              <div className="mt-2 text-sm font-bold text-orange-400">400 monthly Sparks</div>
              <div className="text-xs text-purple-300 font-bold mb-4">+200 bonus · 600 total</div>
              <ul className="space-y-2 text-xs text-slate-300 border-t border-white/10 pt-4">
                <li>✓ 100% Ad-free experience</li>
                <li>✓ Reader Supporter badge</li>
                <li>✓ Reading list tools</li>
                <li>✓ Member-only updates</li>
              </ul>
            </div>
            <Link
              href="/premium"
              className="mt-6 block rounded-xl border border-white/15 bg-slate-950/60 py-3 text-center text-xs font-black text-white hover:bg-white/10"
            >
              View Reader
            </Link>
          </div>

          {/* Tier 2 */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <div>
              <span className="rounded-full border border-indigo-500/40 bg-indigo-500/20 px-3 py-1 text-[11px] font-black uppercase text-indigo-300">
                Supporter
              </span>
              <h3 className="mt-4 text-2xl font-black text-white">Supporter</h3>
              <div className="mt-2 text-3xl font-black text-white">
                $9.99 <span className="text-xs text-slate-400 font-bold">/ month</span>
              </div>
              <div className="mt-2 text-sm font-bold text-orange-400">800 monthly Sparks</div>
              <div className="text-xs text-purple-300 font-bold mb-4">+200 bonus · 1,000 total</div>
              <ul className="space-y-2 text-xs text-slate-300 border-t border-white/10 pt-4">
                <li>✓ 100% Ad-free experience</li>
                <li>✓ Supporter badge upgrade</li>
                <li>✓ Profile accent or border</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
            <Link
              href="/premium"
              className="mt-6 block rounded-xl border border-white/15 bg-slate-950/60 py-3 text-center text-xs font-black text-white hover:bg-white/10"
            >
              View Supporter
            </Link>
          </div>

          {/* Tier 3: Featured */}
          <div className="flex flex-col justify-between rounded-2xl border border-orange-500/50 bg-gradient-to-b from-orange-500/10 to-slate-900/90 p-6 shadow-xl shadow-orange-500/10 relative">
            <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-[10px] font-black uppercase text-white shadow-md">
              Most Popular
            </span>
            <div>
              <span className="rounded-full border border-orange-500/50 bg-orange-500/20 px-3 py-1 text-[11px] font-black uppercase text-orange-300">
                Forge Plus
              </span>
              <h3 className="mt-4 text-2xl font-black text-white">Forge Plus</h3>
              <div className="mt-2 text-3xl font-black text-white">
                $14.99 <span className="text-xs text-slate-400 font-bold">/ month</span>
              </div>
              <div className="mt-2 text-sm font-bold text-orange-400">1,300 monthly Sparks</div>
              <div className="text-xs text-purple-300 font-bold mb-4">+200 bonus · 1,500 total</div>
              <ul className="space-y-2 text-xs text-slate-300 border-t border-white/10 pt-4">
                <li>✓ 100% Ad-free experience</li>
                <li>✓ Forge Plus badge & flair</li>
                <li>✓ Enhanced profile styling</li>
                <li>✓ Beta feature early access</li>
              </ul>
            </div>
            <Link
              href="/premium"
              className="mt-6 block rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] py-3 text-center text-xs font-black text-white shadow-lg shadow-orange-500/25 hover:from-[#EA580C] hover:to-[#F97316]"
            >
              Join Forge Plus
            </Link>
          </div>

          {/* Tier 4 */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-6">
            <div>
              <span className="rounded-full border border-indigo-500/40 bg-indigo-500/20 px-3 py-1 text-[11px] font-black uppercase text-indigo-300">
                Elite
              </span>
              <h3 className="mt-4 text-2xl font-black text-white">Forge Elite</h3>
              <div className="mt-2 text-3xl font-black text-white">
                $20.99 <span className="text-xs text-slate-400 font-bold">/ month</span>
              </div>
              <div className="mt-2 text-sm font-bold text-orange-400">1,900 monthly Sparks</div>
              <div className="text-xs text-purple-300 font-bold mb-4">+400 bonus · 2,300 total</div>
              <ul className="space-y-2 text-xs text-slate-300 border-t border-white/10 pt-4">
                <li>✓ 100% Ad-free experience</li>
                <li>✓ Forge Elite badge & crown</li>
                <li>✓ Highest priority support</li>
                <li>✓ Major feature early access</li>
              </ul>
            </div>
            <Link
              href="/premium"
              className="mt-6 block rounded-xl border border-white/15 bg-slate-950/60 py-3 text-center text-xs font-black text-white hover:bg-white/10"
            >
              View Forge Elite
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-xs text-slate-400 leading-relaxed">
          <strong className="text-white">Premium is not paid fanfiction access.</strong> Fanfiction chapters remain 100% free to read and cannot be locked, sold, Fast Passed, or offered as paid early access. Premium supports the platform and provides reading convenience tools.
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 9: FINAL CALL TO ACTION (WIDGET 9)                     */}
      {/* ============================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 mb-12">
        <div className="relative rounded-3xl border border-white/15 bg-gradient-to-br from-[#111827] via-[#0B1220] to-[#111827] p-10 text-center sm:p-16 shadow-2xl overflow-hidden">
          <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-gradient-to-r from-orange-500/25 to-indigo-500/25 blur-3xl" />

          <span className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-black tracking-wider text-[#F97316] uppercase mb-4">
            JOIN THE FORGE
          </span>

          <h2 className="mx-auto max-w-2xl text-3xl font-black text-white sm:text-5xl leading-tight">
            Start Reading. Start Writing. Start Forging Worlds.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base text-slate-300">
            FicForge is being built for readers, writers, fandoms, and original worlds. Join early and become part of the founding community shaping what comes next.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/browse"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB]"
            >
              Start Reading
            </Link>
            <Link
              href="/write"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white hover:border-[#F97316] hover:text-[#F97316]"
            >
              Become a Writer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
