import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [
      totalUsers,
      activeProperties,
      totalLeads,
      totalContent,
      users,
      recentLeads,
    ] = await Promise.all([
      db.user.count(),
      db.property.count({ where: { status: "active" } }),
      db.lead.count(),
      db.generatedContent.count(),
      db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          company: true,
          country: true,
          role: true,
          plan: true,
          monthlyGenerationsUsed: true,
          monthlyGenerationsLimit: true,
          activeListings: true,
          maxListings: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      db.lead.findMany({
        include: {
          user: { select: { name: true } },
          property: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    // Users by country — dynamic, counts any country code present
    const usersByCountry: Record<string, number> = {};
    users.forEach((u) => {
      const code = u.country || "unknown";
      usersByCountry[code] = (usersByCountry[code] || 0) + 1;
    });

    // Users by plan
    const usersByPlan = { free: 0, starter: 0, pro: 0, enterprise: 0 };
    users.forEach((u) => {
      const p = u.plan?.toLowerCase() || "free";
      if (p in usersByPlan) (usersByPlan as Record<string, number>)[p]++;
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        activeProperties,
        totalLeads,
        totalContent,
      },
      usersByCountry,
      usersByPlan,
      users,
      recentLeads,
    });
  } catch (error) {
    console.error("[Admin] Error:", error);
    return NextResponse.json(
      { error: "Failed to load admin data" },
      { status: 500 }
    );
  }
}
