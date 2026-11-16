import { getAllStories } from "./storyStore";
import { getCurrentUser, UserSession } from "./authStore";
import { StoryData } from "@/data/mockStories";

const LEGACY_STORAGE_KEY = "ficforge_saved_library_v1";

function getUserStorageKey(userId: string): string {
  return `ficforge_user_bookmarks_v2_${userId}`;
}

export function cleanupLegacyBookmarks(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {}
}

/**
 * Retrieves all bookmarked story slugs for the currently authenticated user.
 * Logged-out guests ALWAYS return empty array (0 bookmarks).
 */
export function getBookmarkedSlugs(): string[] {
  if (typeof window === "undefined") return [];

  cleanupLegacyBookmarks();

  const user = getCurrentUser();
  if (!user || !user.id) {
    return [];
  }

  try {
    const raw = localStorage.getItem(getUserStorageKey(user.id));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Checks if a specific story is currently bookmarked by the current logged-in user.
 */
export function isStoryBookmarked(slug: string): boolean {
  if (!slug) return false;
  const user = getCurrentUser();
  if (!user) return false;
  const bookmarks = getBookmarkedSlugs();
  return bookmarks.includes(slug);
}

/**
 * Synchronizes user bookmarks with the PostgreSQL Neon database.
 */
export async function syncUserBookmarksWithServer(): Promise<string[]> {
  if (typeof window === "undefined") return [];

  cleanupLegacyBookmarks();

  const user = getCurrentUser();
  if (!user || !user.id) return [];

  try {
    const res = await fetch(`/api/library?userId=${encodeURIComponent(user.id)}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.slugs)) {
        localStorage.setItem(getUserStorageKey(user.id), JSON.stringify(data.slugs));
        window.dispatchEvent(new Event("ficforge_bookmarks_updated"));
        return data.slugs;
      }
    }
  } catch (err) {
    console.warn("Could not sync bookmarks with server:", err);
  }

  return getBookmarkedSlugs();
}

/**
 * Toggles bookmark status for a story slug.
 * Requires an authenticated user session.
 *
 * @returns { success: boolean, isBookmarked: boolean, requiresAuth?: boolean }
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

  const current = getBookmarkedSlugs();
  const exists = current.includes(slug);
  const nextState = !exists;

  // Optimistic client update
  const updated = nextState ? [slug, ...current] : current.filter((s) => s !== slug);
  try {
    localStorage.setItem(getUserStorageKey(user.id), JSON.stringify(updated));
    window.dispatchEvent(new Event("ficforge_bookmarks_updated"));
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.warn("Failed to update local bookmarks cache:", err);
  }

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
    console.error("Failed to sync bookmark mutation with server:", err);
  }

  return { success: true, isBookmarked: nextState };
}

/**
 * Synchronous toggle fallback for backward compatibility
 */
export function toggleStoryBookmark(slug: string): boolean {
  const user = getCurrentUser();
  if (!user || !user.id) return false;

  const current = getBookmarkedSlugs();
  const exists = current.includes(slug);
  const nextState = !exists;

  const updated = nextState ? [slug, ...current] : current.filter((s) => s !== slug);
  try {
    localStorage.setItem(getUserStorageKey(user.id), JSON.stringify(updated));
    window.dispatchEvent(new Event("ficforge_bookmarks_updated"));
    window.dispatchEvent(new Event("storage"));

    // Async DB update
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
  } catch (err) {
    console.warn("Storage error in toggleStoryBookmark:", err);
  }

  return nextState;
}

/**
 * Explicitly removes a story from the current user's library.
 */
export function removeStoryBookmark(slug: string): void {
  const user = getCurrentUser();
  if (!user || !user.id || !slug) return;

  const current = getBookmarkedSlugs();
  const updated = current.filter((s) => s !== slug);

  try {
    localStorage.setItem(getUserStorageKey(user.id), JSON.stringify(updated));
    window.dispatchEvent(new Event("ficforge_bookmarks_updated"));
    window.dispatchEvent(new Event("storage"));

    fetch(
      `/api/library?userId=${encodeURIComponent(user.id)}&storySlug=${encodeURIComponent(slug)}`,
      { method: "DELETE" }
    ).catch(console.error);
  } catch (err) {
    console.warn("Failed to remove bookmark:", err);
  }
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
