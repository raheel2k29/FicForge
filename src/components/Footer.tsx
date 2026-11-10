import Link from "next/link";

export default function Footer() {
  return (
    <footer className="ff-home-footer">
      <div className="ff-home-footer-top">
        <div className="ff-home-footer-brand">
          <h2>🔥 FicForge</h2>
          <p>A home for fanfiction, original fiction, readers, writers, and the worlds they love.</p>
        </div>

        <div className="ff-home-footer-links">
          <div>
            <h4>Explore</h4>
            <Link href="/">Home</Link>
            <Link href="/browse">Browse</Link>
            <Link href="/premium">Premium</Link>
          </div>

          <div>
            <h4>Write</h4>
            <Link href="/write">Start Writing</Link>
            <Link href="/community">Community</Link>
            <Link href="/support">Support</Link>
          </div>

          <div>
            <h4>Company</h4>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/faq">FAQ</Link>
          </div>

          <div>
            <h4>Legal</h4>
            <Link href="/terms-of-service">Terms</Link>
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/dmca-policy">DMCA</Link>
          </div>
        </div>
      </div>

      <div className="ff-home-footer-bottom">
        <span>© 2026 FicForge. All rights reserved.</span>
        <span>Forged for readers and writers.</span>
      </div>
    </footer>
  );
}
