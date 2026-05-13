import { NextRequest, NextResponse } from "next/server";
import { getUserById, getPropertyById, createContent, incrementGenerationCount } from "@/lib/db-helpers";
import { generateContent } from "@/lib/ai";
import type { PropertyData } from "@/lib/ai";

interface GenerateBody {
  propertyId: string;
  contentType: string;
  language: string;
  userId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateBody = await req.json();
    const { propertyId, contentType, language, userId } = body;

    // Validate required fields
    if (!propertyId || !contentType || !userId) {
      return NextResponse.json(
        { error: "propertyId, contentType, and userId are required" },
        { status: 400 }
      );
    }

    const validContentTypes = ["description", "social_post", "whatsapp_msg", "email_campaign", "ad_copy"];
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        { error: `Invalid contentType. Must be one of: ${validContentTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Get user and check quota
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.monthlyGenerationsUsed >= user.monthlyGenerationsLimit) {
      return NextResponse.json(
        {
          error: "Monthly generation limit reached",
          details: {
            used: user.monthlyGenerationsUsed,
            limit: user.monthlyGenerationsLimit,
          },
        },
        { status: 429 }
      );
    }

    // Get property
    const property = await getPropertyById(propertyId, userId);
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Build PropertyData from property record
    const propertyData: PropertyData = {
      title: property.title,
      propertyType: property.propertyType,
      location: property.location,
      neighborhood: property.neighborhood || undefined,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      areaSqm: property.areaSqm || undefined,
      features: JSON.parse(property.features || "[]"),
      description: property.description || undefined,
    };

    // Generate content via AI engine
    const results = await generateContent(propertyData, contentType, language || "english");

    // Save each generated result to DB
    const savedContent = [];
    for (const result of results) {
      const content = await createContent({
        userId,
        propertyId,
        contentType: result.contentType,
        platform: result.platform || null,
        language: result.language,
        title: result.title,
        body: result.body,
      });
      savedContent.push(content);
    }

    // Increment user's generation count
    await incrementGenerationCount(userId);

    return NextResponse.json({ results: savedContent }, { status: 201 });
  } catch (error) {
    console.error("AI generation error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
