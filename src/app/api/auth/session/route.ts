import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, user: null, error: error?.message },
      { status: 500 }
    );
  }
}
