import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#050B16]">
      <div className="ff-home-footer">
  <div className="ff-home-footer-top">
    <div className="ff-home-footer-brand">
      <h2>🔥 FicForge</h2>
      <p>A home for fanfiction, original fiction, readers, writers, and the worlds they love.</p>
    </div>

    <div className="ff-home-footer-links">
      <div>
        <h4>Explore</h4>
        <a href="/">Home</a>
        <a href="/browse">Browse</a>
        <a href="/premium">Premium</a>
      </div>

      <div>
        <h4>Write</h4>
        <a href="/write">Start Writing</a>
        <a href="/community">Community</a>
        <a href="/support">Support</a>
      </div>

      <div>
        <h4>Company</h4>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/faq">FAQ</a>
      </div>

      <div>
        <h4>Legal</h4>
        <a href="/terms-of-service">Terms</a>
        <a href="/privacy-policy">Privacy</a>
        <a href="/dmca-policy">DMCA</a>
      </div>
    </div>
  </div>

  <div className="ff-home-footer-bottom">
    <span>© 2026 FicForge. All rights reserved.</span>
    <span>Forged for readers and writers.</span>
  </div>
</div>
    </footer>
  );
}
