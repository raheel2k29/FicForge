import { getAllStories } from "./storyStore";
import { StoryData } from "@/data/mockStories";

const BOOKMARKS_STORAGE_KEY = "ficforge_saved_library_v1";

/**
 * Retrieves all bookmarked story slugs from browser localStorage.
 */
export function getBookmarkedSlugs(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) {
      // Default: bookmark first 2 curated stories so new readers immediately see their library in action
      const defaultSlugs = ["the-ember-archive", "star-wars-the-obsidian-blade"];
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(defaultSlugs));
      return defaultSlugs;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Could not read bookmarks from localStorage:", err);
    return [];
  }
}

/**
 * Checks if a specific story is currently bookmarked.
 */
export function isStoryBookmarked(slug: string): boolean {
  if (!slug) return false;
  const bookmarks = getBookmarkedSlugs();
  return bookmarks.includes(slug);
}

/**
 * Toggles bookmark status for a story slug.
 * Returns true if added, false if removed.
 */
export function toggleStoryBookmark(slug: string): boolean {
  if (typeof window === "undefined" || !slug) return false;

  const current = getBookmarkedSlugs();
  const exists = current.includes(slug);
  let updated: string[];

  if (exists) {
    updated = current.filter((s) => s !== slug);
  } else {
    updated = [slug, ...current];
  }

  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("ficforge_bookmarks_updated"));
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.warn("Failed to persist bookmark to localStorage:", err);
  }

  return !exists;
}

/**
 * Explicitly adds a story to saved bookmarks.
 */
export function addStoryBookmark(slug: string): void {
  if (typeof window === "undefined" || !slug) return;
  const current = getBookmarkedSlugs();
  if (!current.includes(slug)) {
    const updated = [slug, ...current];
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("ficforge_bookmarks_updated"));
    window.dispatchEvent(new Event("storage"));
  }
}

/**
 * Explicitly removes a story from saved bookmarks.
 */
export function removeStoryBookmark(slug: string): void {
  if (typeof window === "undefined" || !slug) return;
  const current = getBookmarkedSlugs();
  const updated = current.filter((s) => s !== slug);
  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("ficforge_bookmarks_updated"));
  window.dispatchEvent(new Event("storage"));
}

/**
 * Returns full StoryData objects for all currently bookmarked stories.
 */
export function getBookmarkedStories(): StoryData[] {
  const slugs = getBookmarkedSlugs();
  const allStories = getAllStories();

  return slugs
    .map((slug) => allStories[slug])
    .filter(Boolean) as StoryData[];
}

/**
 * Returns total count of saved bookmarks.
 */
export function getBookmarkCount(): number {
  return getBookmarkedSlugs().length;
}
