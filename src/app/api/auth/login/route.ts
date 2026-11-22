import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setServerSessionCookie, SessionPayload } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, username, role, isDemo, isAdmin } = body;

    let targetEmail = email?.trim() || "";
    let targetUsername = username?.trim() || "";
    let targetRole: SessionPayload["role"] = (role as any) || "USER";

    // Handle 1-Click Demo Profiles
    if (isAdmin) {
      targetEmail = "admin@ficforge.org";
      targetUsername = "admin_forge";
      targetRole = "SUPER_ADMIN";
    } else if (isDemo || (!targetEmail && !targetUsername)) {
      targetEmail = "valerius@ficforge.org";
      targetUsername = "valerius_f";
      targetRole = "USER";
    } else {
      if (!targetUsername && targetEmail) {
        targetUsername = targetEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
      }
      if (!targetEmail && targetUsername) {
        targetEmail = `${targetUsername}@ficforge.org`;
      }
    }

    // Upsert or fetch user in PostgreSQL database via Prisma
    let dbUser = null;
    try {
      dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: targetEmail, mode: "insensitive" } },
            { username: { equals: targetUsername, mode: "insensitive" } },
          ],
        },
        include: { profile: true },
      });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: targetEmail,
            username: targetUsername,
            role: targetRole === "SUPER_ADMIN" ? "SUPER_ADMIN" : "CREATOR",
            isVerified: true,
            profile: {
              create: {
                displayName: isAdmin
                  ? "FicForge Staff Admin"
                  : targetUsername === "valerius_f"
                  ? "Valerius Frost"
                  : targetUsername,
                bio: isAdmin
                  ? "FicForge System Operations & Trust & Safety Administrator"
                  : "Story author and avid fanfiction reader on FicForge.",
                avatarUrl: isAdmin
                  ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                  : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
              },
            },
            wallet: {
              create: {
                purchasedSparks: isAdmin ? 9999 : 250,
                bonusSparks: isAdmin ? 0 : 200,
                earnedSparks: 0,
              },
            },
          },
          include: { profile: true },
        });
      }
    } catch (dbErr) {
      console.warn("PostgreSQL user upsert notice:", dbErr);
    }

    // Build session payload
    const sessionUser: SessionPayload = {
      id: dbUser?.id || `user-${Date.now()}`,
      name:
        dbUser?.profile?.displayName ||
        (isAdmin ? "FicForge Staff Admin" : targetUsername === "valerius_f" ? "Valerius Frost" : targetUsername),
      username: dbUser?.username || targetUsername,
      email: dbUser?.email || targetEmail,
      role: dbUser?.role ? (dbUser.role as any) : targetRole,
      avatarUrl:
        dbUser?.profile?.avatarUrl ||
        (isAdmin
          ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
          : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"),
      sparksBalance: isAdmin ? 9999 : 450,
      membershipTier: isAdmin ? "ELITE" : "PLUS",
    };

    // Encrypt & issue HTTP-only session cookie
    await setServerSessionCookie(sessionUser);

    return NextResponse.json({
      success: true,
      user: sessionUser,
      message: "Authenticated successfully with encrypted HTTP-only session.",
    });
  } catch (error: any) {
    console.error("Login API route error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process login." },
      { status: 500 }
    );
  }
}
