import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  try {
    const prisma = new PrismaClient();
    
    try {
      // Create tables if they don't exist
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL,
          "name" TEXT,
          "company" TEXT,
          "password" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'user',
          "plan" TEXT NOT NULL DEFAULT 'free',
          "monthlyGenerationsUsed" INTEGER NOT NULL DEFAULT 0,
          "monthlyGenerationsLimit" INTEGER NOT NULL DEFAULT 10,
          "activeListings" INTEGER NOT NULL DEFAULT 0,
          "maxListings" INTEGER NOT NULL DEFAULT 3,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Add country column if it doesn't exist (migration for existing tables)
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'kenya';`);
      } catch {
        // Column already exists — that's fine
      }

      // Make email unique if not already (for fresh tables)
      try {
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`);
      } catch {
        // Index already exists
      }

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Property" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "propertyType" TEXT NOT NULL DEFAULT 'apartment',
          "location" TEXT NOT NULL,
          "neighborhood" TEXT,
          "price" DOUBLE PRECISION NOT NULL,
          "bedrooms" INTEGER NOT NULL DEFAULT 0,
          "bathrooms" INTEGER NOT NULL DEFAULT 0,
          "areaSqm" DOUBLE PRECISION,
          "features" TEXT NOT NULL,
          "description" TEXT,
          "status" TEXT NOT NULL DEFAULT 'active',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "GeneratedContent" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "propertyId" TEXT,
          "contentType" TEXT NOT NULL,
          "platform" TEXT,
          "language" TEXT NOT NULL DEFAULT 'english',
          "title" TEXT NOT NULL,
          "body" TEXT NOT NULL,
          "tokensUsed" INTEGER NOT NULL DEFAULT 0,
          "aiModel" TEXT NOT NULL DEFAULT 'deepseek',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Lead" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "propertyId" TEXT,
          "name" TEXT NOT NULL,
          "email" TEXT,
          "phone" TEXT,
          "message" TEXT,
          "source" TEXT NOT NULL DEFAULT 'website',
          "status" TEXT NOT NULL DEFAULT 'new',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$disconnect();
      return NextResponse.json({ status: "ready", database: "connected", tables: "created" });
    } catch (error) {
      console.error("[Setup] Table creation error:", error);
      await prisma.$disconnect();
      return NextResponse.json(
        { status: "error", error: String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Setup] Database error:", error);
    return NextResponse.json(
      { status: "error", error: String(error) },
      { status: 500 }
    );
  }
}
