"use client";

import { mockStories, StoryData, ChapterData } from "@/data/mockStories";

const STORAGE_KEY = "ficforge_custom_stories_v1";

/**
 * Get all stories (initial mock stories + custom user-created stories from localStorage)
 */
export function getAllStories(): Record<string, StoryData> {
  if (typeof window === "undefined") {
    return mockStories;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return mockStories;
    }
    const customStories: Record<string, StoryData> = JSON.parse(stored);
    // Sync into in-memory object
    Object.assign(mockStories, customStories);
    return { ...mockStories, ...customStories };
  } catch (err) {
    console.error("Error reading custom stories from localStorage:", err);
    return mockStories;
  }
}

/**
 * Get a single story by its slug
 */
export function getStoryBySlug(slug: string): StoryData | undefined {
  const all = getAllStories();
  return all[slug];
}

/**
 * Save or update a story
 */
export function saveStory(story: StoryData): void {
  // Sync to in-memory
  mockStories[story.slug] = story;

  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const customStories: Record<string, StoryData> = stored ? JSON.parse(stored) : {};
    customStories[story.slug] = story;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customStories));
    
    // Background sync to PostgreSQL database
    fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ story }),
    }).catch((err) => console.warn("Background sync of story to server failed:", err));

    // Dispatch storage events
    window.dispatchEvent(new Event("ficforge_stories_updated"));
  } catch (err) {
    console.error("Error saving story to localStorage:", err);
  }
}

/**
 * Server Synchronization: Reconciles local client story cache with PostgreSQL via /api/stories
 */
export async function syncStoriesWithServer(): Promise<Record<string, StoryData>> {
  if (typeof window === "undefined") return mockStories;

  try {
    const res = await fetch("/api/stories", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.stories && typeof data.stories === "object") {
        // Clear mockStories keys that no longer exist in data.stories
        for (const k of Object.keys(mockStories)) {
          if (!data.stories[k]) {
            delete mockStories[k];
          }
        }
        Object.assign(mockStories, data.stories);
        const stored = localStorage.getItem(STORAGE_KEY);
        const customStories: Record<string, StoryData> = stored ? JSON.parse(stored) : {};
        const merged = { ...data.stories, ...customStories };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new Event("ficforge_stories_updated"));
        return merged;
      }
    }
  } catch (err) {
    console.warn("Could not sync with /api/stories:", err);
  }

  return getAllStories();
}

/**
 * Add or update a single chapter in a story
 */
export function saveChapter(storySlug: string, chapter: ChapterData): boolean {
  const all = getAllStories();
  const story = all[storySlug];
  if (!story) return false;

  story.chapters = story.chapters || [];
  story.stats = story.stats || { words: 0, views: 0, likes: 0, bookmarks: 0, chapterCount: 0 };

  const existingIndex = story.chapters.findIndex((c) => c.slug === chapter.slug);
  if (existingIndex >= 0) {
    story.chapters[existingIndex] = chapter;
  } else {
    story.chapters.push(chapter);
  }

  // Recalculate stats
  story.stats.chapterCount = story.chapters.length;
  story.stats.words = story.chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);
  story.updatedAt = "Just now";

  saveStory(story);
  return true;
}

/**
 * Atomically save a batch of chapters to a story (Bulk Importer)
 */
export function bulkSaveChapters(storySlug: string, newChapters: ChapterData[]): boolean {
  const all = getAllStories();
  const story = all[storySlug];
  if (!story) return false;

  story.chapters = story.chapters || [];
  story.stats = story.stats || { words: 0, views: 0, likes: 0, bookmarks: 0, chapterCount: 0 };

  const startingNumber = story.chapters.length + 1;
  const normalizedNewChapters = newChapters.map((ch, idx) => ({
    ...ch,
    number: startingNumber + idx,
    slug: ch.slug || `chapter-${startingNumber + idx}`,
  }));

  story.chapters = [...story.chapters, ...normalizedNewChapters];
  story.stats.chapterCount = story.chapters.length;
  story.stats.words = story.chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);
  story.updatedAt = "Just now";

  saveStory(story);
  return true;
}

/**
 * Deletes a story permanently from memory, local cache, and PostgreSQL database.
 */
export function deleteStory(slug: string): boolean {
  delete mockStories[slug];

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const customStories: Record<string, StoryData> = JSON.parse(stored);
        delete customStories[slug];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customStories));
      }

      // Background delete in PostgreSQL
      fetch(`/api/stories?slug=${encodeURIComponent(slug)}`, {
        method: "DELETE",
      }).catch((err) => console.warn("Failed to delete story from server:", err));

      window.dispatchEvent(new Event("ficforge_stories_updated"));
    } catch (err) {
      console.error("Error deleting story from localStorage:", err);
      return false;
    }
  }

  return true;
}

/**
 * Deletes a single chapter from a story, updates stats, and syncs to database.
 */
export function deleteChapter(storySlug: string, chapterSlug: string): boolean {
  const all = getAllStories();
  const story = all[storySlug];
  if (!story || !story.chapters) return false;

  const initialCount = story.chapters.length;
  story.chapters = story.chapters.filter((c) => c.slug !== chapterSlug);

  if (story.chapters.length === initialCount) {
    return false;
  }

  // Re-number remaining chapters
  story.chapters = story.chapters.map((ch, idx) => ({
    ...ch,
    number: idx + 1,
  }));

  // Recalculate stats
  story.stats = story.stats || { words: 0, views: 0, likes: 0, bookmarks: 0, chapterCount: 0 };
  story.stats.chapterCount = story.chapters.length;
  story.stats.words = story.chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);
  story.updatedAt = "Just now";

  // Save story locally and to DB
  saveStory(story);

  // Background server chapter delete
  if (typeof window !== "undefined") {
    fetch(`/api/stories?storySlug=${encodeURIComponent(storySlug)}&chapterSlug=${encodeURIComponent(chapterSlug)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Failed to delete chapter from server:", err));

    window.dispatchEvent(new Event("ficforge_stories_updated"));
  }

  return true;
}

/**
 * Deletes all custom/stored stories and resets state.
 */
export function deleteAllStories(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    fetch("/api/stories?action=delete_all", {
      method: "DELETE",
    }).catch((err) => console.warn("Failed to delete all stories on server:", err));

    window.dispatchEvent(new Event("ficforge_stories_updated"));
  }
}
