import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

export async function POST() {
  try {
    const prisma = new PrismaClient();

    try {
      // Check if demo user already exists
      const existing = await prisma.user.findUnique({
        where: { email: "demo@estateiq.com" },
      });

      if (existing) {
        await prisma.$disconnect();
        return NextResponse.json({ status: "exists", message: "Demo data already seeded" });
      }

      // Create demo user
      const hashedPassword = await hash("demo1234", 12);
      const demoUser = await prisma.user.create({
        data: {
          email: "demo@estateiq.com",
          name: "Demo Agent",
          company: "Aarka Prime Realty",
          password: hashedPassword,
          role: "admin",
          plan: "pro",
          monthlyGenerationsUsed: 0,
          monthlyGenerationsLimit: 200,
          activeListings: 0,
          maxListings: 50,
        },
      });

      // Create demo properties
      await prisma.property.createMany({
        data: [
          {
            id: "prop_1",
            userId: demoUser.id,
            title: "Luxury 3BR Apartment in Westlands",
            propertyType: "apartment",
            location: "Westlands, Nairobi",
            neighborhood: "Westlands",
            price: 85000,
            bedrooms: 3,
            bathrooms: 2,
            areaSqm: 145,
            features: "Swimming Pool,Gym,Balcony,Security,Parking",
            description: "Stunning modern apartment with panoramic city views. Located in the heart of Westlands with easy access to shopping malls, restaurants, and entertainment. Perfect for professionals and families.",
            status: "active",
          },
          {
            id: "prop_2",
            userId: demoUser.id,
            title: "Modern 2BR Villa in Karen",
            propertyType: "villa",
            location: "Karen, Nairobi",
            neighborhood: "Karen",
            price: 120000,
            bedrooms: 2,
            bathrooms: 2,
            areaSqm: 200,
            features: "Garden,Parking,Security,DSQ,Electric Fence",
            description: "Beautiful garden villa in the serene Karen neighborhood. Features spacious rooms, modern finishes, and a large private garden. Ideal for families seeking tranquility.",
            status: "active",
          },
          {
            id: "prop_3",
            userId: demoUser.id,
            title: "Cozy Studio in Kilimani",
            propertyType: "apartment",
            location: "Kilimani, Nairobi",
            neighborhood: "Kilimani",
            price: 35000,
            bedrooms: 1,
            bathrooms: 1,
            areaSqm: 55,
            features: "WiFi,Laundry,Balcony,Security",
            description: "Compact and well-designed studio perfect for young professionals. Walking distance to Yaya Centre and popular restaurants.",
            status: "active",
          },
        ],
      });

      // Create demo generated content
      await prisma.generatedContent.createMany({
        data: [
          {
            id: "content_1",
            userId: demoUser.id,
            propertyId: "prop_1",
            contentType: "property_description",
            platform: "website",
            language: "english",
            title: "Luxury 3BR in Westlands - Property Listing",
            body: "Welcome to your dream home in Westlands! This stunning 3-bedroom apartment offers the perfect blend of luxury and convenience. Featuring modern finishes, spacious living areas, and breathtaking city views.\n\nKey highlights include a master suite with walk-in closet, open-plan kitchen with granite countertops, and a private balcony perfect for entertaining. The building boasts world-class amenities including a swimming pool, fully-equipped gym, and 24/7 security.\n\nLocated just minutes from Sarit Centre, Westgate Mall, and top restaurants. Don't miss this opportunity to own a piece of Nairobi's most sought-after neighborhood.",
            tokensUsed: 185,
            aiModel: "deepseek",
          },
          {
            id: "content_2",
            userId: demoUser.id,
            propertyId: "prop_1",
            contentType: "social_post",
            platform: "instagram",
            language: "english",
            title: "Instagram Post - Westlands Apartment",
            body: "Luxury living at its finest! 3BR apartment in Westlands with stunning city views. Swimming pool, gym, 24/7 security. Starting from KES 85,000/month.\n\nDM us for viewing!\n\n#NairobiRealEstate #Westlands #LuxuryLiving #ApartmentForRent #NairobiProperties #RealEstateKenya",
            tokensUsed: 120,
            aiModel: "deepseek",
          },
          {
            id: "content_3",
            userId: demoUser.id,
            propertyId: "prop_2",
            contentType: "whatsapp_message",
            platform: "whatsapp",
            language: "swahili",
            title: "WhatsApp - Nyumba Karen",
            body: "Habari! Nina nyumba bora ya kupanga Karen.\n\nVilla ya vyumba 2, bafuni 2, eneo la mita 200, na bustani kubwa. Iko mahali pazuri, karibu na barabara kuu na maduka.\n\nBei: KES 120,000/kwa mwezi\n\nUmechukua nini? Tunaweza kupanga viewing leo!",
            tokensUsed: 95,
            aiModel: "deepseek",
          },
        ],
      });

      // Create demo leads
      await prisma.lead.createMany({
        data: [
          {
            id: "lead_1",
            userId: demoUser.id,
            propertyId: "prop_1",
            name: "John Mwangi",
            email: "john.mwangi@email.com",
            phone: "+254712345678",
            message: "I'm interested in the Westlands apartment. Can I schedule a viewing this Saturday?",
            source: "website",
            status: "new",
          },
          {
            id: "lead_2",
            userId: demoUser.id,
            propertyId: "prop_2",
            name: "Sarah Wanjiku",
            email: "sarah.w@email.com",
            phone: "+254798765432",
            message: "Is the Karen villa pet-friendly? I have a small dog.",
            source: "whatsapp",
            status: "contacted",
          },
          {
            id: "lead_3",
            userId: demoUser.id,
            propertyId: "prop_1",
            name: "David Ochieng",
            email: "david.o@email.com",
            phone: "+254723456789",
            message: "What's the deposit amount and lease terms?",
            source: "instagram",
            status: "qualified",
          },
        ],
      });

      // Update user's active listings count
      await prisma.user.update({
        where: { id: demoUser.id },
        data: { activeListings: 3 },
      });

      await prisma.$disconnect();

      return NextResponse.json({
        status: "success",
        message: "Demo data seeded successfully",
        user: {
          email: "demo@estateiq.com",
          password: "demo1234",
        },
      });
    } catch (error) {
      console.error("[Seed] Error:", error);
      await prisma.$disconnect();
      return NextResponse.json(
        { status: "error", error: String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: String(error) },
      { status: 500 }
    );
  }
}
