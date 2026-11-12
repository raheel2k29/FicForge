import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#030712] text-white">
      <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6D5DFB] via-[#9333EA] to-[#F97316] text-xl shadow-lg shadow-purple-900/30 group-hover:scale-105 transition-transform">
                🔥
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Fic<span className="text-[#F97316]">Forge</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              A story-first home for fanfiction, original serialized webnovels, readers, writers, and the worlds they love. Built with creator ownership and distraction-free reading at heart.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-[#F97316]">
                ✦ 100% Free Fanfiction
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-[#A78BFA]">
                ✦ Creator-First Platform
              </span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-3">
            
            {/* Explore */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                Explore
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/browse" className="text-slate-400 hover:text-white transition-colors">
                    Browse Stories
                  </Link>
                </li>
                <li>
                  <Link href="/premium" className="text-slate-400 hover:text-[#F97316] transition-colors">
                    Memberships
                  </Link>
                </li>
                <li>
                  <Link href="/library" className="text-slate-400 hover:text-white transition-colors">
                    Saved Library
                  </Link>
                </li>
              </ul>
            </div>

            {/* Creators */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                Creators
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/write" className="text-slate-400 hover:text-white transition-colors">
                    Creator Studio
                  </Link>
                </li>
                <li>
                  <Link href="/my-stories" className="text-slate-400 hover:text-white transition-colors">
                    My Stories
                  </Link>
                </li>
                <li>
                  <Link href="/creator-earnings" className="text-slate-400 hover:text-white transition-colors">
                    Earnings & Vault
                  </Link>
                </li>
                <li>
                  <Link href="/creator-payout-faq" className="text-slate-400 hover:text-white transition-colors">
                    Payout FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community & Support */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                Community
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/community" className="text-slate-400 hover:text-white transition-colors">
                    Community Hub
                  </Link>
                </li>
                <li>
                  <Link href="/help-center" className="text-slate-400 hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/sparks-faq" className="text-slate-400 hover:text-white transition-colors">
                    Sparks FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-slate-400 hover:text-white transition-colors">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal & Safety */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                Legal & Safety
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/terms-of-service" className="text-slate-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/content-policy" className="text-slate-400 hover:text-white transition-colors">
                    Content Policy
                  </Link>
                </li>
                <li>
                  <Link href="/dmca-policy" className="text-slate-400 hover:text-white transition-colors">
                    DMCA & Copyright
                  </Link>
                </li>
                <li>
                  <Link href="/moderation-appeals" className="text-slate-400 hover:text-white transition-colors">
                    Appeals
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/10 pt-8 sm:flex sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © 2026 FicForge. All rights reserved. Transformative fanworks are published freely by their creators. Original works are copyright their respective authors.
          </p>
          <p className="mt-4 text-xs font-semibold text-slate-400 sm:mt-0">
            Forged for readers and writers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
