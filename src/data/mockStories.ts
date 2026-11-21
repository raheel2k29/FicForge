export interface ChapterData {
  number: number;
  slug: string;
  title: string;
  wordCount: number;
  publishedAt: string;
  isPublished?: boolean;
  isScheduled?: boolean;
  scheduledPublishAt?: string;
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
  status: "ONGOING" | "COMPLETED" | "HIATUS" | "DRAFT";
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
};
