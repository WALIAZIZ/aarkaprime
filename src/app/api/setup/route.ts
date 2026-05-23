import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  try {
    const prisma = new PrismaClient();
    
    // Check if tables exist by trying a query
    try {
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
      return NextResponse.json({ status: "ready", database: "connected" });
    } catch (error) {
      await prisma.$disconnect();
      return NextResponse.json(
        { status: "error", error: "Database not connected. Please check DATABASE_URL environment variable in Vercel." },
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
