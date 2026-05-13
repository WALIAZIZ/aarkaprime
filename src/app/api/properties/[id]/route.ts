import { NextRequest, NextResponse } from "next/server";
import { getPropertyById, updateProperty, deleteProperty } from "@/lib/db-helpers";

export async function GET(
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

    const property = await getPropertyById(id, userId);
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Get property error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

interface UpdatePropertyBody {
  userId: string;
  title?: string;
  propertyType?: string;
  location?: string;
  neighborhood?: string | null;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number | null;
  features?: string[];
  description?: string | null;
  status?: string;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdatePropertyBody = await req.json();
    const { userId, features, ...rest } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = { ...rest };
    if (features !== undefined) {
      updateData.features = JSON.stringify(features);
    }

    const updatedProperty = await updateProperty(id, userId, updateData);
    return NextResponse.json({ property: updatedProperty });
  } catch (error) {
    console.error("Update property error:", error);
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

    await deleteProperty(id, userId);
    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete property error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
