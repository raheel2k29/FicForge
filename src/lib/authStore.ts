"use client";

export type UserRole =
  | "READER"
  | "CREATOR"
  | "MODERATOR"
  | "SUPPORT"
  | "ADMIN"
  | "SUPER_ADMIN";

export interface UserSession {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  sparksBalance: number;
  membershipTier: "FREE" | "SUPPORTER" | "PLUS" | "ELITE";
}

const AUTH_STORAGE_KEY = "ficforge_user_session_v1";

export const DEMO_CREATOR: UserSession = {
  id: "user-creator-demo",
  name: "Valerius Frost",
  username: "valerius_f",
  email: "creator@ficforge.org",
  role: "CREATOR",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  sparksBalance: 450,
  membershipTier: "PLUS",
};

export const DEMO_READER: UserSession = {
  id: "user-reader-demo",
  name: "Elena Rostova",
  username: "elena_reader",
  email: "reader@ficforge.org",
  role: "READER",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  sparksBalance: 120,
  membershipTier: "SUPPORTER",
};

export const DEMO_ADMIN: UserSession = {
  id: "user-admin-demo",
  name: "FicForge Staff",
  username: "admin_forge",
  email: "admin@ficforge.org",
  role: "SUPER_ADMIN",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  sparksBalance: 9999,
  membershipTier: "ELITE",
};

export function getCurrentUser(): UserSession | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * RBAC Helper: Check if user is an administrator or platform moderator
 */
export function isUserAdmin(user: UserSession | null): boolean {
  if (!user) return false;
  return user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "MODERATOR";
}

/**
 * RBAC Helper: Check if user has permission to create new stories
 */
export function canCreateStories(user: UserSession | null): boolean {
  if (!user) return false;
  return user.role === "CREATOR" || isUserAdmin(user);
}

/**
 * RBAC Helper: Authoritative check if user has permission to edit, add chapters to,
 * or delete a specific story.
 *
 * ONLY granted if:
 * 1. User is logged in AND
 * 2. User is the author (by username or ID), OR
 * 3. User is an Administrator / Moderator
 *
 * Anonymous guests and other readers will ALWAYS return false!
 */
export function canManageStory(
  user: UserSession | null,
  storyAuthorUsername?: string,
  storyAuthorId?: string
): boolean {
  if (!user) return false;
  if (isUserAdmin(user)) return true;

  if (storyAuthorId && user.id === storyAuthorId) return true;
  if (
    storyAuthorUsername &&
    user.username.trim().toLowerCase() === storyAuthorUsername.trim().toLowerCase()
  ) {
    return true;
  }

  return false;
}

/**
 * RBAC Helper: Check if user can delete/manage a chapter
 */
export function canManageChapter(
  user: UserSession | null,
  storyAuthorUsername?: string,
  storyAuthorId?: string
): boolean {
  return canManageStory(user, storyAuthorUsername, storyAuthorId);
}

export function loginUser(email: string, name?: string, role: UserRole = "CREATOR"): UserSession {
  const username = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
  const session: UserSession = {
    id: `user-${Date.now()}`,
    name: name || username,
    username,
    email,
    role,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    sparksBalance: 250,
    membershipTier: "FREE",
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event("ficforge_auth_changed"));
  }

  return session;
}

export function loginAsDemoCreator(): UserSession {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_CREATOR));
    window.dispatchEvent(new Event("ficforge_auth_changed"));
  }
  return DEMO_CREATOR;
}

export function loginAsDemoReader(): UserSession {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_READER));
    window.dispatchEvent(new Event("ficforge_auth_changed"));
  }
  return DEMO_READER;
}

export function loginAsDemoAdmin(): UserSession {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_ADMIN));
    window.dispatchEvent(new Event("ficforge_auth_changed"));
  }
  return DEMO_ADMIN;
}

export function logoutUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event("ficforge_auth_changed"));
  }
}
