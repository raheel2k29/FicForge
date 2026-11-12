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
    
    // Dispatch storage events
    window.dispatchEvent(new Event("ficforge_stories_updated"));
  } catch (err) {
    console.error("Error saving story to localStorage:", err);
  }
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

  // Append new chapters atomically with proper order numbers
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
