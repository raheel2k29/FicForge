import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INITIAL_CANONICAL_SPOTLIGHTS } from "@/lib/serverStore";

export async function GET() {
  try {
    const dbPromotions = await prisma.spotlightPromotion.findMany({
      where: { status: "ACTIVE" },
      include: {
        story: {
          include: {
            author: {
              include: { profile: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbPromotions && dbPromotions.length > 0) {
      const campaigns = dbPromotions.map((p) => ({
        id: p.id,
        storySlug: p.story.slug,
        storyTitle: p.story.title,
        coverImageUrl: p.story.coverImageUrl || "",
        authorName: p.story.author.profile?.displayName || p.story.author.username,
        classification: p.story.classification,
        startDate: p.startDate ? new Date(p.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
        endDate: p.endDate ? new Date(p.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
        startTimestamp: p.startDate ? new Date(p.startDate).getTime() : Date.now(),
        endTimestamp: p.endDate ? new Date(p.endDate).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000,
        cooldownTimestamp: p.endDate ? new Date(p.endDate).getTime() + 7 * 24 * 60 * 60 * 1000 : Date.now() + 14 * 24 * 60 * 60 * 1000,
        status: p.status,
        impressions: p.impressions,
        clicks: p.clicks,
      }));

      return NextResponse.json(
        {
          campaigns,
          active: campaigns,
          source: "postgresql-neon-database",
          timestamp: Date.now(),
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }
  } catch (error: any) {
    console.warn("Prisma query in /api/spotlight fell back to canonical:", error?.message);
  }

  // Graceful fallback to canonical spotlights if database is in cold-start awakening
  return NextResponse.json(
    {
      campaigns: INITIAL_CANONICAL_SPOTLIGHTS,
      active: INITIAL_CANONICAL_SPOTLIGHTS,
      source: "canonical-baseline",
      timestamp: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, storySlug, days = 7, campaignId } = body;

    if (action === "activate" && storySlug) {
      const story = await prisma.story.findUnique({
        where: { slug: storySlug },
      });

      if (!story) {
        return NextResponse.json({ success: false, message: "Story not found in PostgreSQL database." }, { status: 404 });
      }

      // Check if already active in database
      const existing = await prisma.spotlightPromotion.findFirst({
        where: {
          storyId: story.id,
          status: "ACTIVE",
          endDate: { gt: new Date() },
        },
      });

      if (existing) {
        return NextResponse.json({
          success: false,
          message: "Story is already actively featured in Creator Spotlight.",
        }, { status: 400 });
      }

      const now = new Date();
      const end = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      const created = await prisma.spotlightPromotion.create({
        data: {
          storyId: story.id,
          userId: story.authorId,
          creditsSpent: 1,
          status: "ACTIVE",
          startDate: now,
          endDate: end,
          impressions: 1,
          clicks: 0,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Spotlight activated successfully in PostgreSQL!",
        promotion: created,
      });
    }

    if (action === "end" && campaignId) {
      await prisma.spotlightPromotion.update({
        where: { id: campaignId },
        data: {
          status: "EXPIRED",
          endDate: new Date(),
        },
      });

      return NextResponse.json({ success: true, message: "Spotlight ended in database." });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
  }
}
