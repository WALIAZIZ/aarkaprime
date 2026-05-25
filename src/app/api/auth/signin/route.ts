import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db-helpers";
import { comparePassword } from "@/lib/auth-helpers";

interface SigninBody {
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SigninBody = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        country: (user as Record<string, unknown>).country as string || "kenya",
        role: user.role,
        plan: user.plan,
        monthlyGenerationsUsed: user.monthlyGenerationsUsed,
        monthlyGenerationsLimit: user.monthlyGenerationsLimit,
        activeListings: user.activeListings,
        maxListings: user.maxListings,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
