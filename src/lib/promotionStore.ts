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
  status: "ACTIVE" | "EXPIRED" | "SCHEDULED" | "PENDING_APPROVAL" | "REJECTED";
  rating?: string;
  isExplicit?: boolean;
  impressions: number;
  clicks: number;
}

export interface StorySpotlightStatus {
  isEligible: boolean;
  status: "ELIGIBLE" | "CURRENTLY_ACTIVE" | "IN_COOLDOWN" | "PENDING_APPROVAL";
  activeCampaign?: SpotlightCampaign;
  daysRemaining?: number;
  eligibleDate?: string;
  message: string;
}

const NOW = Date.now();
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const formatShortDate = (ts: number): string =>
  new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const EMBER_START = NOW - 3 * 24 * 60 * 60 * 1000;
const EMBER_END = NOW + 4 * 24 * 60 * 60 * 1000;

export const DEFAULT_SPOTLIGHTS: SpotlightCampaign[] = [
  {
    id: "spotlight-ember-archive",
    storySlug: "the-ember-archive",
    storyTitle: "The Ember Archive",
    coverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    authorName: "Valerius Frost",
    classification: "ORIGINAL",
    startDate: formatShortDate(EMBER_START),
    endDate: formatShortDate(EMBER_END),
    startTimestamp: EMBER_START,
    endTimestamp: EMBER_END,
    cooldownTimestamp: EMBER_END + 7 * 24 * 60 * 60 * 1000,
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

// In-memory runtime state authoritatively synchronized with Neon PostgreSQL
let cachedCampaigns: SpotlightCampaign[] = [...DEFAULT_SPOTLIGHTS];
let cachedPromoCredits: number = 11;

/**
 * Wipe all legacy browser storage keys on startup (Universal Purge)
 * Neon PostgreSQL is the sole authoritative persistence layer.
 */
export function cleanupLegacyStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const legacyKeys = [
      "ficforge_custom_stories_v1",
      "ficforge_stories_cache",
      "ficforge_saved_bookmarks_v1",
      "ficforge_offline_library_v1",
      "ficforge_spotlights_v1",
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

/**
 * Server Synchronization: Reconciles in-memory state directly from Neon PostgreSQL
 */
export async function syncSpotlightsWithServer(): Promise<SpotlightCampaign[]> {
  cleanupLegacyStorage();

  if (typeof window === "undefined") return cachedCampaigns;

  try {
    const res = await fetch("/api/spotlight", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.campaigns && Array.isArray(data.campaigns)) {
        cachedCampaigns = data.campaigns;
        if (typeof data.promoCredits === "number") {
          cachedPromoCredits = data.promoCredits;
        }
        window.dispatchEvent(new Event("ficforge_spotlight_updated"));
        return cachedCampaigns;
      }
    }
  } catch (err) {
    console.warn("Could not sync with PostgreSQL /api/spotlight:", err);
  }

  return cachedCampaigns;
}

export function getPromoCredits(): number {
  cleanupLegacyStorage();
  return cachedPromoCredits;
}

export function setPromoCredits(amount: number): void {
  cachedPromoCredits = Math.max(0, amount);
  if (typeof window !== "undefined") {
    fetch("/api/spotlight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_credits", credits: amount }),
    }).catch(console.error);
    window.dispatchEvent(new Event("ficforge_spotlight_updated"));
  }
}

/**
 * Retrieves all campaigns directly from server-synced memory.
 */
export function getAllSpotlightCampaigns(): SpotlightCampaign[] {
  cleanupLegacyStorage();
  return cachedCampaigns;
}

/**
 * Returns currently active campaigns.
 */
export function getActiveSpotlights(): SpotlightCampaign[] {
  const campaigns = getAllSpotlightCampaigns();
  const now = Date.now();
  return campaigns.filter((c) => c.status === "ACTIVE" && now < c.endTimestamp);
}

/**
 * Checks if a specific story is currently active in spotlight.
 */
export function isStorySpotlighted(storySlug: string): boolean {
  const active = getActiveSpotlights();
  return active.some((c) => c.storySlug === storySlug);
}

/**
 * Checks story spotlight eligibility and cooldown rules.
 */
export function getStorySpotlightEligibility(storySlug: string): StorySpotlightStatus {
  const campaigns = getAllSpotlightCampaigns();
  const now = Date.now();

  const storyCampaigns = campaigns.filter((c) => c.storySlug === storySlug);
  if (storyCampaigns.length === 0) {
    return {
      isEligible: true,
      status: "ELIGIBLE",
      message: "This story is ready to be featured in Creator Spotlight.",
    };
  }

  const pending = storyCampaigns.find((c) => c.status === "PENDING_APPROVAL");
  if (pending) {
    return {
      isEligible: false,
      status: "PENDING_APPROVAL",
      activeCampaign: pending,
      message: "This story is currently pending Admin Approval for Spotlight promotion.",
    };
  }

  const active = storyCampaigns.find((c) => c.status === "ACTIVE" && now < c.endTimestamp);
  if (active) {
    const daysLeft = Math.max(1, Math.ceil((active.endTimestamp - now) / (24 * 60 * 60 * 1000)));
    return {
      isEligible: false,
      status: "CURRENTLY_ACTIVE",
      activeCampaign: active,
      daysRemaining: daysLeft,
      message: `Currently featured in Creator Spotlight (${daysLeft} ${daysLeft === 1 ? "day" : "days"} remaining).`,
    };
  }

  const inCooldown = storyCampaigns.find((c) => now < c.cooldownTimestamp);
  if (inCooldown) {
    const msRemaining = inCooldown.cooldownTimestamp - now;
    const daysRemaining = Math.max(1, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
    const eligibleDate = new Date(inCooldown.cooldownTimestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return {
      isEligible: false,
      status: "IN_COOLDOWN",
      daysRemaining,
      eligibleDate,
      message: `In 7-day fair discovery cooldown. Eligible again on ${eligibleDate} (${daysRemaining} ${daysRemaining === 1 ? "day" : "days"} remaining).`,
    };
  }

  return {
    isEligible: true,
    status: "ELIGIBLE",
    message: "This story has completed its previous cooldown and is eligible for Spotlight promotion.",
  };
}

/**
 * Activates a new spotlight campaign directly in Neon PostgreSQL.
 */
export async function activateSpotlight(
  storySlug: string,
  days: number = 7
): Promise<{ success: boolean; message: string }> {
  const eligibility = getStorySpotlightEligibility(storySlug);
  if (!eligibility.isEligible) {
    return { success: false, message: eligibility.message };
  }

  const allStories = getAllStories();
  const story = allStories[storySlug];
  if (!story) {
    return { success: false, message: "Story not found." };
  }

  const creditsCost = days * 2;
  const credits = getPromoCredits();
  if (credits < creditsCost) {
    return {
      success: false,
      message: `Insufficient Promo Credits. You need ${creditsCost} credits for a ${days}-day spotlight, but have ${credits} available.`,
    };
  }

  try {
    const res = await fetch("/api/spotlight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "activate", storySlug, days, creditsSpent: creditsCost }),
    });

    if (res.ok) {
      const data = await res.json();
      await syncSpotlightsWithServer();
      return {
        success: true,
        message: data.message || `Spotlight successfully launched in PostgreSQL for "${story.title}" for ${days} days (${creditsCost} credits redeemed)!`,
      };
    }
  } catch (err) {
    console.error("Failed to activate spotlight in PostgreSQL:", err);
  }

  return {
    success: false,
    message: "Failed to activate spotlight on server. Please try again.",
  };
}

/**
 * Staff Admin: Approves a pending explicit spotlight campaign.
 */
export async function approveSpotlightCampaign(
  campaignId: string,
  days: number = 7
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch("/api/spotlight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve", campaignId, days }),
    });
    if (res.ok) {
      const data = await res.json();
      await syncSpotlightsWithServer();
      return { success: true, message: data.message || "Spotlight campaign approved and now active on homepage!" };
    }
  } catch (err) {
    console.error("Failed to approve spotlight:", err);
  }
  return { success: false, message: "Failed to approve campaign." };
}

/**
 * Staff Admin: Rejects a pending explicit spotlight campaign.
 */
export async function rejectSpotlightCampaign(
  campaignId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch("/api/spotlight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", campaignId }),
    });
    if (res.ok) {
      const data = await res.json();
      await syncSpotlightsWithServer();
      return { success: true, message: data.message || "Spotlight campaign rejected. Promo credits refunded." };
    }
  } catch (err) {
    console.error("Failed to reject spotlight:", err);
  }
  return { success: false, message: "Failed to reject campaign." };
}

/**
 * Ends an active campaign early in Neon PostgreSQL.
 */
export async function endSpotlightCampaign(campaignId: string): Promise<void> {
  try {
    await fetch("/api/spotlight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "end", campaignId }),
    });
    await syncSpotlightsWithServer();
  } catch (err) {
    console.error("Failed to end spotlight on server:", err);
  }
}

/**
 * Testing tool to reset cooldowns in PostgreSQL.
 */
export async function resetTestCooldowns(): Promise<void> {
  try {
    await fetch("/api/spotlight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_cooldowns" }),
    });
    await syncSpotlightsWithServer();
  } catch (err) {
    console.error("Failed to reset cooldowns on server:", err);
  }
}
