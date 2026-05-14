import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    // Run all queries in parallel for performance
    const [
      totalProperties,
      activeProperties,
      totalContent,
      totalLeads,
      contentByTypeRaw,
      leadsByStatusRaw,
      leadsBySourceRaw,
      contentByDayRaw,
      leadsByDayRaw,
      propertyTypesRaw,
      priceAggregation,
      closedLeadsCount,
      propertiesWithCounts,
    ] = await Promise.all([
      // Total properties
      db.property.count({ where: { userId } }),

      // Active properties
      db.property.count({ where: { userId, status: "active" } }),

      // Total content
      db.generatedContent.count({ where: { userId } }),

      // Total leads
      db.lead.count({ where: { userId } }),

      // Content by type
      db.generatedContent.groupBy({
        by: ["contentType"],
        where: { userId },
        _count: { contentType: true },
      }),

      // Leads by status
      db.lead.groupBy({
        by: ["status"],
        where: { userId },
        _count: { status: true },
      }),

      // Leads by source
      db.lead.groupBy({
        by: ["source"],
        where: { userId },
        _count: { source: true },
      }),

      // Content by day (last 30 days)
      db.generatedContent.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
        select: {
          createdAt: true,
        },
      }),

      // Leads by day (last 30 days)
      db.lead.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
        select: {
          createdAt: true,
        },
      }),

      // Property types
      db.property.groupBy({
        by: ["propertyType"],
        where: { userId },
        _count: { propertyType: true },
      }),

      // Price aggregation
      db.property.aggregate({
        where: { userId },
        _sum: { price: true },
        _avg: { price: true },
      }),

      // Closed leads count
      db.lead.count({ where: { userId, status: "closed" } }),

      // Properties with content and lead counts
      db.property.findMany({
        where: { userId },
        include: {
          _count: {
            select: {
              generatedContent: true,
              leads: true,
            },
          },
        },
        orderBy: {
          leads: { _count: "desc" },
        },
        take: 10,
      }),
    ]);

    // Build contentByType map
    const contentByType: Record<string, number> = {
      description: 0,
      social_post: 0,
      whatsapp_msg: 0,
      email_campaign: 0,
      ad_copy: 0,
    };
    for (const item of contentByTypeRaw) {
      const key = item.contentType.toLowerCase();
      if (key in contentByType) {
        contentByType[key] = item._count.contentType;
      } else {
        // Map legacy/alternate keys
        if (key.includes("description")) contentByType.description += item._count.contentType;
        else if (key.includes("social")) contentByType.social_post += item._count.contentType;
        else if (key.includes("whatsapp")) contentByType.whatsapp_msg += item._count.contentType;
        else if (key.includes("email")) contentByType.email_campaign += item._count.contentType;
        else if (key.includes("ad") || key.includes("copy")) contentByType.ad_copy += item._count.contentType;
      }
    }

    // Build leadsByStatus map
    const leadsByStatus: Record<string, number> = {
      new: 0,
      contacted: 0,
      viewing: 0,
      negotiation: 0,
      closed: 0,
      lost: 0,
    };
    for (const item of leadsByStatusRaw) {
      const key = item.status.toLowerCase();
      if (key in leadsByStatus) {
        leadsByStatus[key] = item._count.status;
      }
    }

    // Build leadsBySource map
    const leadsBySource: Record<string, number> = {
      website: 0,
      "social-media": 0,
      referral: 0,
      phone: 0,
      email: 0,
    };
    for (const item of leadsBySourceRaw) {
      const key = item.source.toLowerCase().replace(/\s+/g, "-");
      if (key in leadsBySource) {
        leadsBySource[key] += item._count.source;
      } else {
        // Map alternate keys
        if (key.includes("social")) leadsBySource["social-media"] += item._count.source;
        else if (key.includes("referral")) leadsBySource.referral += item._count.source;
      }
    }

    // Build contentByDay array (last 14 days for display)
    function buildDayCounts(
      records: { createdAt: Date }[],
      days: number
    ): { date: string; count: number }[] {
      const dayMap = new Map<string, number>();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        dayMap.set(dateStr, 0);
      }
      for (const record of records) {
        const dateStr = record.createdAt.toISOString().split("T")[0];
        if (dayMap.has(dateStr)) {
          dayMap.set(dateStr, (dayMap.get(dateStr) ?? 0) + 1);
        }
      }
      return Array.from(dayMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    const contentByDay = buildDayCounts(contentByDayRaw, 14);
    const leadsByDay = buildDayCounts(leadsByDayRaw, 30);

    // Build propertyTypes map
    const propertyTypes: Record<string, number> = {};
    for (const item of propertyTypesRaw) {
      propertyTypes[item.propertyType] = item._count.propertyType;
    }

    // Price data
    const totalPropertyPrice = priceAggregation._sum.price ?? 0;
    const avgPropertyPrice = priceAggregation._avg.price ?? 0;

    // Conversion rate
    const conversionRate =
      totalLeads > 0
        ? Math.round((closedLeadsCount / totalLeads) * 100 * 100) / 100
        : 0;

    // Property performance data
    const propertyPerformance = propertiesWithCounts.map((p) => ({
      id: p.id,
      title: p.title,
      propertyType: p.propertyType,
      price: p.price,
      status: p.status,
      contentCount: p._count.generatedContent,
      leadCount: p._count.leads,
    }));

    return NextResponse.json({
      overview: {
        totalProperties,
        activeProperties,
        totalContent,
        totalLeads,
        contentByType,
        leadsByStatus,
        leadsBySource,
        contentByDay,
        leadsByDay,
        propertyTypes,
        totalPropertyPrice,
        avgPropertyPrice,
        conversionRate,
      },
      propertyPerformance,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
