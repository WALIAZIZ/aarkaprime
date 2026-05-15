import { NextResponse } from "next/server";
import { initializeDb } from "@/lib/db";

export async function GET() {
  try {
    await initializeDb();
    return NextResponse.json({ status: "ready", database: "connected" });
  } catch (error) {
    console.error("[Setup] Database initialization error:", error);
    return NextResponse.json(
      { status: "error", error: "Database setup failed. Please try again in a moment." },
      { status: 500 }
    );
  }
}
