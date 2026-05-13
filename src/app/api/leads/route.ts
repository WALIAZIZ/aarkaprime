import { NextRequest, NextResponse } from "next/server";
import { getLeadsByUser, getLeadsByProperty, createLead } from "@/lib/db-helpers";

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
      const leads = await getLeadsByProperty(propertyId);
      return NextResponse.json({ leads });
    }

    const leads = await getLeadsByUser(userId);
    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

interface CreateLeadBody {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  propertyId?: string;
  source?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateLeadBody = await req.json();
    const { userId, name, email, phone, message, propertyId, source } = body;

    // Validate required fields
    if (!userId || !name) {
      return NextResponse.json(
        { error: "userId and name are required" },
        { status: 400 }
      );
    }

    const lead = await createLead({
      userId,
      name,
      email: email || null,
      phone: phone || null,
      message: message || null,
      propertyId: propertyId || null,
      source: source || "website",
      status: "new",
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error("Create lead error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
