import { mockStories, StoryData, ChapterData } from "@/data/mockStories";

export interface SpotlightCampaign {
  id: string;
  storySlug: string;
  storyTitle: string;
  coverImageUrl: string;
  authorName: string;
  classification: "FANFICTION" | "ORIGINAL";
  startDate: string;
  endDate: string;
  startTimestamp: number;
  endTimestamp: number;
  cooldownTimestamp: number;
  status: "ACTIVE" | "EXPIRED" | "SCHEDULED";
  impressions: number;
  clicks: number;
}

const NOW = Date.now();
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const INITIAL_CANONICAL_SPOTLIGHTS: SpotlightCampaign[] = [
  {
    id: "spotlight-ember-archive",
    storySlug: "the-ember-archive",
    storyTitle: "The Ember Archive",
    coverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    authorName: "Valerius Frost",
    classification: "ORIGINAL",
    startDate: "Nov 10, 2026",
    endDate: "Nov 17, 2026",
    startTimestamp: NOW - 3 * 24 * 60 * 60 * 1000,
    endTimestamp: NOW + 4 * 24 * 60 * 60 * 1000,
    cooldownTimestamp: NOW + 11 * 24 * 60 * 60 * 1000,
    status: "ACTIVE",
    impressions: 48920,
    clicks: 6410,
  },
  {
    id: "spotlight-obsidian-blade",
    storySlug: "star-wars-the-obsidian-blade",
    storyTitle: "Star Wars: The Obsidian Blade",
    coverImageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
    authorName: "Valerius Frost",
    classification: "FANFICTION",
    startDate: "Oct 15, 2026",
    endDate: "Oct 22, 2026",
    startTimestamp: NOW - 30 * 24 * 60 * 60 * 1000,
    endTimestamp: NOW - 23 * 24 * 60 * 60 * 1000,
    cooldownTimestamp: NOW - 16 * 24 * 60 * 60 * 1000,
    status: "EXPIRED",
    impressions: 31200,
    clicks: 4180,
  },
];

interface ServerStoreState {
  stories: Record<string, StoryData>;
  spotlights: SpotlightCampaign[];
}

declare global {
  // eslint-disable-next-line no-var
  var __ficforge_server_store: ServerStoreState | undefined;
}

function getServerStore(): ServerStoreState {
  if (!globalThis.__ficforge_server_store) {
    globalThis.__ficforge_server_store = {
      stories: { ...mockStories },
      spotlights: [...INITIAL_CANONICAL_SPOTLIGHTS],
    };
  }
  return globalThis.__ficforge_server_store;
}

export function getServerSpotlights(): SpotlightCampaign[] {
  const store = getServerStore();
  const now = Date.now();

  // Validate timestamps & auto-expire
  store.spotlights = store.spotlights.map((camp) => {
    if (camp.status === "ACTIVE" && now >= camp.endTimestamp) {
      return { ...camp, status: "EXPIRED" as const };
    }
    return camp;
  });

  return store.spotlights;
}

export function getServerActiveSpotlights(): SpotlightCampaign[] {
  const spotlights = getServerSpotlights();
  const now = Date.now();
  return spotlights.filter((c) => c.status === "ACTIVE" && now < c.endTimestamp);
}

export function activateServerSpotlight(storySlug: string, days: number = 1): { success: boolean; message: string; campaigns: SpotlightCampaign[] } {
  const store = getServerStore();
  const now = Date.now();
  const durationMs = days * 24 * 60 * 60 * 1000;
  const cooldownMs = SEVEN_DAYS_MS;

  const story = store.stories[storySlug] || mockStories[storySlug];
  if (!story) {
    return { success: false, message: "Story not found", campaigns: store.spotlights };
  }

  // Check if currently active
  const alreadyActive = store.spotlights.find((c) => c.storySlug === storySlug && c.status === "ACTIVE" && now < c.endTimestamp);
  if (alreadyActive) {
    return {
      success: false,
      message: "Story is already actively featured in the Spotlight.",
      campaigns: store.spotlights,
    };
  }

  const startObj = new Date(now);
  const endObj = new Date(now + durationMs);

  const newCampaign: SpotlightCampaign = {
    id: `spotlight-${now}`,
    storySlug: story.slug,
    storyTitle: story.title,
    coverImageUrl: story.coverImageUrl,
    authorName: story.author?.name || "Author",
    classification: story.classification,
    startDate: startObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    endDate: endObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    startTimestamp: now,
    endTimestamp: now + durationMs,
    cooldownTimestamp: now + durationMs + cooldownMs,
    status: "ACTIVE",
    impressions: 1,
    clicks: 0,
  };

  const otherCampaigns = store.spotlights.filter((c) => c.storySlug !== story.slug);
  store.spotlights = [newCampaign, ...otherCampaigns];

  return { success: true, message: `Spotlight successfully launched for "${story.title}"!`, campaigns: store.spotlights };
}

export function endServerSpotlight(campaignId: string): SpotlightCampaign[] {
  const store = getServerStore();
  const now = Date.now();

  store.spotlights = store.spotlights.map((c) => {
    if (c.id === campaignId) {
      return {
        ...c,
        status: "EXPIRED" as const,
        endTimestamp: now,
        cooldownTimestamp: now + SEVEN_DAYS_MS,
        endDate: `${new Date(now).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} (Ended Early)`,
      };
    }
    return c;
  });

  return store.spotlights;
}

export function resetServerCooldowns(): SpotlightCampaign[] {
  const store = getServerStore();
  store.spotlights = store.spotlights.map((c) => ({
    ...c,
    cooldownTimestamp: 0,
  }));
  return store.spotlights;
}

export function getServerStories(): Record<string, StoryData> {
  const store = getServerStore();
  return store.stories;
}

export function saveServerStory(story: StoryData): Record<string, StoryData> {
  const store = getServerStore();
  store.stories[story.slug] = story;
  return store.stories;
}
