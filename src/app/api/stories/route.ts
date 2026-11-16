import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockStories, StoryData } from "@/data/mockStories";

export async function GET(request: Request) {
  try {
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
            words: s.chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0) || 45000,
            views: s.viewCount,
            likes: s.likeCount,
            bookmarks: s.bookmarkCount,
            chapterCount: s.chapters.length,
          },
          tags: {
            warnings: s.isExplicit18Plus ? ["Explicit Content"] : [],
            pairings: [],
            characters: [],
            general: ["Serialized", "Popular"],
          },
          updatedAt: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : "Recently",
          chapters: s.chapters.map((ch) => ({
            number: ch.chapterNumber,
            slug: ch.slug,
            title: ch.title,
            wordCount: ch.wordCount,
            publishedAt: ch.publishedAt ? new Date(ch.publishedAt).toLocaleDateString() : "Recently",
            content: [ch.content],
          })),
        };

        return NextResponse.json({ story: storyData, source: "postgresql-neon-database" });
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
            words: s.chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0) || 45000,
            views: s.viewCount,
            likes: s.likeCount,
            bookmarks: s.bookmarkCount,
            chapterCount: s.chapters.length,
          },
          tags: {
            warnings: s.isExplicit18Plus ? ["Explicit Content"] : [],
            pairings: [],
            characters: [],
            general: ["Serialized", "Popular"],
          },
          updatedAt: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : "Recently",
          chapters: s.chapters.map((ch) => ({
            number: ch.chapterNumber,
            slug: ch.slug,
            title: ch.title,
            wordCount: ch.wordCount,
            publishedAt: ch.publishedAt ? new Date(ch.publishedAt).toLocaleDateString() : "Recently",
            content: [ch.content],
          })),
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
    const body = await request.json();
    const { story } = body;

    if (!story || !story.slug) {
      return NextResponse.json({ success: false, message: "Invalid story data" }, { status: 400 });
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
            isPublished: true,
          },
          create: {
            storyId: dbStory.id,
            slug: ch.slug || `chapter-${chNum}`,
            title: ch.title || `Chapter ${chNum}`,
            content: Array.isArray(ch.content) ? ch.content.join("\n\n") : (ch.content || ""),
            wordCount: ch.wordCount || 0,
            chapterNumber: chNum,
            orderIndex: chNum,
            isPublished: true,
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
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const authorUsername = searchParams.get("authorUsername");
    const storySlug = searchParams.get("storySlug");
    const chapterSlug = searchParams.get("chapterSlug");
    const action = searchParams.get("action");

    // 1. DELETE ALL STORIES (Requested by user)
    if (action === "delete_all") {
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
      });

      if (!story) {
        return NextResponse.json({ success: false, message: "Story not found in database." }, { status: 404 });
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
        select: { id: true },
      });

      if (existing) {
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
