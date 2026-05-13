import { NextRequest, NextResponse } from "next/server";
import {
  getPropertiesByUser,
  createProperty,
  countPropertiesByUser,
  getUserById,
} from "@/lib/db-helpers";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const properties = await getPropertiesByUser(userId);
    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Get properties error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

interface CreatePropertyBody {
  userId: string;
  title: string;
  propertyType: string;
  location: string;
  neighborhood?: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  features?: string[];
  description?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreatePropertyBody = await req.json();
    const {
      userId,
      title,
      propertyType,
      location,
      neighborhood,
      price,
      bedrooms,
      bathrooms,
      areaSqm,
      features,
      description,
    } = body;

    // Validate required fields
    if (!userId || !title || !propertyType || !location || price === undefined) {
      return NextResponse.json(
        { error: "userId, title, propertyType, location, and price are required" },
        { status: 400 }
      );
    }

    // Validate price
    if (typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    // Check user's listing count vs maxListings
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const currentCount = await countPropertiesByUser(userId);
    if (currentCount >= user.maxListings) {
      return NextResponse.json(
        {
          error: "Listing limit reached",
          details: {
            current: currentCount,
            max: user.maxListings,
          },
        },
        { status: 429 }
      );
    }

    // Create property
    const property = await createProperty({
      userId,
      title,
      propertyType,
      location,
      neighborhood: neighborhood || null,
      price,
      bedrooms: bedrooms ?? 0,
      bathrooms: bathrooms ?? 0,
      areaSqm: areaSqm ?? null,
      features: JSON.stringify(features || []),
      description: description || null,
      status: "active",
    });

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("Create property error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
