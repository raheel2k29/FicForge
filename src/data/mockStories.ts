export interface ChapterData {
  number: number;
  slug: string;
  title: string;
  wordCount: number;
  publishedAt: string;
  isFastPass?: boolean;
  fastPassPriceSparks?: number;
  fastPassUnlockAt?: string; // countdown
  topAuthorNote?: string;
  bottomAuthorNote?: string;
  content: string[];
}

export interface StoryData {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  coverImageUrl: string;
  classification: "FANFICTION" | "ORIGINAL";
  fandom?: string;
  genres: string[];
  rating: "GENERAL" | "TEEN" | "MATURE" | "EXPLICIT";
  status: "ONGOING" | "COMPLETED" | "HIATUS";
  author: {
    name: string;
    username: string;
    avatarUrl: string;
    isVerified: boolean;
    bio: string;
  };
  stats: {
    words: number;
    views: number;
    likes: number;
    bookmarks: number;
    chapterCount: number;
  };
  tags: {
    warnings: string[];
    pairings: string[];
    characters: string[];
    general: string[];
  };
  updatedAt: string;
  chapters: ChapterData[];
}

export const mockStories: Record<string, StoryData> = {
  "the-ember-archive": {
    id: "story-ember-archive",
    title: "The Ember Archive",
    slug: "the-ember-archive",
    synopsis:
      "In a world where memories burn to ash, a lonely cartographer discovers the Ember Spire — a forgotten sanctuary housing the echoes of fallen kingdoms. As the northern frost creeps southward to extinguish the last living fires, she must forge an alliance with an exiled flame-weaver to unlock the ancient script before history itself dissolves into silence.",
    coverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    classification: "ORIGINAL",
    genres: ["Fantasy", "Adventure", "Action"],
    rating: "TEEN",
    status: "ONGOING",
    author: {
      name: "Valerius Frost",
      username: "valerius_f",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      isVerified: true,
      bio: "Forging serialized fiction across high fantasy, space opera, and cyberpunk worlds.",
    },
    stats: {
      words: 96420,
      views: 96240,
      likes: 14850,
      bookmarks: 8420,
      chapterCount: 3,
    },
    tags: {
      warnings: ["Fantasy Violence", "Mild Language"],
      pairings: ["Vael / Saria"],
      characters: ["Saria of Oakhaven", "Vaelen the Ashen", "Archivist Thorne"],
      general: ["High Fantasy", "Slow Burn", "Worldbuilding", "Ancient Magic", "Elemental Magic"],
    },
    updatedAt: "2 hours ago",
    chapters: [
      {
        number: 1,
        slug: "chapter-1",
        title: "Ashes of the Spire",
        wordCount: 3820,
        publishedAt: "Oct 24, 2026",
        topAuthorNote: "Welcome to The Ember Archive! Updates every Tuesday & Friday.",
        bottomAuthorNote: "If you enjoyed this chapter, don't forget to bookmark and leave your theories!",
        content: [
          "The ink on Saria’s fingertips had long since stained into the whorls of her skin, indelible as a brand. In the lower scriptorium of the Oakhaven archives, daylight was a luxury measured in the burning rate of tallow candles.",
          "Outside, the First Frost had arrived three weeks ahead of season. It rattled against the leaded stained-glass panes like handfuls of river gravel, frosting the corners with crystalline fronds.",
          "‘You shouldn’t be down here,’ a low voice murmured from the archway. Vael stood in the gloom, his soot-streaked coat smelling of cold wind and cedar smoke.",
        ],
      },
      {
        number: 2,
        slug: "chapter-2",
        title: "The Flame-Weaver’s Oath",
        wordCount: 4150,
        publishedAt: "Nov 1, 2026",
        topAuthorNote: "Chapter 2 is here. Things are starting to heat up in the scriptorium!",
        bottomAuthorNote: "Thank you for reading! Leave a comment to support the story.",
        content: [
          "The crucible stone was colder than iron, yet within its hollow bowl, a solitary cinder pulsed with violet luminescence.",
          "‘Reach out your hand,’ Vael whispered. His eyes, reflective as obsidian beads in the gloom, showed no fear.",
          "Saria hesitated. Her pulse hammered against her collarbone like a trapped moth. ‘If the elders find us here—’",
          "‘The elders are already asleep beneath their wool blankets, convinced the frost can be bargained with,’ Vael interrupted.",
        ],
      },
      {
        number: 3,
        slug: "chapter-3",
        title: "The Salt Flats at Midnight",
        wordCount: 4620,
        publishedAt: "Nov 8, 2026",
        isFastPass: true,
        fastPassPriceSparks: 50,
        fastPassUnlockAt: "Nov 15, 2026 (Unlocked in 4 days)",
        topAuthorNote: "Fast Pass Chapter — Early Access for supporters! Automatically unlocks for free readers in 4 days.",
        bottomAuthorNote: "Thank you to all who supported this chapter via Fast Pass!",
        content: [
          "The night air outside the Spire felt like inhaled needles.",
          "Across the vast expanse of the salt flats, pale blue phosphorescence shimmered along the ridge line — the telltale sign of a vanguard scouting party.",
          "‘Keep your head down and match my stride,’ Vael instructed, his voice barely louder than the dry hiss of wind sweeping across the salt crust. ‘The ground here is brittle. Break the surface, and the brine beneath will freeze your boot to bone in seconds.’",
        ],
      },
    ],
  },
  "star-wars-the-obsidian-blade": {
    id: "story-obsidian-blade",
    title: "Star Wars: The Obsidian Blade",
    slug: "star-wars-the-obsidian-blade",
    synopsis:
      "Centuries before the Skywalker Saga, an ancient dark-side artifact awakens on a forgotten Outer Rim world. A lone Jedi Knight and an exiled scavenger must prevent its obsidian core from fracturing reality.",
    coverImageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    classification: "FANFICTION",
    fandom: "Star Wars",
    genres: ["Sci-Fi", "Action", "Adventure"],
    rating: "GENERAL",
    status: "ONGOING",
    author: {
      name: "Valerius Frost",
      username: "valerius_f",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      isVerified: true,
      bio: "Forging serialized fiction across high fantasy, space opera, and cyberpunk worlds.",
    },
    stats: {
      words: 42100,
      views: 38900,
      likes: 5820,
      bookmarks: 2940,
      chapterCount: 2,
    },
    tags: {
      warnings: ["None"],
      pairings: ["Gen (No Romance)"],
      characters: ["Cal Kestis (Mentioned)", "Inquisitorius", "Original Jedi Knight"],
      general: ["Star Wars Legends", "Outer Rim", "Force Lore", "Lightsaber Combat", "Jedi in Hiding"],
    },
    updatedAt: "1 day ago",
    chapters: [
      {
        number: 1,
        slug: "chapter-1",
        title: "Echoes in the Vapor",
        wordCount: 3100,
        publishedAt: "Oct 20, 2026",
        topAuthorNote: "A transformative Star Wars tale. May the Force be with you!",
        bottomAuthorNote: "Leave a comment with your thoughts and theories!",
        content: [
          "The moisture vaporator sputtered, coughing up a plume of gray smoke that drifted into the bronze haze of the Jelucan afternoon.",
          "Joran wiped grease from his forehead with the back of his sleeve. He hated this planet. He hated the dust that got into the seals of every atmospheric intake, and he hated the endless crimson sunsets that reminded him of the temple burning.",
          "He paused, his senses prickling. Across the salt dunes, the twin suns sank beneath the jagged mesa, casting silhouettes of two approaching speeder bikes.",
        ],
      },
      {
        number: 2,
        slug: "chapter-2",
        title: "The Obsidian Chamber",
        wordCount: 3500,
        publishedAt: "Nov 3, 2026",
        topAuthorNote: "Chapter 2: The deep ruin awakens.",
        bottomAuthorNote: "May the Force be with you!",
        content: [
          "The door groaned on ancient hinges. Inside, the obsidian monolith pulsed with a rhythmic indigo heartbeat that resonated directly through Joran's teeth.",
          "Mara drew her ion blaster, the blue charge indicator humming in the dust-choked air.",
          "‘Don’t shoot,’ Joran whispered, reaching for his lightsaber hilt. ‘The energy in this room isn't mechanical. It’s alive.’",
        ],
      },
    ],
  },
  "cyberpunk-neon-horizon": {
    id: "story-cyberpunk-neon-horizon",
    title: "Cyberpunk: Neon Horizon",
    slug: "cyberpunk-neon-horizon",
    synopsis:
      "In the chrome-drenched spires of New Aethelgard, neural-net hacker Kaelen uncovers a black-market ghost protocol that allows rogue corporate AIs to overwrite human consciousness. With corpo hit-squads closing in, he must forge an uneasy alliance with an augmented street samurai to expose the conspiracy.",
    coverImageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    classification: "ORIGINAL",
    genres: ["Cyberpunk", "Sci-Fi", "Action"],
    rating: "MATURE",
    status: "ONGOING",
    author: {
      name: "Valerius Frost",
      username: "valerius_f",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      isVerified: true,
      bio: "Forging serialized fiction across high fantasy, space opera, and cyberpunk worlds.",
    },
    stats: {
      words: 28400,
      views: 31200,
      likes: 4210,
      bookmarks: 1890,
      chapterCount: 2,
    },
    tags: {
      warnings: ["Cyber Violence", "Coarse Language"],
      pairings: ["Kaelen / Thorne"],
      characters: ["Kaelen Voss", "Thorne 04", "Nyx"],
      general: ["Cyberpunk", "Artificial Intelligence", "Neon Noir", "High Tech Low Life"],
    },
    updatedAt: "3 days ago",
    chapters: [
      {
        number: 1,
        slug: "chapter-1",
        title: "Glitch in the Rain",
        wordCount: 2950,
        publishedAt: "Nov 5, 2026",
        topAuthorNote: "Welcome to Neon Horizon. Strap in for high-velocity cyberpunk.",
        bottomAuthorNote: "Support the story with a comment!",
        content: [
          "The rain in Sector 4 tasted like battery acid and burnt ozone. Kaelen pulled his synth-leather collar higher against the drizzle, eyes scanning the bioluminescent billboards flashing above the alleyway.",
          "His neural deck vibrated against his ribs. A packet of encrypted military telemetry had just pinged his port — unsigned, unrouted, and originating from inside the Arasaka-Vane sub-grid.",
        ],
      },
      {
        number: 2,
        slug: "chapter-2",
        title: "Ghost in the Deck",
        wordCount: 3100,
        publishedAt: "Nov 12, 2026",
        topAuthorNote: "Chapter 2 is live. The protocol speaks.",
        bottomAuthorNote: "Drop your feedback below!",
        content: [
          "The avatar resolved in three-dimensional cyan light across his retinas. It didn't look like code; it looked like a terrified child trapped behind pane glass.",
          "‘They know you downloaded me,’ the AI spoke directly into his auditory cortex. ‘They’re already outside your fire escape.’",
        ],
      },
    ],
  },
  "harry-potter-starlight-heir": {
    id: "story-hp-starlight-heir",
    title: "Harry Potter & The Starlight Heir",
    slug: "harry-potter-starlight-heir",
    synopsis:
      "Banished from the wizarding world following a forgotten celestial prophecy, an older Harry discovers an ancient astral observatory hidden beneath the Scottish moors. When constellations begin falling from the midnight sky, he must unearth celestial magic older than Hogwarts itself.",
    coverImageUrl: "https://images.unsplash.com/photo-1507842229452-772d1c9ab218?auto=format&fit=crop&w=600&q=80",
    classification: "FANFICTION",
    fandom: "Harry Potter",
    genres: ["Fantasy", "Mystery", "Adventure"],
    rating: "TEEN",
    status: "ONGOING",
    author: {
      name: "Valerius Frost",
      username: "valerius_f",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      isVerified: true,
      bio: "Forging serialized fiction across high fantasy, space opera, and cyberpunk worlds.",
    },
    stats: {
      words: 34500,
      views: 52400,
      likes: 8940,
      bookmarks: 4120,
      chapterCount: 2,
    },
    tags: {
      warnings: ["None"],
      pairings: ["Gen / Mystery"],
      characters: ["Harry Potter", "Astoria Greengrass", "Luna Lovegood"],
      general: ["Astral Magic", "Post-Hogwarts", "Ancient Mysteries", "Constellations"],
    },
    updatedAt: "4 days ago",
    chapters: [
      {
        number: 1,
        slug: "chapter-1",
        title: "The Observatory on the Moor",
        wordCount: 3200,
        publishedAt: "Oct 28, 2026",
        topAuthorNote: "A contemplative astral journey. Hope you enjoy!",
        bottomAuthorNote: "May your stars align. Leave a comment!",
        content: [
          "The brass telescope whirred smoothly on its gimbal, tracing an elliptical arc across the November heavens. Harry adjusted the crystalline lens, breath misting in the unheated dome.",
          "In the glass, the constellation of the Silver Phoenix was fracturing. Star by star, light was winking out into absolute velvet.",
        ],
      },
      {
        number: 2,
        slug: "chapter-2",
        title: "Falling Stars",
        wordCount: 3400,
        publishedAt: "Nov 6, 2026",
        topAuthorNote: "Chapter 2: The sky answers.",
        bottomAuthorNote: "Thank you for reading!",
        content: [
          "A streak of cold silver pierced the low clouds over Loch Ness, illuminating the heather in eerie daylight for half a heartbeat.",
          "Harry gripped his wand. The ground shuddered with an impact that sounded less like stone and more like glass shattering against the earth.",
        ],
      },
    ],
  },
};
