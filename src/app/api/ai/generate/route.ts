import { NextRequest, NextResponse } from "next/server";
import { getUserById, getPropertyById, createContent, incrementGenerationCount } from "@/lib/db-helpers";
import { generateContent } from "@/lib/ai";
import type { PropertyData } from "@/lib/ai";

// Vercel serverless function timeout — set to max allowed
export const maxDuration = 60;

interface GenerateBody {
  propertyId: string;
  contentType: string;
  language: string;
  userId: string;
  countryCode?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateBody = await req.json();
    const { propertyId, contentType, language, userId, countryCode: bodyCountryCode } = body;

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

    // Resolve country code: body > user profile > fallback to "kenya"
    const countryCode = bodyCountryCode || user.country || "kenya";

    // Check generation quota — super_admin and enterprise have unlimited
    if (user.role !== "super_admin" && user.plan !== "enterprise") {
      if (user.monthlyGenerationsUsed >= user.monthlyGenerationsLimit) {
        return NextResponse.json(
          {
            error: "Monthly generation limit reached. Please upgrade your plan for more generations.",
            details: {
              used: user.monthlyGenerationsUsed,
              limit: user.monthlyGenerationsLimit,
            },
          },
          { status: 429 }
        );
      }
    }

    // Get property — try with userId first, then without (for flexibility)
    let property = await getPropertyById(propertyId, userId);
    if (!property) {
      // Fallback: try getting property without userId check
      const { db } = await import("@/lib/db");
      property = await db.property.findUnique({
        where: { id: propertyId },
      });
    }

    if (!property) {
      return NextResponse.json(
        { error: "Property not found. Please select a valid property." },
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
      features: property.features ? property.features.split(",").map(f => f.trim()).filter(Boolean) : [],
      description: property.description || undefined,
    };

    // Generate content via AI engine
    let results;
    try {
      results = await generateContent(propertyData, contentType, language || "english", countryCode);
    } catch (aiError) {
      console.error("[AI Generation] Error:", aiError);
      // If AI fails completely, return a meaningful error
      return NextResponse.json(
        {
          error: "AI generation service is temporarily unavailable. Please try again in a moment.",
          details: aiError instanceof Error ? aiError.message : "Unknown error",
        },
        { status: 503 }
      );
    }

    // Save each generated result to DB
    const savedContent = [];
    for (const result of results) {
      try {
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
      } catch (saveError) {
        console.error("[AI Generation] Save error for result:", saveError);
        // If save fails, still include the result (unsaved)
        savedContent.push({
          id: `unsaved_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          userId,
          propertyId,
          contentType: result.contentType,
          platform: result.platform || null,
          language: result.language,
          title: result.title,
          body: result.body,
          tokensUsed: 0,
          aiModel: "deepseek",
          createdAt: new Date(),
        });
      }
    }

    // Increment user's generation count
    try {
      await incrementGenerationCount(userId);
    } catch (countError) {
      console.error("[AI Generation] Failed to increment count:", countError);
    }

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
