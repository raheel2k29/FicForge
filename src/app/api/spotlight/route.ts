import { NextResponse } from "next/server";
import {
  getServerSpotlights,
  getServerActiveSpotlights,
  activateServerSpotlight,
  endServerSpotlight,
  resetServerCooldowns,
} from "@/lib/serverStore";

export async function GET() {
  const campaigns = getServerSpotlights();
  const active = getServerActiveSpotlights();

  return NextResponse.json(
    {
      campaigns,
      active,
      timestamp: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, storySlug, campaignId } = body;

    if (action === "activate" && storySlug) {
      const result = activateServerSpotlight(storySlug, 7);
      const active = getServerActiveSpotlights();
      return NextResponse.json({
        success: result.success,
        message: result.message,
        campaigns: result.campaigns,
        active,
      });
    }

    if (action === "end" && campaignId) {
      const campaigns = endServerSpotlight(campaignId);
      const active = getServerActiveSpotlights();
      return NextResponse.json({
        success: true,
        campaigns,
        active,
      });
    }

    if (action === "reset_cooldowns") {
      const campaigns = resetServerCooldowns();
      const active = getServerActiveSpotlights();
      return NextResponse.json({
        success: true,
        campaigns,
        active,
      });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "Server error" }, { status: 500 });
  }
}
