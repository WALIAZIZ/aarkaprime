import { NextRequest, NextResponse } from "next/server";
import { getContentByProperty, getContentByUser } from "@/lib/db-helpers";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const propertyId = req.nextUrl.searchParams.get("propertyId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    if (propertyId) {
      const content = await getContentByProperty(propertyId);
      return NextResponse.json({ content });
    }

    const content = await getContentByUser(userId);
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Get content error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
