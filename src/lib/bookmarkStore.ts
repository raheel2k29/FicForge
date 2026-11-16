import { getAllStories } from "./storyStore";
import { getCurrentUser } from "./authStore";
import { StoryData } from "@/data/mockStories";

// In-memory runtime cache for authenticated user bookmarks, synchronized with PostgreSQL
const userBookmarksCache: Record<string, string[]> = {};

/**
 * Wipe all legacy browser storage keys (Universal Purge)
 * Neon PostgreSQL is the sole authoritative persistence layer.
 */
export function cleanupLegacyBookmarks(): void {
  if (typeof window === "undefined") return;
  try {
    const legacyKeys = [
      "ficforge_saved_bookmarks_v1",
      "ficforge_offline_library_v1",
      "ficforge_bookmarks_cache",
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

/**
 * Retrieves all bookmarked story slugs for the currently authenticated user from PostgreSQL cache.
 * Logged-out guests ALWAYS return empty array (0 bookmarks).
 */
export function getBookmarkedSlugs(): string[] {
  cleanupLegacyBookmarks();

  const user = getCurrentUser();
  if (!user || !user.id) return [];

  return userBookmarksCache[user.id] || [];
}

/**
 * Checks if a specific story is currently bookmarked by the current logged-in user.
 */
export function isStoryBookmarked(slug: string): boolean {
  if (!slug) return false;
  const user = getCurrentUser();
  if (!user || !user.id) return false;

  const slugs = getBookmarkedSlugs();
  return slugs.includes(slug);
}

/**
 * Synchronizes user bookmarks with the Neon PostgreSQL database.
 */
export async function syncUserBookmarksWithServer(): Promise<string[]> {
  cleanupLegacyBookmarks();

  if (typeof window === "undefined") return [];

  const user = getCurrentUser();
  if (!user || !user.id) return [];

  try {
    const res = await fetch(`/api/library?userId=${encodeURIComponent(user.id)}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.slugs)) {
        userBookmarksCache[user.id] = data.slugs;
        window.dispatchEvent(new Event("ficforge_bookmarks_updated"));
        return data.slugs;
      }
    }
  } catch (err) {
    console.warn("Could not sync bookmarks with PostgreSQL:", err);
  }

  return userBookmarksCache[user.id] || [];
}

/**
 * Toggles bookmark status for a story directly in Neon PostgreSQL.
 * Requires an authenticated user session.
 */
export async function toggleStoryBookmarkAuth(
  slug: string
): Promise<{ success: boolean; isBookmarked: boolean; requiresAuth?: boolean }> {
  if (typeof window === "undefined" || !slug) {
    return { success: false, isBookmarked: false };
  }

  const user = getCurrentUser();
  if (!user || !user.id) {
    return { success: false, isBookmarked: false, requiresAuth: true };
  }

  const current = userBookmarksCache[user.id] || [];
  const exists = current.includes(slug);
  const nextState = !exists;

  // Optimistic in-memory update
  userBookmarksCache[user.id] = nextState
    ? [slug, ...current]
    : current.filter((s) => s !== slug);

  window.dispatchEvent(new Event("ficforge_bookmarks_updated"));

  // Server PostgreSQL Persistence
  try {
    if (nextState) {
      await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          storySlug: slug,
        }),
      });
    } else {
      await fetch(
        `/api/library?userId=${encodeURIComponent(user.id)}&storySlug=${encodeURIComponent(slug)}`,
        { method: "DELETE" }
      );
    }
  } catch (err) {
    console.error("Failed to sync bookmark mutation with PostgreSQL:", err);
  }

  return { success: true, isBookmarked: nextState };
}

/**
 * Synchronous toggle fallback for backward compatibility
 */
export function toggleStoryBookmark(slug: string): boolean {
  const user = getCurrentUser();
  if (!user || !user.id) return false;

  const current = userBookmarksCache[user.id] || [];
  const exists = current.includes(slug);
  const nextState = !exists;

  userBookmarksCache[user.id] = nextState
    ? [slug, ...current]
    : current.filter((s) => s !== slug);

  window.dispatchEvent(new Event("ficforge_bookmarks_updated"));

  // Async DB update in Neon PostgreSQL
  if (nextState) {
    fetch("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        storySlug: slug,
      }),
    }).catch(console.error);
  } else {
    fetch(
      `/api/library?userId=${encodeURIComponent(user.id)}&storySlug=${encodeURIComponent(slug)}`,
      { method: "DELETE" }
    ).catch(console.error);
  }

  return nextState;
}

/**
 * Explicitly removes a story from the current user's library in PostgreSQL.
 */
export function removeStoryBookmark(slug: string): void {
  const user = getCurrentUser();
  if (!user || !user.id || !slug) return;

  const current = userBookmarksCache[user.id] || [];
  userBookmarksCache[user.id] = current.filter((s) => s !== slug);
  window.dispatchEvent(new Event("ficforge_bookmarks_updated"));

  fetch(
    `/api/library?userId=${encodeURIComponent(user.id)}&storySlug=${encodeURIComponent(slug)}`,
    { method: "DELETE" }
  ).catch(console.error);
}

/**
 * Returns full StoryData objects for all stories bookmarked by the currently authenticated user.
 */
export function getBookmarkedStories(): StoryData[] {
  const user = getCurrentUser();
  if (!user || !user.id) return [];

  const slugs = getBookmarkedSlugs();
  const allStories = getAllStories();

  return slugs
    .map((slug) => allStories[slug])
    .filter(Boolean) as StoryData[];
}

/**
 * Returns total count of saved stories for current user.
 * Returns 0 if logged out.
 */
export function getBookmarkCount(): number {
  const user = getCurrentUser();
  if (!user || !user.id) return 0;
  return getBookmarkedSlugs().length;
}
