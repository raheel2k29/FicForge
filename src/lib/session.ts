import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "ficforge_session";
const SESSION_EXPIRATION = "30d";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export interface SessionPayload {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN" | "MODERATOR" | "CREATOR" | "READER";
  avatarUrl?: string;
  sparksBalance?: number;
  membershipTier?: "FREE" | "SUPPORTER" | "PLUS" | "ELITE";
  [key: string]: any;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET || "ficforge-production-fallback-secret-key-32-chars";
  return new TextEncoder().encode(secret);
}

/**
 * Sign an encrypted, tamper-proof session JWT
 */
export async function signSession(payload: SessionPayload): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRATION)
    .sign(secretKey);
}

/**
 * Verify and decode an incoming session JWT token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Server-side helper to read and verify the active session from incoming cookies
 */
export async function getServerSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Server-side helper to set the HTTP-only session cookie
 */
export async function setServerSessionCookie(payload: SessionPayload): Promise<string> {
  const token = await signSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && process.env.VERCEL === "1",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return token;
}

/**
 * Server-side helper to clear the HTTP-only session cookie
 */
export async function clearServerSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
