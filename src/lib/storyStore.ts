"use client";

import { mockStories, StoryData, ChapterData } from "@/data/mockStories";

// In-memory runtime cache synchronized directly with Neon PostgreSQL
let activeStoriesCache: Record<string, StoryData> = { ...mockStories };

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
 * Get all stories from in-memory cache (authoritatively synced from Neon PostgreSQL)
 */
export function getAllStories(): Record<string, StoryData> {
  cleanupLegacyStorage();
  return activeStoriesCache;
}

/**
 * Get a single story by slug
 */
export function getStoryBySlug(slug: string): StoryData | undefined {
  return activeStoriesCache[slug];
}

/**
 * Save or update a story directly to Neon PostgreSQL database
 */
export async function saveStory(story: StoryData): Promise<void> {
  activeStoriesCache[story.slug] = story;

  if (typeof window !== "undefined") {
    cleanupLegacyStorage();
    window.dispatchEvent(new Event("ficforge_stories_updated"));

    try {
      await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ story }),
      });
      // Re-sync with database
      await syncStoriesWithServer();
    } catch (err) {
      console.error("Failed to save story to PostgreSQL:", err);
    }
  }
}

/**
 * Server Synchronization: Authoritatively fetches stories directly from Neon PostgreSQL
 */
export async function syncStoriesWithServer(): Promise<Record<string, StoryData>> {
  cleanupLegacyStorage();

  if (typeof window === "undefined") return activeStoriesCache;

  try {
    const res = await fetch("/api/stories", { cache: "no-store", credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      if (data.stories && typeof data.stories === "object" && Object.keys(data.stories).length > 0) {
        activeStoriesCache = data.stories;
        window.dispatchEvent(new Event("ficforge_stories_updated"));
        return activeStoriesCache;
      }
    }
  } catch (err) {
    console.warn("Could not sync stories with PostgreSQL:", err);
  }

  return activeStoriesCache;
}

/**
 * Add or update a single chapter directly in Neon PostgreSQL
 */
export async function saveChapter(storySlug: string, chapter: ChapterData): Promise<boolean> {
  const story = activeStoriesCache[storySlug];
  if (!story) return false;

  story.chapters = story.chapters || [];
  const existingIdx = story.chapters.findIndex((c) => c.slug === chapter.slug || c.number === chapter.number);
  if (existingIdx >= 0) {
    story.chapters[existingIdx] = chapter;
  } else {
    story.chapters.push(chapter);
  }

  story.stats = story.stats || { words: 0, views: 0, likes: 0, bookmarks: 0, chapterCount: 0 };
  story.stats.chapterCount = story.chapters.length;
  story.stats.words = story.chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);
  story.updatedAt = "Just now";

  await saveStory(story);
  return true;
}

/**
 * Bulk save chapters directly to Neon PostgreSQL
 */
export async function bulkSaveChapters(storySlug: string, newChapters: ChapterData[]): Promise<boolean> {
  let story = activeStoriesCache[storySlug];
  if (!story) {
    const synced = await syncStoriesWithServer();
    story = synced[storySlug];
  }
  if (!story && typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/stories?slug=${encodeURIComponent(storySlug)}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.story) {
          story = json.story;
          activeStoriesCache[storySlug] = story;
        }
      }
    } catch {}
  }
  if (!story) return false;

  story.chapters = story.chapters || [];
  const startingNumber = story.chapters.length + 1;
  const normalized = newChapters.map((ch, idx) => ({
    ...ch,
    number: startingNumber + idx,
    slug: ch.slug || `chapter-${startingNumber + idx}`,
  }));

  story.chapters = [...story.chapters, ...normalized];
  story.stats = story.stats || { words: 0, views: 0, likes: 0, bookmarks: 0, chapterCount: 0 };
  story.stats.chapterCount = story.chapters.length;
  story.stats.words = story.chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);
  story.updatedAt = "Just now";

  await saveStory(story);
  return true;
}

/**
 * Deletes a story permanently from Neon PostgreSQL database
 */
export async function deleteStory(slug: string): Promise<boolean> {
  delete activeStoriesCache[slug];

  if (typeof window !== "undefined") {
    cleanupLegacyStorage();
    window.dispatchEvent(new Event("ficforge_stories_updated"));

    try {
      await fetch(`/api/stories?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
        credentials: "include",
      });
      await syncStoriesWithServer();
    } catch (err) {
      console.error("Failed to delete story from PostgreSQL:", err);
      return false;
    }
  }

  return true;
}

/**
 * Deletes a single chapter permanently from Neon PostgreSQL database
 */
export async function deleteChapter(storySlug: string, chapterSlug: string): Promise<boolean> {
  const story = activeStoriesCache[storySlug];
  if (!story || !story.chapters) return false;

  story.chapters = story.chapters.filter((c) => c.slug !== chapterSlug);
  story.chapters = story.chapters.map((ch, idx) => ({ ...ch, number: idx + 1 }));
  story.stats = story.stats || { words: 0, views: 0, likes: 0, bookmarks: 0, chapterCount: 0 };
  story.stats.chapterCount = story.chapters.length;
  story.stats.words = story.chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);
  story.updatedAt = "Just now";

  if (typeof window !== "undefined") {
    cleanupLegacyStorage();
    window.dispatchEvent(new Event("ficforge_stories_updated"));

    try {
      await fetch(
        `/api/stories?storySlug=${encodeURIComponent(storySlug)}&chapterSlug=${encodeURIComponent(chapterSlug)}`,
        { method: "DELETE", credentials: "include" }
      );
      await syncStoriesWithServer();
    } catch (err) {
      console.error("Failed to delete chapter from PostgreSQL:", err);
      return false;
    }
  }

  return true;
}

/**
 * Deletes all stories from Neon PostgreSQL database
 */
export async function deleteAllStories(): Promise<void> {
  activeStoriesCache = {};

  if (typeof window !== "undefined") {
    cleanupLegacyStorage();
    window.dispatchEvent(new Event("ficforge_stories_updated"));

    try {
      await fetch("/api/stories?action=delete_all", { method: "DELETE" });
      await syncStoriesWithServer();
    } catch (err) {
      console.error("Failed to delete all stories from PostgreSQL:", err);
    }
  }
}
