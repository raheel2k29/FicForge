import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#020617] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-lg shadow-md shadow-orange-500/20">
                🔥
              </span>
              <span className="text-2xl font-black tracking-tight text-white">
                Fic<span className="text-[#F97316]">Forge</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-slate-300">
              A story-first home for fanfiction, original webnovels, readers, writers, and the worlds they love.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-bold text-orange-400">
              <span>✦</span> The Chapter Sanctuary Standard
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-white transition-colors">
                  Browse Stories
                </Link>
              </li>
              <li>
                <Link href="/premium" className="hover:text-white transition-colors">
                  Premium & Sparks
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white transition-colors">
                  Community Hub
                </Link>
              </li>
              <li>
                <Link href="/library" className="hover:text-white transition-colors">
                  Saved Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Writer Portal */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
              Writers
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <Link href="/write" className="hover:text-white transition-colors">
                  Writer Portal
                </Link>
              </li>
              <li>
                <Link href="/creator/stories" className="hover:text-white transition-colors">
                  My Stories Workroom
                </Link>
              </li>
              <li>
                <Link href="/faq/creator-payouts" className="hover:text-white transition-colors">
                  Creator Payout FAQ
                </Link>
              </li>
              <li>
                <Link href="/faq/sparks" className="hover:text-white transition-colors">
                  Sparks Token Guide
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-white transition-colors">
                  Author Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
              Legal & Support
            </h4>
            <ul className="space-y-2.5 text-sm font-semibold">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About FicForge
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="hover:text-white transition-colors">
                  DMCA & Takedown Portal
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/content-policy" className="hover:text-white transition-colors">
                  Content Rating Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 FicForge. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400 font-medium">
            Forged with fire for readers & authors worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
