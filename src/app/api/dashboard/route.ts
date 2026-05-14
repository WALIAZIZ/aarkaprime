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
      recentContent,
      recentLeads,
      userRecord,
      contentByLanguageRaw,
      leadsByMonthRaw,
      propertiesByStatusRaw,
      topPropertiesByContent,
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
        _min: { price: true },
        _max: { price: true },
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

      // Recent content (last 10)
      db.generatedContent.findMany({
        where: { userId },
        include: { property: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Recent leads (last 10)
      db.lead.findMany({
        where: { userId },
        include: { property: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // User record
      db.user.findUnique({ where: { id: userId } }),

      // Content by language
      db.generatedContent.groupBy({
        by: ["language"],
        where: { userId },
        _count: { language: true },
      }),

      // Leads by month (last 6 months)
      db.lead.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
        select: {
          createdAt: true,
        },
      }),

      // Properties by status
      db.property.groupBy({
        by: ["status"],
        where: { userId },
        _count: { status: true },
      }),

      // Top properties by content generated
      db.property.findMany({
        where: { userId },
        include: {
          _count: {
            select: { generatedContent: true },
          },
        },
        orderBy: {
          generatedContent: { _count: "desc" },
        },
        take: 5,
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
        if (key.includes("social")) leadsBySource["social-media"] += item._count.source;
        else if (key.includes("referral")) leadsBySource.referral += item._count.source;
      }
    }

    // Build day counts helper
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

    // Build month counts helper
    function buildMonthCounts(
      records: { createdAt: Date }[],
      months: number
    ): { month: string; count: number }[] {
      const monthMap = new Map<string, number>();
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthMap.set(key, 0);
      }
      for (const record of records) {
        const d = record.createdAt;
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (monthMap.has(key)) {
          monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
        }
      }
      return Array.from(monthMap.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => {
          // Sort by the month order in the map (preserves chronological)
          const keys = Array.from(monthMap.keys());
          return keys.indexOf(a.month) - keys.indexOf(b.month);
        });
    }

    const contentByDay = buildDayCounts(contentByDayRaw, 14);
    const leadsByDay = buildDayCounts(leadsByDayRaw, 30);
    const leadsByMonth = buildMonthCounts(leadsByMonthRaw, 6);

    // Build propertyTypes map
    const propertyTypes: Record<string, number> = {};
    for (const item of propertyTypesRaw) {
      propertyTypes[item.propertyType] = item._count.propertyType;
    }

    // Build properties by status
    const propertiesByStatus: Record<string, number> = {
      active: 0,
      pending: 0,
      sold: 0,
      inactive: 0,
    };
    for (const item of propertiesByStatusRaw) {
      const key = item.status.toLowerCase();
      if (key in propertiesByStatus) {
        propertiesByStatus[key] = item._count.status;
      }
    }

    // Build content by language
    const contentByLanguage: Record<string, number> = {
      english: 0,
      swahili: 0,
    };
    for (const item of contentByLanguageRaw) {
      const key = item.language.toLowerCase();
      if (key === "swahili" || key === "sw") {
        contentByLanguage.swahili += item._count.language;
      } else {
        contentByLanguage.english += item._count.language;
      }
    }

    // Price data
    const totalPropertyPrice = priceAggregation._sum.price ?? 0;
    const avgPropertyPrice = priceAggregation._avg.price ?? 0;
    const minPropertyPrice = priceAggregation._min.price ?? 0;
    const maxPropertyPrice = priceAggregation._max.price ?? 0;

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

    // Top content generators
    const topContentProperties = topPropertiesByContent.map((p) => ({
      id: p.id,
      title: p.title,
      contentCount: p._count.generatedContent,
    }));

    // User quota info
    const quotaUsed = userRecord?.monthlyGenerationsUsed ?? 0;
    const quotaLimit = userRecord?.monthlyGenerationsLimit ?? 10;

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
        leadsByMonth,
        propertyTypes,
        totalPropertyPrice,
        avgPropertyPrice,
        minPropertyPrice,
        maxPropertyPrice,
        conversionRate,
        propertiesByStatus,
        contentByLanguage,
        quotaUsed,
        quotaLimit,
      },
      propertyPerformance,
      topContentProperties,
      recentContent: recentContent.map((c) => ({
        id: c.id,
        title: c.title,
        contentType: c.contentType,
        language: c.language,
        createdAt: c.createdAt,
        propertyName: c.property?.title ?? null,
      })),
      recentLeads: recentLeads.map((l) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        phone: l.phone,
        status: l.status,
        source: l.source,
        createdAt: l.createdAt,
        propertyName: l.property?.title ?? null,
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
