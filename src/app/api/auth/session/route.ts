import { NextResponse } from "next/server";
import { getServerSession, setServerSessionCookie } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    // Live reconciliation with Neon PostgreSQL database
    let dbUser = null;
    try {
      if (session.id) {
        dbUser = await prisma.user.findUnique({
          where: { id: session.id },
          include: { profile: true },
        });
      }
      if (!dbUser && (session.username || session.email)) {
        dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { username: session.username },
              { email: session.email },
            ],
          },
          include: { profile: true },
        });
      }
    } catch (dbErr) {
      console.warn("Session DB reconciliation warning:", dbErr);
    }

    let liveSession = session;
    if (dbUser) {
      const liveRole = dbUser.role as any;
      liveSession = {
        ...session,
        id: dbUser.id,
        role: liveRole,
        username: dbUser.username,
        email: dbUser.email,
        name: dbUser.profile?.displayName || session.name || dbUser.username,
        avatarUrl: dbUser.profile?.avatarUrl || session.avatarUrl,
      };

      // If database role changed (e.g. appointed as MODERATOR), re-issue encrypted session cookie
      if (liveRole !== session.role) {
        await setServerSessionCookie(liveSession);
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: liveSession,
    });
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, user: null, error: error?.message },
      { status: 500 }
    );
  }
}
