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
      bio: "Forging high fantasy worlds and serialized epic adventures. 3x Royal Road featured author.",
    },
    stats: {
      words: 96420,
      views: 96240,
      likes: 14850,
      bookmarks: 8420,
      chapterCount: 24,
    },
    tags: {
      warnings: ["Fantasy Violence", "Epic Battles"],
      pairings: ["Slow Burn Romance", "Allies to Lovers"],
      characters: ["Kaelen the Cartographer", "Seraphina the Flame-Weaver", "Lord Vane"],
      general: ["Magic System", "Ancient Ruins", "Mythology", "Elemental Magic", "Worldbuilding"],
    },
    updatedAt: "2 hours ago",
    chapters: [
      {
        number: 1,
        slug: "chapter-1",
        title: "Ashes of the Spire",
        wordCount: 3840,
        publishedAt: "Nov 1, 2026",
        topAuthorNote:
          "Welcome to the first chapter of The Ember Archive! Thank you all for embarking on this journey. New chapters drop every Tuesday and Friday.",
        bottomAuthorNote:
          "If you enjoyed this chapter, don't forget to bookmark the story and share your thoughts in the comments below!",
        content: [
          "The ink on Kaelen’s parchment refused to dry in the bitter cold of the outer perimeter.",
          "High above the barren salt flats, the Ember Spire stood like a blackened needle piercing the bruised belly of the twilight sky. It was said that the architects of the First Age had carved its foundations not from stone, but from crystallized fire — magma cooled under the immense pressure of forgotten ocean depths.",
          "Kaelen pulled her wool-lined hood tighter against the rising gale. Her breath blossomed into white fog before crystallizing upon the iron rim of her lantern.",
          "‘If the archives hold true,’ she murmured, tracing a calloused thumb across the compass needle that spun lazily in its bronze casing, ‘the seventh vault should lie directly beneath the sundial terrace.’",
          "A crack like shattered glass echoed from the frozen canyon below. She froze. The frost-wolves of the Northern Reaches rarely hunted this far south unless driven by something far more terrifying than winter.",
          "Shadows lengthened across the courtyard as she pushed through the heavy obsidian doors. Inside, silence hung thick and suffocating, smelling of ancient tallow and burnt ozone. Rows of towering stone shelves stretched into the gloom, their alcoves empty save for faint, pulsing embers that hovered in midair like dying stars.",
          "She approached the nearest plinth. Suspended within a sphere of hardened amber lay a single scroll of gold leaf, inscribed in runes that seemed to writhe beneath her gaze.",
          "‘You shouldn’t touch that,’ a voice echoed from the gallery above.",
          "Kaelen’s hand darted to the hilt of the curved blade at her hip. She stepped back into the lantern light, raising her chin toward the darkness.",
          "‘Show yourself,’ she demanded. ‘By decree of the Cartographers’ Guild, these ruins are under sovereign protection.’",
          "A soft chuckle drifted downward, followed by the soft scuff of leather on marble. A figure stepped into the pale beam of moonlight pouring through the cracked dome. Crimson robes trimmed with blackened silver fluttered in the draft. His hands were bare, and between his knuckles danced twin sparks of orange luminescence.",
          "‘The Cartographers’ Guild was burned to cinder three moons ago, little scribe,’ he said quietly. ‘And if you value your life, you will take that scroll and run before the Frost King’s vanguard realizes we are inside.’",
        ],
      },
      {
        number: 2,
        slug: "chapter-2",
        title: "The Flame-Weaver's Oath",
        wordCount: 4120,
        publishedAt: "Nov 4, 2026",
        topAuthorNote: "Chapter 2 is here! We meet our mysterious flame-weaver. Enjoy the read!",
        bottomAuthorNote: "What are your theories on the Frost King? Let me know in the comments!",
        content: [
          "The sparks between the stranger’s knuckles flared with an intensity that chased away the shadows clinging to the archways.",
          "‘The Guild is gone?’ Kaelen whispered, her throat constricting. ‘That’s impossible. The Grand Archive in Oakhaven was protected by three warding circles.’",
          "‘Warding circles built for human sorcery,’ the man countered, descending the spiral stair with unnerving grace. ‘Not for the cold that walks on two legs. Ice does not negotiate with wards, Cartographer. It cracks them.’",
          "He reached the bottom step. In the glow of her lantern, Kaelen could see the sharp planes of his face, the faint spiderweb scars along his jaw, and eyes that reflected the orange light of dying coals.",
          "‘My name is Vael,’ he said, extending a gloved hand toward the floating sphere of amber. ‘And unless you intend to become an ice sculpture before sunrise, we have roughly ten minutes to evacuate this chamber.’",
        ],
      },
      {
        number: 3,
        slug: "chapter-3",
        title: "The Salt Flats at Midnight",
        wordCount: 3950,
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
  "star-wars-reforged": {
    id: "story-sw-reforged",
    title: "Star Wars: The Obsidian Blade",
    slug: "star-wars-reforged",
    synopsis:
      "Set five years following the Purge, an ex-Jedi agriculturalist living in hiding on the outer rim world of Jelucan stumbles upon an ancient Sith artifact buried beneath the moisture farms. As Inquisitors close in, survival means choosing between the code he abandoned and the forbidden knowledge that could save his people.",
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
      chapterCount: 12,
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
    ],
  },
  "neon-syndicate": {
    id: "story-neon-syndicate",
    title: "Neon Syndicate: Blood & Chrome",
    slug: "neon-syndicate",
    synopsis:
      "In the lawless sublevels of Neo-Detroit, an augmented black-market surgeon gets entangled with a high-stakes corporate assassin on the run. Dark, gritty, and visceral — survival demands shedding what little humanity remains.",
    coverImageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    classification: "ORIGINAL",
    genres: ["Cyberpunk", "Thriller", "Action"],
    rating: "EXPLICIT",
    status: "ONGOING",
    author: {
      name: "Valerius Frost",
      username: "valerius_f",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      isVerified: true,
      bio: "Forging serialized fiction across high fantasy, space opera, and cyberpunk worlds.",
    },
    stats: {
      words: 54300,
      views: 41200,
      likes: 6200,
      bookmarks: 3100,
      chapterCount: 8,
    },
    tags: {
      warnings: ["Explicit Language & Content", "Graphic Violence", "18+ Only"],
      pairings: ["Enemies to Lovers", "Noir Romance"],
      characters: ["Doc Thorne", "Vesper Seven"],
      general: ["Cyberpunk", "Augmentations", "Sublevel Grime", "Anti-Hero", "Sci-Fi Noir"],
    },
    updatedAt: "3 days ago",
    chapters: [
      {
        number: 1,
        slug: "chapter-1",
        title: "Sub-Level Zero",
        wordCount: 3450,
        publishedAt: "Oct 28, 2026",
        topAuthorNote: "Content Warning: Explicit (18+). Contains mature themes and stylized action.",
        bottomAuthorNote: "Thank you for reading Chapter 1! Drop your thoughts and feedback below.",
        content: [
          "Rain in Sub-Level Zero didn't fall from clouds; it condensed on colossal exhaust pipes suspended six hundred stories above and dripped down through the rusted grating like cold synthetic venom.",
          "Thorne tightened the strap on his dermal scanner. Across the steel gurney, the patient wasn't breathing, but their sub-neural core was still screaming telemetry into his visor.",
        ],
      },
    ],
  },
};
