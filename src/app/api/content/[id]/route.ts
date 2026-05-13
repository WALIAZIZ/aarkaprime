import { NextRequest, NextResponse } from "next/server";
import { deleteContent } from "@/lib/db-helpers";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Support userId from query or body
    const queryUserId = req.nextUrl.searchParams.get("userId");
    let bodyUserId: string | undefined;
    try {
      const body = await req.json();
      bodyUserId = body.userId;
    } catch {
      // No body — use query param
    }
    const userId = queryUserId || bodyUserId;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required (query param or body)" },
        { status: 400 }
      );
    }

    await deleteContent(id, userId);
    return NextResponse.json({ message: "Content deleted successfully" });
  } catch (error) {
    console.error("Delete content error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
