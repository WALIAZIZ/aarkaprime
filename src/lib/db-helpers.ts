import type { Property, GeneratedContent, Lead, User } from "@prisma/client";
import { db } from "./db";

// ─── Users ──────────────────────────────────────────────
export async function createUser(data: {
  email: string;
  name: string;
  company?: string;
  password: string;
}): Promise<User> {
  return db.user.create({ data });
}

export async function getUserById(id: string): Promise<User | null> {
  return db.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return db.user.findUnique({ where: { email } });
}

export async function updateUser(
  id: string,
  data: Partial<Pick<User, "name" | "email" | "company" | "plan">>
): Promise<User> {
  return db.user.update({ where: { id }, data });
}

export async function updateUserPlan(
  id: string,
  plan: string
): Promise<User> {
  const planLimits: Record<string, { generationsLimit: number; maxListings: number }> = {
    free: { generationsLimit: 10, maxListings: 3 },
    starter: { generationsLimit: 50, maxListings: 10 },
    pro: { generationsLimit: 200, maxListings: 50 },
    enterprise: { generationsLimit: 999999, maxListings: 999999 },
  };
  const limits = planLimits[plan] || planLimits.free;
  return db.user.update({
    where: { id },
    data: {
      plan,
      monthlyGenerationsLimit: limits.generationsLimit,
      maxListings: limits.maxListings,
    },
  });
}

export async function incrementGenerationCount(userId: string): Promise<User> {
  return db.user.update({
    where: { id: userId },
    data: { monthlyGenerationsUsed: { increment: 1 } },
  });
}

// ─── Properties ─────────────────────────────────────────
export async function createProperty(
  data: Omit<Property, "id" | "createdAt" | "updatedAt">
): Promise<Property> {
  return db.property.create({ data });
}

export async function getPropertiesByUser(userId: string): Promise<Property[]> {
  return db.property.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPropertyById(
  id: string,
  userId?: string
): Promise<Property | null> {
  return db.property.findFirst({
    where: { id, ...(userId ? { userId } : {}) },
    include: { generatedContent: true, leads: true },
  });
}

export async function updateProperty(
  id: string,
  userId: string,
  data: Partial<Omit<Property, "id" | "createdAt" | "updatedAt" | "userId">>
): Promise<Property> {
  return db.property.update({ where: { id, userId }, data });
}

export async function deleteProperty(
  id: string,
  userId: string
): Promise<Property> {
  return db.property.delete({ where: { id, userId } });
}

export async function countPropertiesByUser(userId: string): Promise<number> {
  return db.property.count({
    where: { userId, status: { in: ["active", "paused"] } },
  });
}

// ─── Generated Content ──────────────────────────────────
export async function createContent(
  data: Omit<GeneratedContent, "id" | "createdAt">
): Promise<GeneratedContent> {
  return db.generatedContent.create({ data });
}

export async function getContentByProperty(propertyId: string): Promise<GeneratedContent[]> {
  return db.generatedContent.findMany({
    where: { propertyId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getContentByUser(userId: string): Promise<GeneratedContent[]> {
  return db.generatedContent.findMany({
    where: { userId },
    include: { property: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function deleteContent(id: string, userId: string): Promise<GeneratedContent> {
  return db.generatedContent.delete({ where: { id, userId } });
}

// ─── Leads ──────────────────────────────────────────────
export async function createLead(
  data: Omit<Lead, "id" | "createdAt" | "updatedAt">
): Promise<Lead> {
  return db.lead.create({ data });
}

export async function getLeadsByUser(userId: string): Promise<Lead[]> {
  return db.lead.findMany({
    where: { userId },
    include: { property: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLeadsByProperty(propertyId: string): Promise<Lead[]> {
  return db.lead.findMany({
    where: { propertyId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateLeadStatus(
  id: string,
  userId: string,
  status: string
): Promise<Lead> {
  return db.lead.update({ where: { id, userId }, data: { status } });
}

export async function deleteLead(id: string, userId: string): Promise<Lead> {
  return db.lead.delete({ where: { id, userId } });
}

export async function countLeadsByStatus(userId: string): Promise<Record<string, number>> {
  const leads = await db.lead.findMany({
    where: { userId },
    select: { status: true },
  });
  const counts: Record<string, number> = {};
  for (const lead of leads) {
    counts[lead.status] = (counts[lead.status] || 0) + 1;
  }
  return counts;
}
