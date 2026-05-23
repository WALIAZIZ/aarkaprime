import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Try a simple query to check database connection
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ready", database: "connected" });
  } catch (error) {
    console.error("[Setup] Database connection error:", error);
    return NextResponse.json(
      { status: "error", error: "Database connection failed. Please check DATABASE_URL." },
      { status: 500 }
    );
  }
}
