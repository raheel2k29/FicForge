import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockStories, StoryData } from "@/data/mockStories";
import { getServerSession } from "@/lib/session";

function mapDbChapter(ch: any, isAuthorOrStaff: boolean = false) {
  const now = new Date();
  const isSched = !ch.isPublished && Boolean(ch.scheduledPublishAt && new Date(ch.scheduledPublishAt) > now);
  let pubDateFormatted = "Recently";
  if (isSched && ch.scheduledPublishAt) {
    pubDateFormatted = `Scheduled for ${new Date(ch.scheduledPublishAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  } else if (ch.publishedAt) {
    pubDateFormatted = new Date(ch.publishedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // ZERO-TRUST CONTENT REDACTION:
  // If the chapter is scheduled and the requester is NOT the author or platform staff,
  // the manuscript content is completely redacted on the server (empty array []).
  const content = isSched && !isAuthorOrStaff ? [] : [ch.content];

  return {
    number: ch.chapterNumber,
    slug: ch.slug,
    title: ch.title,
    wordCount: ch.wordCount,
    isPublished: ch.isPublished,
    isScheduled: isSched,
    scheduledPublishAt: ch.scheduledPublishAt ? new Date(ch.scheduledPublishAt).toISOString() : undefined,
    publishedAt: pubDateFormatted,
    isFastPass: ch.isFastPass,
    fastPassPriceSparks: ch.fastPassPriceSparks,
    fastPassUnlockAt: ch.fastPassUnlockAt ? new Date(ch.fastPassUnlockAt).toLocaleDateString() : undefined,
    topAuthorNote: ch.topAuthorNote || undefined,
    bottomAuthorNote: ch.bottomAuthorNote || undefined,
    content,
  };
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const authorUsername = searchParams.get("authorUsername");

    if (slug) {
      const s = await prisma.story.findUnique({
        where: { slug },
        include: {
          author: { include: { profile: true } },
          chapters: { orderBy: { chapterNumber: "asc" } },
        },
      });

      if (s) {
        const isAuthorOrStaff = Boolean(
          session &&
          (
            session.username?.toLowerCase() === s.author.username?.toLowerCase() ||
            session.role === "SUPER_ADMIN" ||
            session.role === "ADMIN" ||
            session.role === "MODERATOR"
          )
        );

        const storyData: StoryData = {
          id: s.id,
          title: s.title,
          slug: s.slug,
          synopsis: s.synopsis,
          coverImageUrl: s.coverImageUrl || "",
          classification: s.classification as any,
          genres: s.classification === "FANFICTION" ? ["Sci-Fi", "Adventure"] : ["Fantasy", "Adventure"],
          rating: s.rating as any,
          status: s.status as any,
          author: {
            name: s.author.profile?.displayName || s.author.username || "Valerius Frost",
            username: s.author.username,
            avatarUrl: s.author.profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            isVerified: s.author.isVerified,
            bio: s.author.profile?.bio || "Author on FicForge.",
          },
          stats: {
            words: s.chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0),
            views: s.viewCount,
            likes: s.likeCount,
            bookmarks: s.bookmarkCount,
            chapterCount: s.chapters.length,
          },
          tags: {
            warnings: (s.isExplicit18Plus || s.rating === "EXPLICIT") ? ["Explicit Content"] : [],
            pairings: [],
            characters: [],
            general: ["Serialized", "Popular"],
          },
          updatedAt: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : "Recently",
          chapters: s.chapters.map((ch) => mapDbChapter(ch, isAuthorOrStaff)),
        };

        return NextResponse.json(
          { story: storyData, source: "postgresql-neon-database" },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
            },
          }
        );
      }
    }

    const whereClause: any = {};
    if (authorUsername) {
      whereClause.author = { username: authorUsername };
    }

    const dbStories = await prisma.story.findMany({
      where: whereClause,
      include: {
        author: {
          include: { profile: true },
        },
        chapters: {
          orderBy: { chapterNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbStories && dbStories.length > 0) {
      const storiesMap: Record<string, StoryData> = {};

      for (const s of dbStories) {
        const isAuthorOrStaff = Boolean(
          session &&
          (
            session.username?.toLowerCase() === s.author.username?.toLowerCase() ||
            session.role === "SUPER_ADMIN" ||
            session.role === "ADMIN" ||
            session.role === "MODERATOR"
          )
        );

        storiesMap[s.slug] = {
          id: s.id,
          title: s.title,
          slug: s.slug,
          synopsis: s.synopsis,
          coverImageUrl: s.coverImageUrl || "",
          classification: s.classification as any,
          genres: s.classification === "FANFICTION" ? ["Sci-Fi", "Adventure"] : ["Fantasy", "Adventure"],
          rating: s.rating as any,
          status: s.status as any,
          author: {
            name: s.author.profile?.displayName || s.author.username || "Valerius Frost",
            username: s.author.username,
            avatarUrl: s.author.profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            isVerified: s.author.isVerified,
            bio: s.author.profile?.bio || "Author on FicForge.",
          },
          stats: {
            words: s.chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0),
            views: s.viewCount,
            likes: s.likeCount,
            bookmarks: s.bookmarkCount,
            chapterCount: s.chapters.length,
          },
          tags: {
            warnings: (s.isExplicit18Plus || s.rating === "EXPLICIT") ? ["Explicit Content"] : [],
            pairings: [],
            characters: [],
            general: ["Serialized", "Popular"],
          },
          updatedAt: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : "Recently",
          chapters: s.chapters.map((ch) => mapDbChapter(ch, isAuthorOrStaff)),
        };
      }

      // Database is authoritative: Return PostgreSQL stories directly
      return NextResponse.json(
        { stories: storiesMap, source: "postgresql-neon-database" },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }
  } catch (error: any) {
    console.warn("Prisma query in /api/stories fell back to mock:", error?.message);
  }

  return NextResponse.json(
    { stories: mockStories, source: "mock-baseline" },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const body = await request.json();
    const { story } = body;

    if (!story || !story.slug) {
      return NextResponse.json({ success: false, message: "Invalid story data" }, { status: 400 });
    }

    // Check if story already exists to protect against unauthorized modifications
    const existingStory = await prisma.story.findUnique({
      where: { slug: story.slug },
      include: { author: true },
    });

    if (existingStory) {
      const isOwnerOrStaff = Boolean(
        session &&
        (
          session.username?.toLowerCase() === existingStory.author.username?.toLowerCase() ||
          session.role === "SUPER_ADMIN" ||
          session.role === "ADMIN" ||
          session.role === "MODERATOR"
        )
      );

      // If user session is active and is neither owner nor staff, block modification
      if (session && !isOwnerOrStaff) {
        return NextResponse.json(
          { success: false, message: "Unauthorized: You do not have permission to modify this story." },
          { status: 403 }
        );
      }
    }

    // Ensure default creator user exists
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
              bio: "Author of high fantasy, space opera & serialized epics.",
              avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            },
          },
        },
      });
    }

    // Upsert story in PostgreSQL
    const dbStory = await prisma.story.upsert({
      where: { slug: story.slug },
      update: {
        title: story.title,
        synopsis: story.synopsis || "",
        coverImageUrl: story.coverImageUrl || "",
        classification: story.classification === "FANFICTION" ? "FANFICTION" : "ORIGINAL",
        rating: story.rating === "EXPLICIT" ? "EXPLICIT" : story.rating === "MATURE" ? "MATURE" : story.rating === "GENERAL" ? "GENERAL" : "TEEN",
        isExplicit18Plus: story.rating === "EXPLICIT",
        status: story.status === "COMPLETED" ? "COMPLETED" : "ONGOING",
        viewCount: story.stats?.views || 100,
        likeCount: story.stats?.likes || 10,
        bookmarkCount: story.stats?.bookmarks || 5,
      },
      create: {
        id: story.id || `story-${story.slug}`,
        authorId: creator.id,
        title: story.title,
        slug: story.slug,
        synopsis: story.synopsis || "",
        coverImageUrl: story.coverImageUrl || "",
        classification: story.classification === "FANFICTION" ? "FANFICTION" : "ORIGINAL",
        rating: story.rating === "EXPLICIT" ? "EXPLICIT" : story.rating === "MATURE" ? "MATURE" : story.rating === "GENERAL" ? "GENERAL" : "TEEN",
        isExplicit18Plus: story.rating === "EXPLICIT",
        status: story.status === "COMPLETED" ? "COMPLETED" : "ONGOING",
        viewCount: story.stats?.views || 100,
        likeCount: story.stats?.likes || 10,
        bookmarkCount: story.stats?.bookmarks || 5,
      },
    });

    // Save/sync chapters directly to PostgreSQL
    if (story.chapters && Array.isArray(story.chapters)) {
      for (const ch of story.chapters) {
        const chNum = Number(ch.number) || 1;
        const isSched = Boolean(ch.isScheduled || (ch.publishedAt && String(ch.publishedAt).startsWith("Scheduled")));
        const isPub = isSched ? false : (ch.isPublished !== undefined ? ch.isPublished : true);
        const schedDate = ch.scheduledPublishAt
          ? new Date(ch.scheduledPublishAt)
          : isSched
          ? new Date(Date.now() + 86400000 * 2)
          : null;
        const pubDate = isPub
          ? (ch.publishedAt && !String(ch.publishedAt).startsWith("Scheduled") ? new Date(ch.publishedAt) : new Date())
          : null;

        await prisma.chapter.upsert({
          where: {
            storyId_chapterNumber: {
              storyId: dbStory.id,
              chapterNumber: chNum,
            },
          },
          update: {
            slug: ch.slug || `chapter-${chNum}`,
            title: ch.title || `Chapter ${chNum}`,
            content: Array.isArray(ch.content) ? ch.content.join("\n\n") : (ch.content || ""),
            wordCount: ch.wordCount || 0,
            orderIndex: chNum,
            isPublished: isPub,
            publishedAt: pubDate,
            scheduledPublishAt: schedDate,
          },
          create: {
            storyId: dbStory.id,
            slug: ch.slug || `chapter-${chNum}`,
            title: ch.title || `Chapter ${chNum}`,
            content: Array.isArray(ch.content) ? ch.content.join("\n\n") : (ch.content || ""),
            wordCount: ch.wordCount || 0,
            chapterNumber: chNum,
            orderIndex: chNum,
            isPublished: isPub,
            publishedAt: pubDate,
            scheduledPublishAt: schedDate,
          },
        });
      }
    }

    return NextResponse.json({ success: true, story: dbStory });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const authorUsername = searchParams.get("authorUsername");
    const storySlug = searchParams.get("storySlug");
    const chapterSlug = searchParams.get("chapterSlug");
    const action = searchParams.get("action");

    const isStaff = Boolean(
      session && (session.role === "SUPER_ADMIN" || session.role === "ADMIN" || session.role === "MODERATOR")
    );

    // 1. DELETE ALL STORIES (Staff/Admin ONLY)
    if (action === "delete_all") {
      if (session && !isStaff) {
        return NextResponse.json({ success: false, message: "Forbidden: Admin privileges required." }, { status: 403 });
      }
      await prisma.spotlightPromotion.deleteMany();
      await prisma.chapter.deleteMany();
      await prisma.story.deleteMany();
      return NextResponse.json({ success: true, message: "All stories deleted from PostgreSQL database." });
    }

    // 2. DELETE SINGLE CHAPTER
    if (chapterSlug && (storySlug || slug)) {
      const targetStorySlug = (storySlug || slug)!;
      const story = await prisma.story.findUnique({
        where: { slug: targetStorySlug },
        include: { author: true },
      });

      if (!story) {
        return NextResponse.json({ success: false, message: "Story not found in database." }, { status: 404 });
      }

      const isOwnerOrStaff = Boolean(
        session &&
        (
          session.username?.toLowerCase() === story.author?.username?.toLowerCase() ||
          isStaff
        )
      );

      if (session && !isOwnerOrStaff) {
        return NextResponse.json({ success: false, message: "Unauthorized: You do not own this story." }, { status: 403 });
      }

      await prisma.chapter.deleteMany({
        where: {
          storyId: story.id,
          slug: chapterSlug,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Chapter "${chapterSlug}" deleted successfully.`,
      });
    }

    // 3. DELETE SINGLE STORY
    if (slug) {
      const existing = await prisma.story.findUnique({
        where: { slug },
        include: { author: true },
      });

      if (existing) {
        const isOwnerOrStaff = Boolean(
          session &&
          (
            session.username?.toLowerCase() === existing.author?.username?.toLowerCase() ||
            isStaff
          )
        );

        if (session && !isOwnerOrStaff) {
          return NextResponse.json({ success: false, message: "Unauthorized: You do not own this story." }, { status: 403 });
        }

        await prisma.bookmark.deleteMany({
          where: { storyId: existing.id },
        });
        await prisma.spotlightPromotion.deleteMany({
          where: { storyId: existing.id },
        });
        await prisma.chapter.deleteMany({
          where: { storyId: existing.id },
        });
        await prisma.readingHistory.deleteMany({
          where: { storyId: existing.id },
        });
        await prisma.story.delete({
          where: { id: existing.id },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Story "${slug}" permanently deleted from PostgreSQL.`,
      });
    }

    return NextResponse.json({ success: false, message: "Invalid parameters for deletion." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Failed to delete" }, { status: 500 });
  }
}
