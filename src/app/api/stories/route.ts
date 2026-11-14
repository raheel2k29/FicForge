import { NextResponse } from "next/server";
import { getServerStories, saveServerStory } from "@/lib/serverStore";

export async function GET() {
  const stories = getServerStories();
  return NextResponse.json(
    { stories },
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

    if (story && story.slug) {
      const stories = saveServerStory(story);
      return NextResponse.json({ success: true, stories });
    }

    return NextResponse.json({ success: false, message: "Invalid story data" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Server error" }, { status: 500 });
  }
}
