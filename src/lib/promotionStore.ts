"use client";

import { StoryData } from "@/data/mockStories";
import { getAllStories } from "@/lib/storyStore";

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

export interface StorySpotlightStatus {
  isEligible: boolean;
  status: "ELIGIBLE" | "CURRENTLY_ACTIVE" | "IN_COOLDOWN";
  activeCampaign?: SpotlightCampaign;
  daysRemaining?: number;
  eligibleDate?: string;
  message: string;
}

const SPOTLIGHT_STORAGE_KEY = "ficforge_spotlight_campaigns_v2";
const PROMO_CREDITS_KEY = "ficforge_promo_credits_v1";

const NOW = Date.now();
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const DEFAULT_SPOTLIGHTS: SpotlightCampaign[] = [
  {
    id: "spotlight-ember-archive",
    storySlug: "the-ember-archive",
    storyTitle: "The Ember Archive",
    coverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    authorName: "Valerius Frost",
    classification: "ORIGINAL",
    startDate: "Nov 10, 2026",
    endDate: "Nov 17, 2026",
    startTimestamp: NOW - (3 * 24 * 60 * 60 * 1000),
    endTimestamp: NOW + (4 * 24 * 60 * 60 * 1000),
    cooldownTimestamp: NOW + (11 * 24 * 60 * 60 * 1000),
    status: "ACTIVE",
    impressions: 48920,
    clicks: 6410,
  },
  {
    id: "spotlight-obsidian-blade",
    storySlug: "star-wars-the-obsidian-blade",
    storyTitle: "Star Wars: The Obsidian Blade",
    coverImageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
    authorName: "M. Kincaid",
    classification: "FANFICTION",
    startDate: "Nov 12, 2026",
    endDate: "Nov 19, 2026",
    startTimestamp: NOW - (1 * 24 * 60 * 60 * 1000),
    endTimestamp: NOW + (6 * 24 * 60 * 60 * 1000),
    cooldownTimestamp: NOW + (13 * 24 * 60 * 60 * 1000),
    status: "ACTIVE",
    impressions: 31200,
    clicks: 4180,
  },
  {
    id: "spotlight-neon-syndicate",
    storySlug: "neon-syndicate-blood-chrome",
    storyTitle: "Neon Syndicate: Blood & Chrome",
    coverImageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
    authorName: "Jax Mercer",
    classification: "ORIGINAL",
    startDate: "Nov 13, 2026",
    endDate: "Nov 20, 2026",
    startTimestamp: NOW - (12 * 60 * 60 * 1000),
    endTimestamp: NOW + (6.5 * 24 * 60 * 60 * 1000),
    cooldownTimestamp: NOW + (13.5 * 24 * 60 * 60 * 1000),
    status: "ACTIVE",
    impressions: 18450,
    clicks: 2890,
  },
];

export function getPromoCredits(): number {
  if (typeof window === "undefined") return 1;

  try {
    const stored = localStorage.getItem(PROMO_CREDITS_KEY);
    if (stored === null) {
      localStorage.setItem(PROMO_CREDITS_KEY, "2");
      return 2;
    }
    return parseInt(stored, 10) || 0;
  } catch {
    return 2;
  }
}

export function setPromoCredits(amount: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROMO_CREDITS_KEY, Math.max(0, amount).toString());
  window.dispatchEvent(new Event("ficforge_spotlight_updated"));
}

/**
 * Retrieves all campaigns, automatically checking expiration dates against current time.
 */
export function getAllSpotlightCampaigns(): SpotlightCampaign[] {
  if (typeof window === "undefined") return DEFAULT_SPOTLIGHTS;

  try {
    const stored = localStorage.getItem(SPOTLIGHT_STORAGE_KEY);
    let list: SpotlightCampaign[] = stored ? JSON.parse(stored) : DEFAULT_SPOTLIGHTS;

    // Auto-enrich: If only 1 campaign is present in storage, backfill with default spotlights so the showcase is rich
    if (list.length <= 1) {
      const existingSlugs = new Set(list.map((c) => c.storySlug));
      const missingDefaults = DEFAULT_SPOTLIGHTS.filter((d) => !existingSlugs.has(d.storySlug));
      list = [...list, ...missingDefaults];
      localStorage.setItem(SPOTLIGHT_STORAGE_KEY, JSON.stringify(list));
    }

    const now = Date.now();
    let hasChanges = false;

    // Validate timestamps & auto-expire campaigns that completed their 7-day run
    const validated = list.map((c) => {
      let camp = { ...c };

      // Ensure timestamps exist
      if (!camp.startTimestamp) {
        camp.startTimestamp = now - 24 * 60 * 60 * 1000;
        camp.endTimestamp = now + (6 * 24 * 60 * 60 * 1000);
        camp.cooldownTimestamp = camp.endTimestamp + SEVEN_DAYS_MS;
        hasChanges = true;
      }

      // Auto-expire if end date reached
      if (camp.status === "ACTIVE" && now >= camp.endTimestamp) {
        camp.status = "EXPIRED";
        hasChanges = true;
      }

      return camp;
    });

    if (hasChanges || !stored) {
      localStorage.setItem(SPOTLIGHT_STORAGE_KEY, JSON.stringify(validated));
    }

    return validated;
  } catch {
    return DEFAULT_SPOTLIGHTS;
  }
}

/**
 * Returns all currently ACTIVE campaigns that have not expired.
 */
export function getActiveSpotlights(): SpotlightCampaign[] {
  const campaigns = getAllSpotlightCampaigns();
  const now = Date.now();

  return campaigns.filter((c) => c.status === "ACTIVE" && now < c.endTimestamp);
}

export function getActiveSpotlight(): SpotlightCampaign | null {
  const active = getActiveSpotlights();
  return active.length > 0 ? active[0] : null;
}

export function isStorySpotlighted(storySlug: string): boolean {
  const active = getActiveSpotlights();
  return active.some((c) => c.storySlug === storySlug);
}

/**
 * Checks story spotlight eligibility enforcing Anti-Monopoly & Fair Discovery Rules:
 * 1. A story CANNOT have overlapping active campaigns (No double-spotlighting the same story).
 * 2. After a 7-day spotlight finishes, a 7-day fair rotation cooldown prevents spamming.
 */
export function getStorySpotlightEligibility(storySlug: string): StorySpotlightStatus {
  const campaigns = getAllSpotlightCampaigns();
  const now = Date.now();

  const storyCampaigns = campaigns.filter((c) => c.storySlug === storySlug);

  // 1. Check if currently active in spotlight
  const active = storyCampaigns.find((c) => c.status === "ACTIVE" && now < c.endTimestamp);
  if (active) {
    const daysLeft = Math.max(1, Math.ceil((active.endTimestamp - now) / (1000 * 60 * 60 * 24)));
    return {
      isEligible: false,
      status: "CURRENTLY_ACTIVE",
      activeCampaign: active,
      daysRemaining: daysLeft,
      eligibleDate: new Date(active.endTimestamp + SEVEN_DAYS_MS).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      message: `Already active in Creator Spotlight (${daysLeft} ${daysLeft === 1 ? "day" : "days"} remaining). Overlapping campaigns for the same story are strictly prohibited to maintain fair discovery.`,
    };
  }

  // 2. Check if in 7-day anti-monopoly cooldown
  // Find the most recent expired or ended campaign for this story
  const recentCampaign = storyCampaigns.find((c) => c.cooldownTimestamp && now < c.cooldownTimestamp);
  if (recentCampaign) {
    const cooldownDays = Math.max(1, Math.ceil((recentCampaign.cooldownTimestamp - now) / (1000 * 60 * 60 * 24)));
    const eligibleDateStr = new Date(recentCampaign.cooldownTimestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return {
      isEligible: false,
      status: "IN_COOLDOWN",
      daysRemaining: cooldownDays,
      eligibleDate: eligibleDateStr,
      message: `Community Discovery Cooldown: This story completed its spotlight run recently. A ${cooldownDays}-day cooldown applies before it can be featured again, ensuring equal homepage visibility across all creators.`,
    };
  }

  // 3. Otherwise completely eligible!
  return {
    isEligible: true,
    status: "ELIGIBLE",
    message: "Eligible for 7-day Homepage & Discovery Spotlight.",
  };
}

/**
 * Activates a 7-day spotlight campaign with strict eligibility verification.
 */
export function activateSpotlight(
  storySlug: string,
  days: number = 7
): { success: boolean; message: string } {
  if (typeof window === "undefined") {
    return { success: false, message: "Environment unavailable." };
  }

  // 1. Strict Eligibility Check
  const eligibility = getStorySpotlightEligibility(storySlug);
  if (!eligibility.isEligible) {
    return { success: false, message: eligibility.message };
  }

  // 2. Credit check
  const credits = getPromoCredits();
  if (credits < 1) {
    return { success: false, message: "Insufficient Spotlight Credits. Upgrade your membership or await monthly refresh." };
  }

  // 3. Story existence
  const allStories = getAllStories();
  const story = allStories[storySlug];
  if (!story) {
    return { success: false, message: "Story could not be located in platform catalog." };
  }

  const now = Date.now();
  const durationMs = days * 24 * 60 * 60 * 1000;
  const cooldownMs = SEVEN_DAYS_MS;

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
    impressions: 160,
    clicks: 22,
  };

  const existingCampaigns = getAllSpotlightCampaigns();
  const updated = [newCampaign, ...existingCampaigns];

  localStorage.setItem(SPOTLIGHT_STORAGE_KEY, JSON.stringify(updated));
  setPromoCredits(credits - 1);

  window.dispatchEvent(new Event("ficforge_spotlight_updated"));
  return { success: true, message: `Spotlight successfully launched for "${story.title}"!` };
}

/**
 * Ends an active campaign early. Cooldown begins immediately upon cancellation.
 */
export function endSpotlightCampaign(campaignId: string): void {
  if (typeof window === "undefined") return;

  const now = Date.now();
  const campaigns = getAllSpotlightCampaigns().map((c) => {
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

  localStorage.setItem(SPOTLIGHT_STORAGE_KEY, JSON.stringify(campaigns));
  window.dispatchEvent(new Event("ficforge_spotlight_updated"));
}

/**
 * Testing tool to reset cooldowns so administrators/testers can test multiple runs without waiting 7 days.
 */
export function resetTestCooldowns(): void {
  if (typeof window === "undefined") return;

  const campaigns = getAllSpotlightCampaigns().map((c) => ({
    ...c,
    cooldownTimestamp: 0,
  }));

  localStorage.setItem(SPOTLIGHT_STORAGE_KEY, JSON.stringify(campaigns));
  window.dispatchEvent(new Event("ficforge_spotlight_updated"));
}
