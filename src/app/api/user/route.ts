import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser } from "@/lib/db-helpers";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

interface UpdateUserBody {
  userId: string;
  name?: string;
  email?: string;
  company?: string;
}

export async function PUT(req: NextRequest) {
  try {
    const body: UpdateUserBody = await req.json();
    const { userId, name, email, company } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const updateData: { name?: string; email?: string; company?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (company !== undefined) updateData.company = company;

    const updatedUser = await updateUser(userId, updateData);

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        company: updatedUser.company,
        role: updatedUser.role,
        plan: updatedUser.plan,
        monthlyGenerationsUsed: updatedUser.monthlyGenerationsUsed,
        monthlyGenerationsLimit: updatedUser.monthlyGenerationsLimit,
        activeListings: updatedUser.activeListings,
        maxListings: updatedUser.maxListings,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    await db.user.delete({ where: { id: userId } });
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
