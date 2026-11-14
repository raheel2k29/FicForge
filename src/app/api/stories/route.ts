import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockStories, StoryData } from "@/data/mockStories";

export async function GET() {
  try {
    const dbStories = await prisma.story.findMany({
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

      // Merge with any mock baseline stories that might not yet be in db
      const merged = { ...mockStories, ...storiesMap };

      return NextResponse.json(
        { stories: merged, source: "postgresql-neon-database" },
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

    return NextResponse.json({ success: true, story: dbStory });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Server error" }, { status: 500 });
  }
}
