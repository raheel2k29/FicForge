import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      storySlug,
      storyTitle,
      chapterSlug,
      claimantName,
      claimantEmail,
      reason,
      originalWorkUrl,
      description,
      digitalSignature,
    } = body;

    // Validation
    if (!claimantName || !claimantEmail || !description) {
      return NextResponse.json(
        { success: false, message: "Please provide your name, email, and a description of the issue." },
        { status: 400 }
      );
    }

    // Build the story / chapter reference URL
    const targetUrl = chapterSlug
      ? `https://ficforge.org/story/${storySlug}/${chapterSlug}`
      : `https://ficforge.org/story/${storySlug}`;

    // Format the complaint description
    const fullDescription = [
      `[Category: ${reason || "GENERAL_REPORT"}]`,
      `Target Story: "${storyTitle || storySlug}"`,
      originalWorkUrl ? `Original Work Reference: ${originalWorkUrl}` : null,
      `Claimant Statement: ${description}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    // Create the TakedownTicket in Neon PostgreSQL
    const ticket = await prisma.takedownTicket.create({
      data: {
        claimantName: claimantName.trim(),
        claimantEmail: claimantEmail.trim(),
        copyrightedWorkDescription: fullDescription,
        allegedInfringingUrls: targetUrl,
        digitalSignature: (digitalSignature || claimantName).trim(),
        status: "OPEN",
        moderatorNotes: `Filed via Public Story Report Gateway on ${new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}.`,
      },
    });

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      message: `Your report has been logged under Ticket #${ticket.id.slice(-6).toUpperCase()}. FicForge governance staff will inspect the claim.`,
    });
  } catch (error: any) {
    console.error("Report submission error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to submit report. Please try again." },
      { status: 500 }
    );
  }
}
