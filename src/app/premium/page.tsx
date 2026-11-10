import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Memberships & Creator Tools — FicForge",
  description: "FicForge Premium Memberships — Ad-free reading, monthly Sparks, and exclusive tools and plugins for creators.",
};

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-[#050B16] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1180px] mx-auto">
        
        {/* Hero Section */}
        <div className="max-w-3xl mb-12">
          <span className="inline-flex items-center text-xs font-black tracking-widest uppercase text-[#F97316] bg-orange-500/10 border border-orange-500/30 rounded-full px-3.5 py-1.5 mb-5">
            FicForge Memberships
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Built for Readers. Powered for Creators.
          </h1>
          <p className="mt-4 text-lg text-slate-300 leading-relaxed">
            Upgrade your FicForge experience with monthly Sparks, an ad-free reading experience, exclusive creator studio tools, formatting plugins, deep analytics, and early access to new platform features.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="#membership-tiers"
              className="rounded-lg bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/30 hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all"
            >
              View Membership Tiers
            </a>
            <a
              href="#sparks-store"
              className="rounded-lg border border-white/20 bg-slate-900/80 px-6 py-3 text-sm font-extrabold text-white hover:border-[#F97316] hover:text-[#F97316] transition-all"
            >
              Buy Sparks Separately
            </a>
          </div>
        </div>

        {/* Creator Tools & Plugins Spotlight Banner */}
        <div className="mb-14 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-orange-950/30 p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#A78BFA]">
                ✦ Creator Advantage
              </span>
              <h3 className="mt-2 text-2xl font-black text-white">
                Looking to publish on FicForge?
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                Premium memberships are not just for readers — they unlock our **Creator Suite & Plugins**: the Smart Bulk Importer, deep Readership Analytics, custom story styling, and priority discovery algorithms that free accounts cannot access.
              </p>
            </div>
            <a
              href="#membership-tiers"
              className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-black text-slate-950 shadow-md hover:bg-slate-200 transition-all"
            >
              Explore Creator Perks ↓
            </a>
          </div>
        </div>

        {/* 4 Membership Tiers Grid */}
        <div id="membership-tiers" className="mb-20">
          <div className="mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-[#F97316]">
              Choose Your Tier
            </span>
            <h2 className="mt-2 text-3xl font-black text-white">
              Platform Membership Plans
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Memberships renew monthly via secure PayPal Subscriptions. Cancel anytime with one click.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Tier 1: Reader */}
            <div className="relative flex flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl transition-transform hover:-translate-y-1">
              <span className="inline-flex w-fit rounded-full border border-purple-500/40 bg-purple-500/20 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-purple-200">
                Reader & Starter
              </span>
              <h3 className="mt-3 text-2xl font-black text-white">Reader</h3>
              <div className="mt-3 text-4xl font-black text-white">
                $4.99 <span className="text-xs font-bold text-slate-400">/ month</span>
              </div>
              <div className="mt-2 text-sm font-black text-[#F97316]">
                400 monthly Sparks
              </div>
              <div className="text-xs font-bold text-[#A78BFA]">
                +200 bonus monthly · 600 total
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                For readers who want basic supporter perks and a recurring Spark stipend.
              </p>

              <div className="my-5 h-px bg-white/10" />

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>100% Ad-Free reading experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>Reader Supporter badge & profile flair</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>Unlimited custom reading lists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>Basic Creator Studio (up to 3 drafts)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>Member-only platform update polls</span>
                </li>
              </ul>

              <a
                href="/write"
                className="mt-auto block w-full rounded-xl border border-white/10 bg-slate-800/80 py-3 text-center text-xs font-black text-white hover:bg-slate-700 transition-all"
              >
                Join Reader
              </a>
            </div>

            {/* Tier 2: Supporter */}
            <div className="relative flex flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl transition-transform hover:-translate-y-1">
              <span className="inline-flex w-fit rounded-full border border-purple-500/40 bg-purple-500/20 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-purple-200">
                Supporter & Writer
              </span>
              <h3 className="mt-3 text-2xl font-black text-white">Supporter</h3>
              <div className="mt-3 text-4xl font-black text-white">
                $9.99 <span className="text-xs font-bold text-slate-400">/ month</span>
              </div>
              <div className="mt-2 text-sm font-black text-[#F97316]">
                800 monthly Sparks
              </div>
              <div className="text-xs font-bold text-[#A78BFA]">
                +200 bonus monthly · 1,000 total
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                For active readers and developing authors publishing regular stories.
              </p>

              <div className="my-5 h-px bg-white/10" />

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>100% Ad-Free reading experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>Supporter badge upgrade & custom border</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>Unlimited story drafts & scheduled releases</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>Scene break divider formatting tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>Priority customer & creator support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>Creator discovery & spotlight voting</span>
                </li>
              </ul>

              <a
                href="/write"
                className="mt-auto block w-full rounded-xl border border-white/10 bg-slate-800/80 py-3 text-center text-xs font-black text-white hover:bg-slate-700 transition-all"
              >
                Join Supporter
              </a>
            </div>

            {/* Tier 3: Forge Plus (FEATURED) */}
            <div className="relative flex flex-col rounded-2xl border-2 border-[#F97316] bg-gradient-to-b from-orange-950/20 via-slate-900/90 to-slate-900 p-6 shadow-2xl shadow-orange-500/10 transition-transform hover:-translate-y-1">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                  Most Popular · Creator Pick
                </span>
              </div>

              <span className="mt-2 inline-flex w-fit rounded-full border border-orange-500/40 bg-orange-500/20 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-orange-200">
                Pro Creator & Super Reader
              </span>
              <h3 className="mt-3 text-2xl font-black text-white">Forge Plus</h3>
              <div className="mt-3 text-4xl font-black text-white">
                $14.99 <span className="text-xs font-bold text-slate-400">/ month</span>
              </div>
              <div className="mt-2 text-sm font-black text-[#F97316]">
                1,300 monthly Sparks
              </div>
              <div className="text-xs font-bold text-[#A78BFA]">
                +200 bonus monthly · 1,500 total
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Unlocks professional creator tools, bulk chapter publishing, and reader analytics.
              </p>

              <div className="my-5 h-px bg-white/10" />

              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>100% Ad-Free reading experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>Forge Plus badge & animated banner</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">★</span>
                  <span className="font-bold text-white">Smart Bulk Chapter Importer (.docx / .txt)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">★</span>
                  <span className="font-bold text-white">Readership Analytics Plugin (retention/drop-off)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">★</span>
                  <span className="font-bold text-white">Custom Story Styling Plugin (decor & drop-caps)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>Boosted discovery in trending algorithm</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>Beta access to all new creator plugins</span>
                </li>
              </ul>

              <a
                href="/write"
                className="mt-auto block w-full rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] py-3 text-center text-xs font-black text-white shadow-lg shadow-orange-600/30 hover:from-[#EA580C] hover:to-[#C2410C] transition-all"
              >
                Join Forge Plus
              </a>
            </div>

            {/* Tier 4: Forge Elite */}
            <div className="relative flex flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-xl transition-transform hover:-translate-y-1">
              <span className="inline-flex w-fit rounded-full border border-amber-500/40 bg-amber-500/20 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-amber-200">
                VIP Creator & Patron
              </span>
              <h3 className="mt-3 text-2xl font-black text-white">Forge Elite</h3>
              <div className="mt-3 text-4xl font-black text-white">
                $20.99 <span className="text-xs font-bold text-slate-400">/ month</span>
              </div>
              <div className="mt-2 text-sm font-black text-[#F97316]">
                1,900 monthly Sparks
              </div>
              <div className="text-xs font-bold text-[#A78BFA]">
                +400 bonus monthly · 2,300 total
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                For top-tier serialized creators and elite patrons commanding the platform.
              </p>

              <div className="my-5 h-px bg-white/10" />

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>100% Ad-Free VIP experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>Prestigious Forge Elite Gold badge & frame</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">★</span>
                  <span className="font-bold text-white">Full Creator Plugin Ecosystem Access</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">★</span>
                  <span className="font-bold text-white">Advanced Auto-Splitter & Batch Publish Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">★</span>
                  <span className="font-bold text-white">Fast Pass Monetization & Revenue Forecasts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>Homepage Carousel & Spotlight Eligibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F97316] font-black">✓</span>
                  <span>VIP 1-on-1 fast-track creator support</span>
                </li>
              </ul>

              <a
                href="/write"
                className="mt-auto block w-full rounded-xl border border-white/10 bg-slate-800/80 py-3 text-center text-xs font-black text-white hover:bg-slate-700 transition-all"
              >
                Join Forge Elite
              </a>
            </div>

          </div>
        </div>

        {/* Sparks Storefront Packages */}
        <div id="sparks-store" className="mb-20">
          <div className="mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-[#F97316]">
              Sparks Storefront
            </span>
            <h2 className="mt-2 text-3xl font-black text-white">
              Buy Sparks Packages
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Sparks can be used for tipping creators on their profiles and unlocking Fast Pass chapters on eligible original webnovels.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            
            {/* Starter: 100 Sparks */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-lg">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Starter Pack
              </span>
              <h4 className="mt-2 text-xl font-black text-white">100 Sparks</h4>
              <div className="mt-2 text-3xl font-black text-white">$0.99</div>
              <p className="mt-2 text-xs text-slate-400">Baseline testing pack.</p>
              <button
                type="button"
                className="mt-auto block w-full rounded-xl bg-slate-800 py-2.5 text-center text-xs font-black text-white hover:bg-slate-700 transition-all"
              >
                Buy for $0.99
              </button>
            </div>

            {/* Standard: 1,000 Sparks */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-lg">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Casual
              </span>
              <h4 className="mt-2 text-xl font-black text-white">1,000 Sparks</h4>
              <div className="mt-2 text-3xl font-black text-white">$9.99</div>
              <p className="mt-2 text-xs text-slate-400">Everyday reading & tips.</p>
              <button
                type="button"
                className="mt-auto block w-full rounded-xl bg-slate-800 py-2.5 text-center text-xs font-black text-white hover:bg-slate-700 transition-all"
              >
                Buy for $9.99
              </button>
            </div>

            {/* Supporter: 5,000 (+600 bonus = 5,600) */}
            <div className="flex flex-col rounded-2xl border-2 border-orange-500/60 bg-gradient-to-b from-orange-950/30 to-slate-900 p-5 shadow-xl">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#F97316]">
                Popular Value
              </span>
              <h4 className="mt-2 text-xl font-black text-white">5,000 Sparks</h4>
              <div className="mt-2 text-3xl font-black text-white">$49.99</div>
              <div className="mt-1 text-xs font-black text-[#A78BFA]">+600 Bonus Sparks (5,600 total)</div>
              <button
                type="button"
                className="mt-auto block w-full rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] py-2.5 text-center text-xs font-black text-white shadow-md hover:from-[#EA580C] hover:to-[#C2410C] transition-all"
              >
                Buy for $49.99
              </button>
            </div>

            {/* Power: 8,000 (+1,200 bonus = 9,200) */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-lg">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Power Reader
              </span>
              <h4 className="mt-2 text-xl font-black text-white">8,000 Sparks</h4>
              <div className="mt-2 text-3xl font-black text-white">$79.99</div>
              <div className="mt-1 text-xs font-bold text-[#A78BFA]">+1,200 Bonus (9,200 total)</div>
              <button
                type="button"
                className="mt-auto block w-full rounded-xl bg-slate-800 py-2.5 text-center text-xs font-black text-white hover:bg-slate-700 transition-all"
              >
                Buy for $79.99
              </button>
            </div>

            {/* Elite Patron: 15,000 (+2,800 bonus = 17,800) */}
            <div className="flex flex-col rounded-2xl border border-purple-500/40 bg-slate-900/80 p-5 shadow-lg">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#A78BFA]">
                Patron Pack
              </span>
              <h4 className="mt-2 text-xl font-black text-white">15,000 Sparks</h4>
              <div className="mt-2 text-3xl font-black text-white">$124.99</div>
              <div className="mt-1 text-xs font-black text-purple-300">+2,800 Bonus (17,800 total)</div>
              <button
                type="button"
                className="mt-auto block w-full rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#7C3AED] py-2.5 text-center text-xs font-black text-white hover:from-[#5B4BE0] hover:to-[#6D5DFB] transition-all"
              >
                Buy for $124.99
              </button>
            </div>

          </div>
        </div>

        {/* Compliance Guarantee */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-8 text-center text-sm text-slate-400">
          <strong className="block text-base font-bold text-white mb-2">
            Fanfiction Protection & Safe Harbor Guarantee
          </strong>
          Fanfiction chapters on FicForge are always 100% free to read and cannot be locked, sold, Fast Passed, or placed behind paid tiers. Memberships and Sparks support the platform infrastructure, host creator tools and plugins, and empower independent writers.
        </div>

      </div>
    </div>
  );
}
