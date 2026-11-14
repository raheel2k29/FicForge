import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INITIAL_CANONICAL_SPOTLIGHTS } from "@/lib/serverStore";
import { mockStories } from "@/data/mockStories";

export async function GET() {
  try {
    const dbPromotions = await prisma.spotlightPromotion.findMany({
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
      const now = Date.now();
      const campaigns = dbPromotions.map((p) => {
        const startTs = p.startDate ? new Date(p.startDate).getTime() : now;
        const endTs = p.endDate ? new Date(p.endDate).getTime() : now + 7 * 24 * 60 * 60 * 1000;
        const isActuallyActive = p.status === "ACTIVE" && now < endTs;

        return {
          id: p.id,
          storySlug: p.story.slug,
          storyTitle: p.story.title,
          coverImageUrl: p.story.coverImageUrl || "",
          authorName: p.story.author.profile?.displayName || p.story.author.username || "Valerius Frost",
          classification: p.story.classification,
          startDate: p.startDate ? new Date(p.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
          endDate: p.endDate ? new Date(p.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
          startTimestamp: startTs,
          endTimestamp: endTs,
          cooldownTimestamp: endTs + 7 * 24 * 60 * 60 * 1000,
          status: isActuallyActive ? "ACTIVE" : ("EXPIRED" as const),
          impressions: p.impressions,
          clicks: p.clicks,
        };
      });

      const active = campaigns.filter((c) => c.status === "ACTIVE");

      return NextResponse.json(
        {
          campaigns,
          active,
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

  // Graceful fallback to canonical baseline
  const active = INITIAL_CANONICAL_SPOTLIGHTS.filter((c) => c.status === "ACTIVE");
  return NextResponse.json(
    {
      campaigns: INITIAL_CANONICAL_SPOTLIGHTS,
      active,
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

    // Ensure default creator exists in database
    let creator = await prisma.user.findFirst({
      where: {
        OR: [{ username: "valerius_f" }, { email: "creator@ficforge.org" }],
      },
    });

    if (!creator) {
      creator = await prisma.user.create({
        data: {
          id: "user-creator-demo",
          email: "creator@ficforge.org",
          username: "valerius_f",
          role: "CREATOR",
          isVerified: true,
          profile: {
            create: {
              displayName: "Valerius Frost",
              bio: "Author of high fantasy, space opera & serialized epics. Writing across multiple worlds.",
              avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            },
          },
        },
      });
    }

    // 1. ACTIVATE SPOTLIGHT
    if (action === "activate" && storySlug) {
      let story = await prisma.story.findUnique({
        where: { slug: storySlug },
      });

      // If story does not exist in DB yet (e.g. user created story in browser), auto-upsert into DB
      if (!story) {
        const mock = mockStories[storySlug];
        story = await prisma.story.create({
          data: {
            id: mock?.id || `story-${storySlug}`,
            authorId: creator.id,
            title: mock?.title || storySlug,
            slug: storySlug,
            synopsis: mock?.synopsis || "Serialized fiction story on FicForge.",
            classification: (mock?.classification as any) || "ORIGINAL",
            status: "ONGOING",
            rating: (mock?.rating as any) || "TEEN",
            coverImageUrl: mock?.coverImageUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
            viewCount: mock?.stats?.views || 1000,
            likeCount: mock?.stats?.likes || 120,
            bookmarkCount: mock?.stats?.bookmarks || 45,
          },
        });
      }

      const now = new Date();
      const end = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      // Check if existing campaign exists for this story
      const existing = await prisma.spotlightPromotion.findFirst({
        where: { storyId: story.id },
      });

      let promotion;
      if (existing) {
        promotion = await prisma.spotlightPromotion.update({
          where: { id: existing.id },
          data: {
            status: "ACTIVE",
            startDate: now,
            endDate: end,
            impressions: existing.impressions + 1,
          },
        });
      } else {
        promotion = await prisma.spotlightPromotion.create({
          data: {
            id: `spotlight-${story.slug}`,
            storyId: story.id,
            userId: creator.id,
            creditsSpent: 1,
            status: "ACTIVE",
            startDate: now,
            endDate: end,
            impressions: 1,
            clicks: 0,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Spotlight successfully activated for "${story.title}" in PostgreSQL!`,
        promotion,
      });
    }

    // 2. END SPOTLIGHT EARLY
    if (action === "end") {
      let target = null;
      if (campaignId) {
        target = await prisma.spotlightPromotion.findFirst({
          where: {
            OR: [
              { id: campaignId },
              { story: { slug: campaignId } },
              { storyId: campaignId },
            ],
          },
        });
      } else if (storySlug) {
        target = await prisma.spotlightPromotion.findFirst({
          where: { story: { slug: storySlug } },
        });
      }

      if (target) {
        await prisma.spotlightPromotion.update({
          where: { id: target.id },
          data: {
            status: "EXPIRED",
            endDate: new Date(),
          },
        });
      }

      return NextResponse.json({ success: true, message: "Spotlight ended in database." });
    }

    // 3. RESET TEST COOLDOWNS
    if (action === "reset_cooldowns") {
      await prisma.spotlightPromotion.updateMany({
        where: { status: "EXPIRED" },
        data: {
          endDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      });

      return NextResponse.json({ success: true, message: "Test cooldowns reset in database." });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Server error" }, { status: 500 });
  }
}
