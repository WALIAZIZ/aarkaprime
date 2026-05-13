import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getSession() {
  return getServerSession(authOptions);
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  role: string;
  plan: string;
}

export function extractUser(session: Awaited<ReturnType<typeof getSession>>): AuthUser | null {
  if (!session?.user) return null;
  const u = session.user as Record<string, string>;
  return {
    id: u.id || "",
    email: u.email || "",
    name: u.name || null,
    company: u.company || null,
    role: u.role || "user",
    plan: u.plan || "free",
  };
}
