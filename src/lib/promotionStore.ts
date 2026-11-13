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
  status: "ACTIVE" | "EXPIRED" | "SCHEDULED";
  impressions: number;
  clicks: number;
}

const SPOTLIGHT_STORAGE_KEY = "ficforge_spotlight_campaigns_v1";
const PROMO_CREDITS_KEY = "ficforge_promo_credits_v1";

const DEFAULT_SPOTLIGHT: SpotlightCampaign = {
  id: "spotlight-ember-archive",
  storySlug: "the-ember-archive",
  storyTitle: "The Ember Archive",
  coverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
  authorName: "Valerius Frost",
  classification: "ORIGINAL",
  startDate: "Nov 10, 2026",
  endDate: "Nov 17, 2026 (Active)",
  status: "ACTIVE",
  impressions: 48920,
  clicks: 6410,
};

export function getPromoCredits(): number {
  if (typeof window === "undefined") return 1;

  try {
    const stored = localStorage.getItem(PROMO_CREDITS_KEY);
    if (stored === null) {
      // Default 1 credit for Forge Plus membership
      localStorage.setItem(PROMO_CREDITS_KEY, "1");
      return 1;
    }
    return parseInt(stored, 10) || 0;
  } catch {
    return 1;
  }
}

export function setPromoCredits(amount: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROMO_CREDITS_KEY, amount.toString());
  window.dispatchEvent(new Event("ficforge_spotlight_updated"));
}

export function getAllSpotlightCampaigns(): SpotlightCampaign[] {
  if (typeof window === "undefined") return [DEFAULT_SPOTLIGHT];

  try {
    const stored = localStorage.getItem(SPOTLIGHT_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(SPOTLIGHT_STORAGE_KEY, JSON.stringify([DEFAULT_SPOTLIGHT]));
      return [DEFAULT_SPOTLIGHT];
    }
    const list: SpotlightCampaign[] = JSON.parse(stored);

    // Auto-heal: If an item has "(Active)" in endDate, ensure status is ACTIVE
    const healed = list.map((c) => {
      if (c.endDate && c.endDate.includes("(Active)") && c.status !== "EXPIRED") {
        return { ...c, status: "ACTIVE" as const };
      }
      return c;
    });

    return healed;
  } catch {
    return [DEFAULT_SPOTLIGHT];
  }
}

export function getActiveSpotlights(): SpotlightCampaign[] {
  const campaigns = getAllSpotlightCampaigns();
  const active = campaigns.filter((c) => c.status === "ACTIVE" || (c.endDate && c.endDate.includes("(Active)")));
  if (active.length === 0 && campaigns.length > 0) {
    return [campaigns[0]];
  }
  return active;
}

export function getActiveSpotlight(): SpotlightCampaign | null {
  const active = getActiveSpotlights();
  return active.length > 0 ? active[0] : null;
}

export function isStorySpotlighted(storySlug: string): boolean {
  const active = getActiveSpotlights();
  return active.some((c) => c.storySlug === storySlug);
}

export function endSpotlightCampaign(campaignId: string): void {
  if (typeof window === "undefined") return;
  const campaigns = getAllSpotlightCampaigns().map((c) => {
    if (c.id === campaignId) {
      return {
        ...c,
        status: "EXPIRED" as const,
        endDate: `${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} (Ended)`,
      };
    }
    return c;
  });
  localStorage.setItem(SPOTLIGHT_STORAGE_KEY, JSON.stringify(campaigns));
  window.dispatchEvent(new Event("ficforge_spotlight_updated"));
}

export function activateSpotlight(storySlug: string, days: number = 7): boolean {
  if (typeof window === "undefined") return false;

  const credits = getPromoCredits();
  if (credits < 1) return false;

  const allStories = getAllStories();
  const story = allStories[storySlug];
  if (!story) return false;

  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + days);

  const newCampaign: SpotlightCampaign = {
    id: `spotlight-${Date.now()}`,
    storySlug: story.slug,
    storyTitle: story.title,
    coverImageUrl: story.coverImageUrl,
    authorName: story.author?.name || "Author",
    classification: story.classification,
    startDate: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    endDate: `${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} (Active)`,
    status: "ACTIVE",
    impressions: 140,
    clicks: 18,
  };

  // Keep other active campaigns alive so multiple stories can be spotlighted simultaneously!
  // If this exact story already had a campaign, replace it with the new active one
  const otherCampaigns = getAllSpotlightCampaigns().filter((c) => c.storySlug !== story.slug);
  const updatedCampaigns = [newCampaign, ...otherCampaigns];

  localStorage.setItem(SPOTLIGHT_STORAGE_KEY, JSON.stringify(updatedCampaigns));
  setPromoCredits(credits - 1);

  window.dispatchEvent(new Event("ficforge_spotlight_updated"));
  return true;
}
