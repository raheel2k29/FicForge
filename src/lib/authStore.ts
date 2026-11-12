"use client";

export interface UserSession {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "CREATOR" | "READER" | "ADMIN";
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

export function loginUser(email: string, name?: string): UserSession {
  const username = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
  const session: UserSession = {
    id: `user-${Date.now()}`,
    name: name || username,
    username,
    email,
    role: "CREATOR",
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

export function logoutUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event("ficforge_auth_changed"));
  }
}
