import Link from "next/link";
import HomeFeaturedStories from "@/components/HomeFeaturedStories";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050B16] text-white overflow-hidden">

      {/* ===== Hero Section (Widgets 1 & 2) ===== */}
      <section className="ficforge-hero-section">
        <div className="ficforge-hero-wrapper">
          <div className="ficforge-hero-copy">
  <div className="ficforge-hero-badge">FOR READERS & WRITERS</div>

  <h1>
    Where Stories<br />
    Are Forged.
  </h1>

  <p>
    Discover unforgettable fanfiction and original fiction, or publish your own stories in a community built for readers, writers, and the worlds they love.
  </p>

  <div className="ficforge-hero-buttons">
    <a className="ficforge-primary-btn" href="/browse">Start Reading</a>
    <a className="ficforge-secondary-btn" href="/write">Start Writing</a>
  </div>
</div>
          <div className="ficforge-hero-visual">
  <div className="ficforge-glow"></div>

  <div className="ficforge-main-card">
    <div className="ficforge-card-top">
      <span>🔥 Featured World</span>
      <span>4.9 ★</span>
    </div>

    <div className="ficforge-book-window">
      <div className="ficforge-book-icon">📖</div>
      <div className="ficforge-flame-icon">🔥</div>
    </div>

    <div className="ficforge-card-content">
      <h3>The Ember Archive</h3>
      <p>A rising collection of original fiction, fanfiction, and worlds waiting to be discovered.</p>

      <div className="ficforge-card-stats">
        <span>96K Reads</span>
        <span>24 Chapters</span>
        <span>Ongoing</span>
      </div>
    </div>
  </div>

  <div className="ficforge-floating-card ficforge-card-one">
    <strong>Fantasy</strong>
    <span>Kingdoms, magic, legends</span>
  </div>

  <div className="ficforge-floating-card ficforge-card-two">
    <strong>Fanfiction</strong>
    <span>Stories built from worlds you love</span>
  </div>
</div>
        </div>
      </section>


      {/* ===== Widget 3: Live Featured Stories ===== */}
      <HomeFeaturedStories />
  

      {/* ===== Widget 4 ===== */}
      <section className="ficforge-fandom-section">
  <div className="ficforge-fandom-header">
    <span className="ficforge-section-label">EXPLORE WORLDS</span>
    <h2>Browse by Fandom</h2>
    <p>Find stories inspired by the worlds, characters, and universes readers already love.</p>
  </div>

  <div className="ficforge-fandom-grid">
    <a className="ficforge-fandom-card" href="/browse">
      <span className="ficforge-fandom-icon">🚀</span>
      <div>
        <h3>Star Wars</h3>
        <p>Galactic wars, Jedi, Sith, clones, empires, and alternate timelines.</p>
      </div>
    </a>

    <a className="ficforge-fandom-card" href="/browse">
      <span className="ficforge-fandom-icon">🐉</span>
      <div>
        <h3>Game of Thrones</h3>
        <p>Houses, crowns, dragons, war, intrigue, and kingdom-building.</p>
      </div>
    </a>

    <a className="ficforge-fandom-card" href="/browse">
      <span className="ficforge-fandom-icon">🍥</span>
      <div>
        <h3>Naruto</h3>
        <p>Shinobi worlds, clans, bloodlines, villages, and rewritten destinies.</p>
      </div>
    </a>

    <a className="ficforge-fandom-card" href="/browse">
      <span className="ficforge-fandom-icon">🏴‍☠️</span>
      <div>
        <h3>One Piece</h3>
        <p>Pirates, Marines, Devil Fruits, grand voyages, and rising legends.</p>
      </div>
    </a>

    <a className="ficforge-fandom-card" href="/browse">
      <span className="ficforge-fandom-icon">🪄</span>
      <div>
        <h3>Harry Potter</h3>
        <p>Magic schools, ancient houses, hidden families, and darker paths.</p>
      </div>
    </a>

    <a className="ficforge-fandom-card" href="/browse">
      <span className="ficforge-fandom-icon">🦸</span>
      <div>
        <h3>Marvel & DC</h3>
        <p>Heroes, villains, secret identities, multiverses, and cosmic threats.</p>
      </div>
    </a>
  </div>
</section>
  

      {/* ===== Widget 5 ===== */}
      <section className="ficforge-genre-strip">
  <div className="ficforge-genre-top">
    <div className="ficforge-genre-title">
      <span className="ficforge-genre-title-icon">🧬</span>
      <span>BROWSE BY GENRE</span>
    </div>

    <a className="ficforge-genre-view" href="/browse">View All →</a>
  </div>

  <div className="ficforge-genre-row">
    <a className="ficforge-genre-mini fantasy" href="/browse">
      <div className="ficforge-genre-icon">🐉</div>
      <h3>Fantasy</h3>
      <p></p>
    </a>

    <a className="ficforge-genre-mini scifi" href="/browse">
      <div className="ficforge-genre-icon">🛸</div>
      <h3>Science Fiction</h3>
      <p></p>
    </a>

    <a className="ficforge-genre-mini romance" href="/browse">
      <div className="ficforge-genre-icon">💖</div>
      <h3>Romance</h3>
      <p></p>
    </a>

    <a className="ficforge-genre-mini action" href="/browse">
      <div className="ficforge-genre-icon">⚔️</div>
      <h3>Action</h3>
      <p></p>
    </a>

    <a className="ficforge-genre-mini adventure" href="/browse">
      <div className="ficforge-genre-icon">📜</div>
      <h3>Adventure</h3>
      <p></p>
    </a>

    <a className="ficforge-genre-mini horror" href="/browse">
      <div className="ficforge-genre-icon">🩸</div>
      <h3>Horror</h3>
      <p></p>
    </a>

    <a className="ficforge-genre-mini mystery" href="/browse">
      <div className="ficforge-genre-icon">🔎</div>
      <h3>Mystery</h3>
      <p></p>
    </a>

    <a className="ficforge-genre-mini historical" href="/browse">
      <div className="ficforge-genre-icon">🏛️</div>
      <h3>Historical</h3>
      <p></p>
    </a>
  </div>
</section>
  

      {/* ===== Widget 6 ===== */}
      <section className="ficforge-why-strip">
  <div className="ficforge-why-title">
    <span className="ficforge-why-title-icon">💜</span>
    <span>WHY FICFORGE?</span>
  </div>

  <div className="ficforge-why-row">
    <div className="ficforge-why-item">
      <div className="ficforge-why-icon purple">👤</div>
      <div className="ficforge-why-copy">
        <h3>Creator First</h3>
        <p>
          We believe creators deserve more. FicForge is built to help writers publish, grow, and keep more control over their stories.
        </p>
      </div>
    </div>

    <div className="ficforge-why-item">
      <div className="ficforge-why-icon orange">🎧</div>
      <div className="ficforge-why-copy">
        <h3>Built for Readers</h3>
        <p>
          Powerful search, smart tags, clean browsing, and a focused reading experience make it easier to find your next obsession.
        </p>
      </div>
    </div>

    <div className="ficforge-why-item">
      <div className="ficforge-why-icon green">💬</div>
      <div className="ficforge-why-copy">
        <h3>Community Driven</h3>
        <p>
          Join a passionate community of readers and writers. Share, discuss, support creators, and grow together.
        </p>
      </div>
    </div>
  </div>
</section>
  

      {/* ===== Widget 7 ===== */}
      <section className="ficforge-features-strip">
  <div className="ficforge-features-title">
    <span className="ficforge-features-title-icon">⚙️</span>
    <span>POWERFUL FEATURES</span>
  </div>

  <div className="ficforge-features-row">
    <div className="ficforge-feature-item blue">
      <div className="ficforge-feature-icon">🏷️</div>
      <div>
        <h3>Advanced Tagging</h3>
        <p>Find exactly what you want to read.</p>
      </div>
    </div>

    <div className="ficforge-feature-item gold">
      <div className="ficforge-feature-icon">⭐</div>
      <div>
        <h3>Sparks System</h3>
        <p>Support creators, unlock content, and earn rewards.</p>
      </div>
    </div>

    <div className="ficforge-feature-item purple">
      <div className="ficforge-feature-icon">⚡</div>
      <div>
        <h3>Fast Pass</h3>
        <p>Read ahead of the crowd with optional Fast Pass access.</p>
      </div>
    </div>

    <div className="ficforge-feature-item amber">
      <div className="ficforge-feature-icon">🏆</div>
      <div>
        <h3>Achievements</h3>
        <p>Earn badges and show off your journey.</p>
      </div>
    </div>

    <div className="ficforge-feature-item green">
      <div className="ficforge-feature-icon">🪪</div>
      <div>
        <h3>Custom Profiles</h3>
        <p>Personalize your profile with badges and frames.</p>
      </div>
    </div>

    <div className="ficforge-feature-item gray">
      <div className="ficforge-feature-icon">💬</div>
      <div>
        <h3>Active Community</h3>
        <p>Reviews, forums, events, and more ways to connect.</p>
      </div>
    </div>
  </div>
</section>
  

      {/* ===== Widget 8 ===== */}
      <section className="ff-home-memberships">
  

  <span className="ff-label">Premium Memberships</span>
  <h2>Support FicForge & Supercharge Your Journey</h2>
  <p className="ff-section-intro">
    Memberships are engineered for both dedicated readers and ambitious creators — featuring monthly Sparks, an ad-free reading experience, exclusive creator studio tools, formatting plugins, deep analytics, and early access to platform features.
  </p>

  <div className="ff-home-tier-grid">
    <div className="ff-home-tier">
      <span className="tier-tag">Reader & Creator Starter</span>
      <h3>Reader</h3>
      <div className="ff-home-price">$4.99 <span>/ month</span></div>
      <div className="ff-home-sparks">400 monthly Sparks</div>
      <div className="ff-home-bonus">+200 bonus · 600 total</div>
      <p>For dedicated readers and hobby creators seeking an elevated experience.</p>
      <ul>
        <li>100% Ad-free reading experience</li>
        <li>Reader Supporter badge & profile flair</li>
        <li>Unlimited custom reading lists</li>
        <li>Basic Creator Studio (up to 3 story drafts)</li>
        <li>Member-only community roadmap polls</li>
      </ul>
      <a href="/premium">View Reader</a>
    </div>

    <div className="ff-home-tier">
      <span className="tier-tag">Supporter & Emerging Writer</span>
      <h3>Supporter</h3>
      <div className="ff-home-price">$9.99 <span>/ month</span></div>
      <div className="ff-home-sparks">800 monthly Sparks</div>
      <div className="ff-home-bonus">+200 bonus · 1,000 total</div>
      <p>For active readers and developing authors who publish regularly.</p>
      <ul>
        <li>100% Ad-free reading experience</li>
        <li>Supporter badge upgrade & custom profile accent</li>
        <li>Unlimited story drafts & scheduled releases</li>
        <li>Custom scene break dividers & chapter decor</li>
        <li>Priority reader & author support</li>
        <li>Creator discovery & spotlight voting</li>
      </ul>
      <a href="/premium">View Supporter</a>
    </div>

    <div className="ff-home-tier featured">
      <span className="tier-tag">Pro Creator & Reader (Best Balance)</span>
      <h3>Forge Plus</h3>
      <div className="ff-home-price">$14.99 <span>/ month</span></div>
      <div className="ff-home-sparks">1,300 monthly Sparks</div>
      <div className="ff-home-bonus">+200 bonus · 1,500 total</div>
      <p>Unlocks advanced creator tools, bulk publishing, and analytics not available to free accounts.</p>
      <ul>
        <li>100% Ad-free reading experience</li>
        <li>Forge Plus badge & animated profile banner</li>
        <li><strong>Smart Bulk Chapter Importer (.docx / .txt)</strong></li>
        <li><strong>Readership Analytics Plugin (retention & drop-offs)</strong></li>
        <li><strong>Custom Story Styling Plugin (fonts & chapter drop-caps)</strong></li>
        <li>Boosted discovery in trending & recommended algorithms</li>
        <li>Beta access to all new creator plugins</li>
      </ul>
      <a href="/premium">View Forge Plus</a>
    </div>

    <div className="ff-home-tier">
      <span className="tier-tag">VIP Creator & Elite Supporter</span>
      <h3>Forge Elite</h3>
      <div className="ff-home-price">$20.99 <span>/ month</span></div>
      <div className="ff-home-sparks">1,900 monthly Sparks</div>
      <div className="ff-home-bonus">+400 bonus · 2,300 total</div>
      <p>For top-tier serialized creators and elite supporters commanding the platform.</p>
      <ul>
        <li>100% Ad-free VIP experience</li>
        <li>Prestigious Forge Elite Gold badge & frame</li>
        <li><strong>Full Creator Plugin Ecosystem Access</strong></li>
        <li><strong>Advanced Bulk Auto-Splitter & Batch Publishing Pro</strong></li>
        <li><strong>Fast Pass Monetization Analytics & Revenue Forecasts</strong></li>
        <li>Priority eligibility for Homepage Carousel & Editor's Picks</li>
        <li>VIP 1-on-1 fast-track creator support line</li>
      </ul>
      <a href="/premium">View Forge Elite</a>
    </div>
  </div>

  <div className="ff-home-membership-note">
    <strong>Premium is not paid fanfiction access.</strong>
    Fanfiction chapters remain free to read and cannot be locked, sold, Fast Passed, or offered as paid early access. Premium supports FicForge and provides platform benefits.
  </div>
</section>
  

      {/* ===== Widget 9 ===== */}
      <section className="ficforge-final-cta">
  <div className="ficforge-final-cta-inner">
    <div className="ficforge-final-glow"></div>

    <span className="ficforge-final-label">JOIN THE FORGE</span>

    <h2>Start Reading. Start Writing. Start Forging Worlds.</h2>

    <p>
      FicForge is being built for readers, writers, fandoms, and original worlds. Join early and become part of the founding community shaping what comes next.
    </p>

    <div className="ficforge-final-buttons">
      <a className="ficforge-final-primary" href="/browse">Start Reading</a>
      <a className="ficforge-final-secondary" href="/write">Become a Writer</a>
    </div>
  </div>
</section>
  
    </div>
  );
}
