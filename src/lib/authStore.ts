"use client";

export type UserRole =
  | "USER"
  | "ADMIN"
  | "SUPER_ADMIN"
  | "MODERATOR"
  // Legacy backward-compat aliases:
  | "CREATOR"
  | "READER";

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
const ADMIN_STORAGE_KEY = "ficforge_admin_session_v1";

/**
 * Standard Demo User: Valerius Frost (Author & Reader in ONE Account)
 * Every FicForge account can both read and write!
 */
export const DEMO_USER: UserSession = {
  id: "user-creator-demo",
  name: "Valerius Frost",
  username: "valerius_f",
  email: "valerius@ficforge.org",
  role: "USER",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  sparksBalance: 450,
  membershipTier: "PLUS",
};

// Aliases for any legacy import compatibility
export const DEMO_CREATOR = DEMO_USER;
export const DEMO_READER = DEMO_USER;

/**
 * Dedicated Admin User: Platform Administrator for /admin
 */
export const DEMO_ADMIN: UserSession = {
  id: "admin-master-01",
  name: "FicForge Staff Admin",
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
 * Check if a session has administrative / moderation privileges
 */
export function isUserAdmin(user: UserSession | null): boolean {
  if (!user) return false;
  return user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "MODERATOR";
}

/**
 * Any authenticated user can create stories and manuscripts (Universal Account)
 */
export function canCreateStories(user: UserSession | null): boolean {
  return user !== null;
}

/**
 * Authoritative check if user can edit, add chapters to, or delete a story.
 * Only granted if:
 * 1. User is the author of this story (username or id match), OR
 * 2. User is an Administrator
 * 
 * Non-authors and logged-out guests ALWAYS return false!
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

export function canManageChapter(
  user: UserSession | null,
  storyAuthorUsername?: string,
  storyAuthorId?: string
): boolean {
  return canManageStory(user, storyAuthorUsername, storyAuthorId);
}

/**
 * Standard user login (Universal Account - Readers are Creators, Creators are Readers)
 */
export function loginUser(email: string, name?: string): UserSession {
  const username = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
  const session: UserSession = {
    id: `user-${Date.now()}`,
    name: name || username,
    username,
    email,
    role: "USER",
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

export function loginAsDemoUser(): UserSession {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USER));
    window.dispatchEvent(new Event("ficforge_auth_changed"));
  }
  return DEMO_USER;
}

export const loginAsDemoCreator = loginAsDemoUser;
export const loginAsDemoReader = loginAsDemoUser;

/**
 * Dedicated Admin Portal Login for /admin
 */
export function loginAsAdmin(): UserSession {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_ADMIN));
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(DEMO_ADMIN));
    window.dispatchEvent(new Event("ficforge_auth_changed"));
  }
  return DEMO_ADMIN;
}

export const loginAsDemoAdmin = loginAsAdmin;

export function logoutUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    window.dispatchEvent(new Event("ficforge_auth_changed"));
  }
}
