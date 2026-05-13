import { NextRequest, NextResponse } from "next/server";
import { updateLeadStatus, deleteLead } from "@/lib/db-helpers";

interface UpdateLeadBody {
  userId: string;
  status: string;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateLeadBody = await req.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json(
        { error: "userId and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["new", "contacted", "qualified", "negotiation", "won", "lost"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updatedLead = await updateLeadStatus(id, userId, status);
    return NextResponse.json({ lead: updatedLead });
  } catch (error) {
    console.error("Update lead error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    await deleteLead(id, userId);
    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Delete lead error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
