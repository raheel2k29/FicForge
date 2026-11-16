import { NextResponse } from "next/server";
import { clearServerSessionCookie } from "@/lib/session";

export async function POST() {
  try {
    await clearServerSessionCookie();
    return NextResponse.json({
      success: true,
      message: "Session cookie cleared successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}
