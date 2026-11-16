import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StoryData } from "@/data/mockStories";

function formatStory(s: any): StoryData {
  return {
    id: s.id,
    title: s.title,
    slug: s.slug,
    synopsis: s.synopsis,
    coverImageUrl: s.coverImageUrl || "",
    classification: s.classification,
    genres: s.classification === "FANFICTION" ? ["Sci-Fi", "Adventure"] : ["Fantasy", "Adventure"],
    rating: s.rating,
    status: s.status,
    author: {
      name: s.author?.profile?.displayName || s.author?.username || "FicForge Author",
      username: s.author?.username || "author",
      avatarUrl: s.author?.profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      isVerified: s.author?.isVerified || false,
      bio: s.author?.profile?.bio || "FicForge Creator",
    },
    stats: {
      words: s.chapters?.reduce((acc: number, c: any) => acc + (c.wordCount || 0), 0) || 0,
      views: s.viewCount,
      likes: s.likeCount,
      bookmarks: s.bookmarkCount,
      chapterCount: s.chapters?.length || 0,
    },
    tags: {
      warnings: s.isExplicit18Plus ? ["Explicit Content"] : [],
      pairings: [],
      characters: [],
      general: ["Serialized", "Library"],
    },
    updatedAt: s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : "Recently",
    chapters: (s.chapters || []).map((ch: any) => ({
      number: ch.chapterNumber,
      slug: ch.slug,
      title: ch.title,
      wordCount: ch.wordCount,
      publishedAt: ch.publishedAt ? new Date(ch.publishedAt).toLocaleDateString() : "Recently",
      content: [ch.content],
    })),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to view personal library", stories: [], slugs: [] },
        { status: 401 }
      );
    }

    // Find the user by ID or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { username: userId }],
      },
    });

    if (!user) {
      return NextResponse.json({ success: true, stories: [], slugs: [] });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: {
        story: {
          include: {
            author: {
              include: { profile: true },
            },
            chapters: {
              orderBy: { chapterNumber: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const stories = bookmarks.map((b) => formatStory(b.story));
    const slugs = bookmarks.map((b) => b.story.slug);

    return NextResponse.json(
      {
        success: true,
        stories,
        slugs,
        count: stories.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Prisma error in /api/library GET:", error);
    return NextResponse.json({ error: error?.message || "Failed to load library" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userEmail, userName, storySlug } = body;

    if (!userId || !storySlug) {
      return NextResponse.json(
        { error: "Authentication required: You must have an account to save stories to your library" },
        { status: 401 }
      );
    }

    // Find the target story
    const story = await prisma.story.findUnique({
      where: { slug: storySlug },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found in database" }, { status: 404 });
    }

    // Ensure the user exists in PostgreSQL Neon database
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { username: userId }, ...(userEmail ? [{ email: userEmail }] : [])],
      },
    });

    if (!dbUser) {
      const generatedUsername = (userName || userId).replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
      dbUser = await prisma.user.create({
        data: {
          id: userId,
          email: userEmail || `${generatedUsername}@ficforge.org`,
          username: generatedUsername,
          role: "READER",
          profile: {
            create: {
              displayName: userName || "FicForge Reader",
            },
          },
        },
      });
    }

    // Upsert bookmark in PostgreSQL
    await prisma.bookmark.upsert({
      where: {
        userId_storyId: {
          userId: dbUser.id,
          storyId: story.id,
        },
      },
      create: {
        userId: dbUser.id,
        storyId: story.id,
      },
      update: {},
    });

    // Increment story bookmark count
    const updatedStory = await prisma.story.update({
      where: { id: story.id },
      data: {
        bookmarkCount: { increment: 1 },
      },
      select: { bookmarkCount: true },
    });

    return NextResponse.json({
      success: true,
      isBookmarked: true,
      storySlug,
      bookmarkCount: updatedStory.bookmarkCount,
    });
  } catch (error: any) {
    console.error("Prisma error in /api/library POST:", error);
    return NextResponse.json({ error: error?.message || "Failed to save bookmark" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const storySlug = searchParams.get("storySlug");

    if (!userId || !storySlug) {
      return NextResponse.json(
        { error: "Authentication required to modify library" },
        { status: 401 }
      );
    }

    const story = await prisma.story.findUnique({
      where: { slug: storySlug },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { username: userId }],
      },
    });

    if (!dbUser) {
      return NextResponse.json({ success: true, isBookmarked: false });
    }

    // Remove bookmark record from PostgreSQL
    await prisma.bookmark.deleteMany({
      where: {
        userId: dbUser.id,
        storyId: story.id,
      },
    });

    // Decrement story bookmark count (min 0)
    if (story.bookmarkCount > 0) {
      await prisma.story.update({
        where: { id: story.id },
        data: {
          bookmarkCount: { decrement: 1 },
        },
      });
    }

    return NextResponse.json({
      success: true,
      isBookmarked: false,
      storySlug,
    });
  } catch (error: any) {
    console.error("Prisma error in /api/library DELETE:", error);
    return NextResponse.json({ error: error?.message || "Failed to remove bookmark" }, { status: 500 });
  }
}
