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
        const startTs = p.startDate ? new Date(p.startDate).getTime() : 0;
        const endTs = p.endDate ? new Date(p.endDate).getTime() : 0;
        const isActuallyActive = p.status === "ACTIVE" && startTs > 0 && now < endTs;

        let status: "ACTIVE" | "EXPIRED" | "SCHEDULED" | "PENDING_APPROVAL" | "REJECTED" = "EXPIRED";
        if (p.status === "PENDING_REVIEW") {
          status = "PENDING_APPROVAL";
        } else if (p.status === "REJECTED") {
          status = "REJECTED";
        } else if (p.status === "ACTIVE") {
          status = isActuallyActive ? "ACTIVE" : "EXPIRED";
        }

        return {
          id: p.id,
          storySlug: p.story.slug,
          storyTitle: p.story.title,
          coverImageUrl: p.story.coverImageUrl || "",
          authorName: p.story.author.profile?.displayName || p.story.author.username || "Valerius Frost",
          classification: p.story.classification,
          rating: p.story.rating,
          isExplicit: p.story.rating === "EXPLICIT",
          startDate: p.status === "PENDING_REVIEW" ? "Pending Review" : (p.startDate ? new Date(p.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD"),
          endDate: p.status === "PENDING_REVIEW" ? "Pending Review" : (p.endDate ? new Date(p.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD"),
          startTimestamp: startTs,
          endTimestamp: endTs,
          cooldownTimestamp: endTs > 0 ? endTs + 7 * 24 * 60 * 60 * 1000 : 0,
          status,
          impressions: p.impressions,
          clicks: p.clicks,
        };
      });

      const active = campaigns.filter((c) => c.status === "ACTIVE");

      // Fetch live promo credits from PostgreSQL
      const membership = await prisma.platformMembership.findFirst({
        where: { user: { username: "valerius_f" } },
      });
      const promoCredits = membership?.promoCreditsBalance ?? 11;

      return NextResponse.json(
        {
          campaigns,
          active,
          promoCredits,
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
    const { action, storySlug, days = 1, creditsSpent, campaignId } = body;
    const finalCredits = creditsSpent ? Number(creditsSpent) : Math.max(2, Number(days) * 2);

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

      const isExplicit = story.rating === "EXPLICIT" || (mockStories[storySlug]?.rating === "EXPLICIT");
      const promoStatus = isExplicit ? "PENDING_REVIEW" : "ACTIVE";

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
            status: promoStatus,
            creditsSpent: finalCredits,
            startDate: isExplicit ? null : now,
            endDate: isExplicit ? null : end,
            impressions: existing.impressions + 1,
          },
        });
      } else {
        promotion = await prisma.spotlightPromotion.create({
          data: {
            id: `spotlight-${story.slug}`,
            storyId: story.id,
            userId: creator.id,
            creditsSpent: finalCredits,
            status: promoStatus,
            startDate: isExplicit ? null : now,
            endDate: isExplicit ? null : end,
            impressions: 1,
            clicks: 0,
          },
        });
      }

      // Deduct promo credits in PostgreSQL
      let updatedCredits = 11;
      const membership = await prisma.platformMembership.findFirst({
        where: { userId: creator.id },
      });
      if (membership) {
        const nextCredits = Math.max(0, membership.promoCreditsBalance - finalCredits);
        await prisma.platformMembership.update({
          where: { id: membership.id },
          data: { promoCreditsBalance: nextCredits },
        });
        updatedCredits = nextCredits;
      }

      const returnMsg = isExplicit
        ? `This story is rated Explicit (18+). Per platform safety guidelines, it has been placed in the Admin Review Queue and will go live once verified by a moderator.`
        : `Spotlight successfully activated for "${story.title}" in PostgreSQL for ${days} days (${finalCredits} credits redeemed)!`;

      return NextResponse.json({
        success: true,
        requiresApproval: isExplicit,
        message: returnMsg,
        promotion,
        promoCredits: updatedCredits,
      });
    }

    // 2. APPROVE SPOTLIGHT (ADMIN)
    if (action === "approve") {
      let target = await prisma.spotlightPromotion.findFirst({
        where: {
          OR: [
            { id: campaignId || "" },
            { story: { slug: campaignId || storySlug || "" } },
            { storyId: campaignId || "" },
          ],
        },
        include: { story: true },
      });

      const now = new Date();
      const end = new Date(Date.now() + (Number(days) || 7) * 24 * 60 * 60 * 1000);

      if (target) {
        await prisma.spotlightPromotion.update({
          where: { id: target.id },
          data: {
            status: "ACTIVE",
            startDate: now,
            endDate: end,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Spotlight approved for "${target?.story.title || "story"}"! Campaign is now live on the homepage.`,
      });
    }

    // 3. REJECT SPOTLIGHT (ADMIN)
    if (action === "reject") {
      let target = await prisma.spotlightPromotion.findFirst({
        where: {
          OR: [
            { id: campaignId || "" },
            { story: { slug: campaignId || storySlug || "" } },
            { storyId: campaignId || "" },
          ],
        },
        include: { story: true },
      });

      if (target) {
        await prisma.spotlightPromotion.update({
          where: { id: target.id },
          data: {
            status: "REJECTED",
            endDate: new Date(),
          },
        });

        // Refund promo credits to author
        const membership = await prisma.platformMembership.findFirst({
          where: { userId: target.userId },
        });
        if (membership) {
          await prisma.platformMembership.update({
            where: { id: membership.id },
            data: { promoCreditsBalance: membership.promoCreditsBalance + target.creditsSpent },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Explicit spotlight promotion request rejected. Promo credits refunded to author.",
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
