import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/lib/db-helpers";
import { hashPassword } from "@/lib/auth-helpers";

interface RegisterBody {
  name: string;
  email: string;
  company?: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RegisterBody = await req.json();
    const { name, email, company, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await createUser({
      email,
      name,
      company: company || null,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company: user.company,
          role: user.role,
          plan: user.plan,
          monthlyGenerationsUsed: user.monthlyGenerationsUsed,
          monthlyGenerationsLimit: user.monthlyGenerationsLimit,
          activeListings: user.activeListings,
          maxListings: user.maxListings,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
